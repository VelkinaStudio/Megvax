import { IsOptional, IsObject, IsInt, IsNumber, Min, Max } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional() @IsObject()
  actionTiers?: Record<string, string>; // { PAUSE_UNDERPERFORMER: 'AUTO', ... }

  @IsOptional() @IsInt() @Min(5) @Max(1440)
  suggestActDelayMinutes?: number;

  @IsOptional() @IsInt() @Min(5) @Max(100)
  budgetChangeMaxPercent?: number;

  @IsOptional() @IsNumber()
  minSpendBeforeAction?: number;

  @IsOptional() @IsObject()
  pauseThresholds?: { cpa_max?: number; roas_min?: number; frequency_max?: number };

  @IsOptional() @IsObject()
  scaleThresholds?: { roas_min?: number; conversions_min?: number };
}
