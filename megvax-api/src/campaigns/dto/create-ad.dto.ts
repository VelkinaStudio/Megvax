import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAdDto {
  @IsString()
  accountId: string;

  @IsString()
  adsetId: string;

  @IsString()
  name: string;

  @IsOptional() @IsObject()
  creativeSpec?: any;
}
