import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Generations')
@ApiBearerAuth()
@Controller('generations')
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request a new image generation (async)' })
  create(@Req() req: any, @Body() createGenerationDto: CreateGenerationDto) {
    return this.generationsService.create(req.user.id, createGenerationDto);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get active AI models for generation' })
  getActiveModels() {
    return this.generationsService.getActiveModels();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get generation history for user' })
  getHistory(@Req() req: any) {
    return this.generationsService.getHistory(req.user.id);
  }

  @Get('feed/public')
  @ApiOperation({ summary: 'Get public generations feed' })
  getFeed(@Req() req: any) {
    return this.generationsService.getFeed();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get generation status and result' })
  getStatus(@Req() req: any, @Param('id') id: string) {
    return this.generationsService.getStatus(id, req.user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle publish status of generation' })
  publish(@Req() req: any, @Param('id') id: string, @Body('isPublic') isPublic: boolean) {
    return this.generationsService.publish(id, req.user.id, isPublic);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle like on generation' })
  toggleLike(@Req() req: any, @Param('id') id: string) {
    return this.generationsService.toggleLike(id, req.user.id);
  }
}
