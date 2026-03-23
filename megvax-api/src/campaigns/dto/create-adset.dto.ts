import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateAdSetDto {
  @IsString()
  accountId: string;

  @IsString()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional() @IsObject()
  targeting?: any;

  @IsOptional() @IsObject()
  placements?: any;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsNumber()
  bidAmount?: number;

  @IsOptional() @IsString()
  optimizationGoal?: string;

  @IsOptional() @IsString()
  billingEvent?: string;

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
