import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SocialLinksDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  telegram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  surname?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsString()
  fontSize?: string;

  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;

  @IsOptional()
  @IsBoolean()
  animationsEnabled?: boolean;

  @IsOptional()
  @IsString()
  skin?: string;
}

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyGenerations?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyNews?: boolean;

  @IsOptional()
  @IsBoolean()
  notifySystem?: boolean;
}

export class UpdateSecurityDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
