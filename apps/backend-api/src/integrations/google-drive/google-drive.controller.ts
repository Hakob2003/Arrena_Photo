import { Controller, Get, Post, Query, Req, Res, UseGuards, Body, Param } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Integrations: Google Drive')
@Controller('integrations/google-drive')
export class GoogleDriveController {
  constructor(private readonly driveService: GoogleDriveService) {}

  @Get('auth-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Google Drive OAuth consent URL' })
  async getAuthUrl(@Req() req) {
    const url = this.driveService.getAuthUrl(req.user.id); // Note: JwtStrategy returns { id, email, role }
    return { url };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Google Drive OAuth callback' })
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res) {
    // state contains the userId
    if (!state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/connections/cloud?error=no_state`);
    }
    
    try {
      await this.driveService.handleCallback(code, state);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/connections/cloud?success=drive_connected`);
    } catch (e) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/connections/cloud?error=auth_failed`);
    }
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if Google Drive is connected' })
  async status(@Req() req) {
    return this.driveService.getStatus(req.user.id);
  }

  @Post('disconnect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disconnect Google Drive (if connected manually)' })
  async disconnect(@Req() req) {
    return this.driveService.disconnect(req.user.id);
  }

  @Post('save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save an image URL to Google Drive' })
  async saveImage(@Req() req, @Body('imageUrl') imageUrl: string) {
    return this.driveService.saveImageToDrive(req.user.id, imageUrl);
  }

  @Get('file/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Stream an image from Google Drive' })
  async getFile(@Req() req, @Param('id') id: string, @Res() res) {
    const stream = await this.driveService.streamFile(req.user.id, id);
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000',
    });
    stream.pipe(res);
  }
}
