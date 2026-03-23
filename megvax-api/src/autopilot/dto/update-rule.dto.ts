import { IsString, IsObject, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateRuleDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  trigger?: any;

  @IsOptional() @IsObject()
  action?: any;

  @IsOptional() @IsString()
  tier?: string;

  @IsOptional() @IsInt() @Min(5)
  cooldownMinutes?: number;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
