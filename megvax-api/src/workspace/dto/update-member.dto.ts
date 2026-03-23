import { IsIn } from 'class-validator';

export class UpdateMemberDto {
  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'])
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
