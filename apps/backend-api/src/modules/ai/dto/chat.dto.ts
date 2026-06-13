import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({ description: 'Role of the message author', enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ description: 'The content of the message' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'List of chat messages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({ description: 'Specific model slug to use, defaults to openrouter/free' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'If true, stream the response back' })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}
