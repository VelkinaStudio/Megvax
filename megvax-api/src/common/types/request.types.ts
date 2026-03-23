import { Request } from 'express';

export interface JwtPayload {
  sub: string;        // userId
  workspaceId: string;
  role: string;
  impersonatedBy?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
