import { IsOptional, IsString, IsIn, IsDateString, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class InsightsQueryDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsIn(['ACCOUNT', 'CAMPAIGN', 'ADSET', 'AD'])
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  granularity?: string = 'day';
}

export class TopPerformersDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsIn(['spend', 'impressions', 'clicks', 'conversions', 'roas', 'ctr'])
  metric?: string = 'roas';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class CompareDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AccountSummaryDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
