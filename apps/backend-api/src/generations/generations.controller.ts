import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IJwtPayload } from '@arrena-photo/shared-types';

@ApiTags('Generations')
@ApiBearerAuth()
@Controller('generations')
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Request a new image generation (async)' })
  create(@CurrentUser() user: IJwtPayload, @Body() createGenerationDto: CreateGenerationDto) {
    return this.generationsService.create(user.id, createGenerationDto);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get active AI models for generation' })
  getActiveModels() {
    return this.generationsService.getActiveModels();
  }

  @Get('history')
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get generation history for user' })
  getHistory(
    @CurrentUser() user: IJwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.generationsService.getHistory(user.id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get('feed/public')
  @ApiOperation({ summary: 'Get public generations feed' })
  getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.generationsService.getFeed(undefined, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get generation status and result' })
  getStatus(@CurrentUser() user: IJwtPayload, @Param('id') id: string) {
    return this.generationsService.getStatus(id, user.id);
  }

  @Post(':id/publish')
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Toggle publish status of generation' })
  publish(@CurrentUser() user: IJwtPayload, @Param('id') id: string, @Body('isPublic') isPublic: boolean) {
    return this.generationsService.publish(id, user.id, isPublic);
  }

  @Post(':id/like')
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Toggle like on generation' })
  toggleLike(@CurrentUser() user: IJwtPayload, @Param('id') id: string) {
    return this.generationsService.toggleLike(id, user.id);
  }

  @Post(':id/cancel')
  @Roles(RoleName.ADMIN, RoleName.MODERATOR, RoleName.CREATOR, RoleName.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Cancel a pending or processing generation' })
  cancel(@CurrentUser() user: IJwtPayload, @Param('id') id: string) {
    return this.generationsService.cancel(id, user.id);
  }
}
