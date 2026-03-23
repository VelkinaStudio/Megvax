import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsString()
  bidStrategy?: string;

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
