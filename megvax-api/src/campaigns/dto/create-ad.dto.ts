import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateAdDto {
  @IsUUID()
  accountId: string;

  @IsString()
  adsetId: string;

  @IsString()
  name: string;

  @IsOptional() @IsObject()
  creativeSpec?: { creative_id?: string; object_story_spec?: Record<string, unknown> };
}
