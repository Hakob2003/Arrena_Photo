import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateVersionsService } from './template-versions.service';
import { TemplatesImportExportService } from './templates-import-export.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplateVersionsService, TemplatesImportExportService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
