import { IsOptional, IsString, IsIn, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkspaceSettingsDto {
  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsString() @IsIn(['TRY', 'USD', 'EUR', 'GBP'])
  currency?: string;
}

export class UpdateWorkspaceDto {
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @IsOptional() @ValidateNested() @Type(() => WorkspaceSettingsDto)
  settings?: WorkspaceSettingsDto;
}
