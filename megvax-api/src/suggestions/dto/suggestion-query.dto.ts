import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SuggestionQueryDto {
  @IsUUID()
  accountId: string;

  @IsOptional() @IsString()
  status?: string; // PENDING | APPLIED | DISMISSED

  @IsOptional() @IsString()
  type?: string; // BUDGET | AUDIENCE | CREATIVE | BID | HEALTH | SCALING

  @IsOptional() @IsString()
  cursor?: string;

  @IsOptional()
  limit?: number;
}
