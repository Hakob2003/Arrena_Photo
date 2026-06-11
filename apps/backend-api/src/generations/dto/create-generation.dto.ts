import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGenerationDto {
  @ApiPropertyOptional({ description: 'ID of the template to use (optional)' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ description: 'ID of the AI Model to use' })
  @IsString()
  @IsUUID()
  aiModelId: string;

  @ApiProperty({ description: 'The prompt text' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'Negative prompt' })
  @IsOptional()
  @IsString()
  negativePrompt?: string;
}
