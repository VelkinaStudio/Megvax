import { IsOptional, IsString } from 'class-validator';

export class ActionQueryDto {
  @IsString()
  accountId: string;

  @IsOptional() @IsString()
  status?: string; // PENDING | SCHEDULED | EXECUTED | CANCELLED | FAILED

  @IsOptional() @IsString()
  from?: string;

  @IsOptional() @IsString()
  to?: string;

  @IsOptional() @IsString()
  cursor?: string;

  @IsOptional()
  limit?: number;
}
