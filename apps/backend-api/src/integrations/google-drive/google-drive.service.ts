import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private oauth2Client;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = `${this.configService.get<string>('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api')}/integrations/google-drive/callback`;

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  getAuthUrl(userId: string) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      state: userId, // Pass userId in state to link account on callback
    });
  }

  async handleCallback(code: string, userId: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      const existing = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'google-drive' }
      });

      if (existing) {
        await this.prisma.oAuthAccount.update({
          where: { id: existing.id },
          data: {
            accessToken: tokens.access_token,
            ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {})
          }
        });
      } else {
        await this.prisma.oAuthAccount.create({
          data: {
            userId,
            provider: 'google-drive',
            providerAccountId: 'drive-' + userId, 
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          }
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Google Drive OAuth error:', error);
      throw new BadRequestException('Failed to authenticate with Google Drive');
    }
  }

  async getStatus(userId: string) {
    let account = await this.prisma.oAuthAccount.findFirst({
      where: { 
        userId, 
        provider: 'google-drive',
        refreshToken: { not: null }
      }
    });

    if (!account) {
      account = await this.prisma.oAuthAccount.findFirst({
        where: { 
          userId, 
          provider: 'google',
          refreshToken: { not: null }
        }
      });
    }

    return {
      connected: !!account,
      provider: account?.provider,
    };
  }

  async disconnect(userId: string) {
    // We only delete 'google-drive' explicit connections. 
    // If they logged in via 'google', we shouldn't delete their login account.
    await this.prisma.oAuthAccount.deleteMany({
      where: { userId, provider: 'google-drive' }
    });
    return { success: true };
  }

  async saveImageToDrive(userId: string, imageUrl: string) {
    let account = await this.prisma.oAuthAccount.findFirst({
      where: { 
        userId, 
        provider: 'google-drive', 
        refreshToken: { not: null } 
      }
    });

    if (!account) {
      account = await this.prisma.oAuthAccount.findFirst({
        where: { 
          userId, 
          provider: 'google', 
          refreshToken: { not: null } 
        }
      });
    }

    if (!account) {
      throw new BadRequestException('Google Drive is not connected');
    }

    this.oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    let folderId = await this.getFolderId(drive, 'ArrenaPhoto');
    if (!folderId) {
      folderId = await this.createFolder(drive, 'ArrenaPhoto');
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      const buffer = await response.arrayBuffer();
      const stream = new Readable();
      stream.push(Buffer.from(buffer));
      stream.push(null);

      const fileMetadata = {
        name: `AI_Generated_${Date.now()}.png`,
        parents: [folderId]
      };
      
      const media = {
        mimeType: 'image/png',
        body: stream
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id'
      });

      return { success: true, fileId: file.data.id };
    } catch (error) {
      console.error('Failed to save to Drive:', error);
      throw new InternalServerErrorException('Failed to upload image to Google Drive');
    }
  }

  private async getFolderId(drive: any, folderName: string): Promise<string | null> {
    try {
      const res = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });
      const files = res.data.files;
      if (files && files.length > 0) {
        return files[0].id;
      }
    } catch (e) {
      console.error('Drive list error:', e);
    }
    return null;
  }

  private async createFolder(drive: any, folderName: string): Promise<string> {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });
    return file.data.id;
  }

  async streamFile(userId: string, fileId: string): Promise<Readable> {
    let account = await this.prisma.oAuthAccount.findFirst({
      where: { 
        userId, 
        provider: 'google-drive', 
        refreshToken: { not: null } 
      }
    });

    if (!account) {
      account = await this.prisma.oAuthAccount.findFirst({
        where: { 
          userId, 
          provider: 'google', 
          refreshToken: { not: null } 
        }
      });
    }

    if (!account) {
      throw new BadRequestException('Google Drive is not connected');
    }

    this.oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return response.data as Readable;
    } catch (error) {
      console.error('Failed to stream from Drive:', error);
      throw new InternalServerErrorException('Failed to load image from Google Drive');
    }
  }
}
