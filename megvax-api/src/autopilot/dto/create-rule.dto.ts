import { IsString, IsObject, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsObject()
  trigger: { metric: string; operator: string; threshold: number; window: string; entityScope?: string };

  @IsObject()
  action: { type: string; params: Record<string, any> };

  @IsString()
  tier: string; // AUTO | SUGGEST_ACT | SUGGEST_WAIT

  @IsOptional() @IsInt() @Min(5)
  cooldownMinutes?: number;

  @IsOptional() @IsBoolean()
  enabled?: boolean;
}
