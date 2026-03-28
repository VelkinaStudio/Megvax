import { IsString, IsUUID, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateCampaignDto {
  @IsUUID()
  accountId: string;

  @IsString()
  name: string;

  @IsString()
  objective: string;

  @IsOptional() @IsString()
  buyingType?: string;

  @IsOptional() @IsString()
  budgetType?: string;

  @IsOptional() @IsNumber()
  dailyBudget?: number;

  @IsOptional() @IsNumber()
  lifetimeBudget?: number;

  @IsOptional() @IsString()
  bidStrategy?: string;

  @IsOptional() @IsArray()
  specialAdCategories?: string[];

  @IsOptional() @IsString()
  startTime?: string;

  @IsOptional() @IsString()
  endTime?: string;
}
