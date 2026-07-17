import { IsNumber, IsPositive, IsString, IsNotEmpty, IsObject } from 'class-validator';

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

  @IsNumber()
  @IsPositive()
  credits: number;
}

export class ValidateMerchantDto {
  @IsString()
  @IsNotEmpty()
  validationURL: string;
}
