import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TargetingDto } from './targeting.dto';

export class CreateAdSetDto {
  @IsString()
  accountId: string;

  @IsString()
  campaignId: string;

  @IsString()
  name: string;

  @IsOptional() @ValidateNested() @Type(() => TargetingDto)
  targeting?: TargetingDto;

  @IsOptional() @IsObject()
  placements?: Record<string, string[]>;

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
