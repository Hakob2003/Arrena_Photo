import { Controller, Get, Patch, Post, Delete, Body, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, Param, Res, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, UpdatePreferencesDto, UpdateNotificationsDto, UpdateSecurityDto } from './dto/profile.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch('info')
  updatePersonalInfo(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updatePersonalInfo(req.user.id, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = './uploads/avatars';
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${req.user['id']}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Only JPG, PNG and WEBP files are allowed'), false);
      }
      cb(null, true);
    }
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    
    // URL to access the avatar
    const avatarUrl = `/api/profile/avatar/view/${file.filename}`;
    
    await this.profileService.updatePersonalInfo(req.user.id, { avatarUrl } as any);
    return { success: true, avatarUrl };
  }

  @Public()
  @Get('avatar/view/:filename')
  viewAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads/avatars', filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Avatar not found');
    }
    return res.sendFile(filePath);
  }

  @Delete('avatar')
  async deleteAvatar(@Req() req: any) {
    await this.profileService.updatePersonalInfo(req.user.id, { avatarUrl: null } as any);
    return { success: true };
  }

  @Patch('preferences')
  updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(req.user.id, dto);
  }

  @Patch('notifications')
  updateNotifications(@Req() req: any, @Body() dto: UpdateNotificationsDto) {
    return this.profileService.updateNotifications(req.user.id, dto);
  }

  @Patch('security/password')
  updatePassword(@Req() req: any, @Body() dto: UpdateSecurityDto) {
    return this.profileService.updatePassword(req.user.id, dto);
  }

  @Get('security/sessions')
  getSessions(@Req() req: any) {
    return this.profileService.getSessions(req.user.id);
  }

  @Post('security/logout-all')
  logoutAllDevices(@Req() req: any) {
    // req.user.sessionId depends on how JwtAuthGuard populates the token. 
    // Usually we'd extract token ID. For now we assume req.user.sessionId exists or pass null to logout literally all
    return this.profileService.logoutAllDevices(req.user.id, req.user.sessionId || '');
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    return this.profileService.getStatistics(req.user.id);
  }

  @Get('activity')
  getActivity(@Req() req: any, @Query('page') page: string, @Query('limit') limit: string) {
    return this.profileService.getActivity(req.user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }
}
