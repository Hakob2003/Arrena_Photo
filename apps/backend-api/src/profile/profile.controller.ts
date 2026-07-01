import { Controller, Get, Patch, Post, Delete, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Param, Res, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, UpdatePreferencesDto, UpdateNotificationsDto, UpdateSecurityDto } from './dto/profile.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '@arrena-photo/shared-types';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getProfile(@CurrentUser() user: IJwtPayload) {
    return this.profileService.getProfile(user.id);
  }

  @Patch('info')
  updatePersonalInfo(@CurrentUser() user: IJwtPayload, @Body() dto: UpdateProfileDto) {
    return this.profileService.updatePersonalInfo(user.id, dto);
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
        // Note: We don't have access to req.user strongly typed here in multer cb without casting
        cb(null, `${(req as any).user?.id || 'unknown'}-${uniqueSuffix}${ext}`);
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
  async uploadAvatar(@CurrentUser() user: IJwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    
    // URL to access the avatar
    const avatarUrl = `/api/profile/avatar/view/${file.filename}`;
    
    await this.profileService.updatePersonalInfo(user.id, { avatarUrl } as any);
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
  async deleteAvatar(@CurrentUser() user: IJwtPayload) {
    await this.profileService.updatePersonalInfo(user.id, { avatarUrl: null } as any);
    return { success: true };
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: IJwtPayload, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(user.id, dto);
  }

  @Patch('notifications')
  updateNotifications(@CurrentUser() user: IJwtPayload, @Body() dto: UpdateNotificationsDto) {
    return this.profileService.updateNotifications(user.id, dto);
  }

  @Patch('security/password')
  updatePassword(@CurrentUser() user: IJwtPayload, @Body() dto: UpdateSecurityDto) {
    return this.profileService.updatePassword(user.id, dto);
  }

  @Get('security/sessions')
  getSessions(@CurrentUser() user: IJwtPayload) {
    return this.profileService.getSessions(user.id);
  }

  @Post('security/logout-all')
  logoutAllDevices(@CurrentUser() user: IJwtPayload) {
    return this.profileService.logoutAllDevices(user.id, user.sessionId || '');
  }

  @Get('statistics')
  getStatistics(@CurrentUser() user: IJwtPayload) {
    return this.profileService.getStatistics(user.id);
  }

  @Get('activity')
  getActivity(@CurrentUser() user: IJwtPayload, @Query('page') page: string, @Query('limit') limit: string) {
    return this.profileService.getActivity(user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }
}
