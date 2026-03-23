import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateAdDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsObject()
  creativeSpec?: any;
}
