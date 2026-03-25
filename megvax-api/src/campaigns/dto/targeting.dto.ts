import { IsOptional, IsNumber, IsArray, IsObject, Min, Max } from 'class-validator';

export class TargetingDto {
  @IsOptional() @IsNumber() @Min(13) @Max(65)
  age_min?: number;

  @IsOptional() @IsNumber() @Min(13) @Max(65)
  age_max?: number;

  @IsOptional() @IsArray()
  genders?: number[];

  @IsOptional() @IsObject()
  geo_locations?: Record<string, string[]>;

  @IsOptional() @IsArray()
  interests?: { id: string; name: string }[];

  @IsOptional() @IsArray()
  excluded_interests?: { id: string; name: string }[];

  @IsOptional() @IsArray()
  custom_audiences?: { id: string; name: string }[];
}
