import { IsOptional, IsString } from 'class-validator';

export class SuggestionQueryDto {
  @IsString()
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
