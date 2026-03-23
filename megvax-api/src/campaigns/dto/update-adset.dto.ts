import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class UpdateAdSetDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  targeting?: any;

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
}
