import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGenerationDto {
  @ApiPropertyOptional({ description: 'ID of the template to use (optional)' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ description: 'ID or Name of the AI Model to use' })
  @IsString()
  aiModelId: string;

  @ApiPropertyOptional({ description: 'Base64 of the initial image for img2img' })
  @IsOptional()
  @IsString()
  initImage?: string;

  @ApiProperty({ description: 'The prompt text' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiPropertyOptional({ description: 'Aspect ratio, e.g. 1:1, 16:9' })
  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @ApiPropertyOptional({ description: 'Resolution preset, e.g. 1K, 2K, 4K, 8K' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ description: 'The UI skin to use for watermarking (e.g., NEON, LUXURY)' })
  @IsOptional()
  @IsString()
  skin?: string;
}
