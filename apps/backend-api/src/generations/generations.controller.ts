import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Generations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('generations')
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a new image generation (async)' })
  create(@Req() req: any, @Body() createGenerationDto: CreateGenerationDto) {
    return this.generationsService.create(req.user.id, createGenerationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generation status and result' })
  getStatus(@Req() req: any, @Param('id') id: string) {
    return this.generationsService.getStatus(id, req.user.id);
  }
}
