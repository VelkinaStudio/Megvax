import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CampaignQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'spend', 'status', 'createdAt', 'updatedAt'])
  sort?: string;
}

export class AdSetQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  adsetId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class TreeQueryDto {
  @IsString()
  accountId: string;
}
