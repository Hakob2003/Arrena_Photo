import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryUrls?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedModels?: string[];

  @ApiProperty()
  @IsString()
  prompt!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  settings?: any;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiProperty({ enum: TemplateStatus, required: false })
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;
}

export class FilterTemplatesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: TemplateStatus, required: false })
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}

export class ImportTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryName!: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedModels?: string[];
}

export class ImportTemplatesRequestDto {
  @IsArray()
  templates!: ImportTemplateDto[];
}

export enum BulkTemplateAction {
  PUBLISH = 'PUBLISH',
  DRAFT = 'DRAFT',
  ARCHIVE = 'ARCHIVE',
  DELETE = 'DELETE',
}

export class BulkActionDto {
  @ApiProperty({ enum: BulkTemplateAction })
  @IsEnum(BulkTemplateAction)
  action!: BulkTemplateAction;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  templateIds!: string[];
}
