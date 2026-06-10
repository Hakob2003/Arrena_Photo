import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { TemplateVersionsService } from './template-versions.service';
import { TemplatesImportExportService } from './templates-import-export.service';
import { CreateTemplateDto, UpdateTemplateDto, FilterTemplatesDto } from './dto/template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TemplateStatus } from '@prisma/client';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly versionsService: TemplateVersionsService,
    private readonly importExportService: TemplatesImportExportService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new template' })
  async create(@CurrentUser() user: any, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Find templates with filtering and pagination' })
  async findAll(@Query() query: FilterTemplatesDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a template (creates a new version if prompt changes)' })
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a template' })
  async publish(@Param('id') id: string) {
    return this.templatesService.setStatus(id, TemplateStatus.PUBLISHED);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a template' })
  async archive(@Param('id') id: string) {
    return this.templatesService.setStatus(id, TemplateStatus.ARCHIVED);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get similar recommended templates' })
  async getRecommendations(@Param('id') id: string) {
    return this.templatesService.getRecommendations(id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a template' })
  async getVersions(@Param('id') id: string) {
    return this.versionsService.getVersions(id);
  }

  @Get('export/:id')
  @ApiOperation({ summary: 'Export template to JSON' })
  async exportTemplate(@Param('id') id: string) {
    return this.importExportService.exportTemplate(id);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import template from JSON' })
  async importTemplate(@CurrentUser() user: any, @Body() data: any) {
    return this.importExportService.importTemplate(user.id, data);
  }
}
