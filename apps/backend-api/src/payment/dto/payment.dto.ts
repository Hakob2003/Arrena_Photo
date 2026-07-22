import { IsNumber, IsPositive, IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  credits: number;
}

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planName: string;
}

export class ProcessWalletDto {
  @IsNotEmpty()
  token: any;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: 'CREDITS' | 'SUBSCRIPTION';

  @IsOptional()
  @IsString()
  planName?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  credits?: number;
}

export class ValidateMerchantDto {
  @IsString()
  @IsNotEmpty()
  validationURL: string;
}

export class ChargeSavedCardDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: 'CREDITS' | 'SUBSCRIPTION';

  @IsOptional()
  @IsString()
  planName?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  credits?: number;
}
