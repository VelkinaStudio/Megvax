import {
  Controller,
  Post,
  Get,
  Patch,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload, AuthenticatedRequest } from '../common/types/request.types';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ auth: { limit: 10, ttl: 900000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No refresh token' } });
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await this.authService.refreshToken(tokenHash);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await this.authService.logout(tokenHash);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ auth: { limit: 3, ttl: 900000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Auth()
  @Get('me')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Auth()
  @Patch('me')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Auth()
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
    // Clear refresh cookie — all sessions revoked, user must re-login
    res.clearCookie('refresh_token');
    return result;
  }

  @Auth()
  @Post('accept-invitation')
  @HttpCode(200)
  async acceptInvitation(
    @CurrentUser('sub') userId: string,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.authService.acceptInvitation(dto.token, userId);
  }

  // ── OAuth code exchange ──────────────────────────────────
  // Frontend exchanges a short-lived code for tokens via POST (no token in URL)

  @Throttle({ auth: { limit: 10, ttl: 900000 } })
  @Post('oauth/exchange')
  @HttpCode(200)
  async oauthExchange(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code) throw new BadRequestException('Missing authorization code');
    const result = await this.authService.exchangeOAuthCode(code);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  // ── Google OAuth ───────────────────────────────────────

  @Throttle({ auth: { limit: 10, ttl: 900000 } })
  @Get('google')
  googleRedirect(@Req() req: any, @Res() res: Response) {
    const clientId = this.config.get('GOOGLE_CLIENT_ID');
    if (!clientId) throw new BadRequestException('Google OAuth not configured');

    // Generate CSRF state token and store in cookie
    const state = crypto.randomBytes(32).toString('hex');
    this.setOAuthStateCookie(res, state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${this.getApiBase()}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!code) throw new BadRequestException('Missing authorization code');
    this.validateOAuthState(req, state);

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.getOrThrow('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow('GOOGLE_CLIENT_SECRET'),
        redirect_uri: `${this.getApiBase()}/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json() as any;
    if (!tokens.access_token) throw new BadRequestException('Google token exchange failed');

    // Get user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json() as any;
    if (!profile.email) throw new BadRequestException('Could not get Google profile');

    const result = await this.authService.oauthLogin('google', {
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.picture,
    });

    // Issue short-lived code instead of putting token in URL
    const oauthCode = await this.authService.createOAuthCode(result);
    this.setRefreshCookie(res, result.refreshToken);
    res.clearCookie('oauth_state');
    const frontendUrl = this.config.getOrThrow('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?provider=google&code=${oauthCode}`);
  }

  // ── Facebook OAuth ────────────────────────────────────

  @Throttle({ auth: { limit: 10, ttl: 900000 } })
  @Get('facebook')
  facebookRedirect(@Req() req: any, @Res() res: Response) {
    const appId = this.config.get('META_APP_ID');
    if (!appId) throw new BadRequestException('Facebook OAuth not configured');

    // Generate CSRF state token and store in cookie
    const state = crypto.randomBytes(32).toString('hex');
    this.setOAuthStateCookie(res, state);

    const configId = this.config.get<string>('META_LOGIN_CONFIG_ID');
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: `${this.getApiBase()}/auth/facebook/callback`,
      response_type: 'code',
      state,
    });
    // Facebook Login for Business uses config_id instead of scope
    if (configId) {
      params.set('config_id', configId);
    } else {
      params.set('scope', 'email');
    }
    res.redirect(`https://www.facebook.com/v25.0/dialog/oauth?${params}`);
  }

  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!code) throw new BadRequestException('Missing authorization code');
    this.validateOAuthState(req, state);

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      code,
      client_id: this.config.getOrThrow('META_APP_ID'),
      client_secret: this.config.getOrThrow('META_APP_SECRET'),
      redirect_uri: `${this.getApiBase()}/auth/facebook/callback`,
    });
    const tokenRes = await fetch(`https://graph.facebook.com/v25.0/oauth/access_token?${tokenParams}`);
    const tokens = await tokenRes.json() as any;
    if (!tokens.access_token) throw new BadRequestException('Facebook token exchange failed');

    // Get user profile
    const profileRes = await fetch(
      `https://graph.facebook.com/v25.0/me?fields=id,name,email,picture.type(large)&access_token=${tokens.access_token}`,
    );
    const profile = await profileRes.json() as any;
    if (!profile.email) throw new BadRequestException('Could not get Facebook profile. Ensure email permission is granted.');

    const result = await this.authService.oauthLogin('facebook', {
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.picture?.data?.url,
    });

    // Issue short-lived code instead of putting token in URL
    const oauthCode = await this.authService.createOAuthCode(result);
    this.setRefreshCookie(res, result.refreshToken);
    res.clearCookie('oauth_state');
    const frontendUrl = this.config.getOrThrow('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?provider=facebook&code=${oauthCode}`);
  }

  // ── Helpers ───────────────────────────────────────────

  private getApiBase(): string {
    const domain = this.config.get('RAILWAY_PUBLIC_DOMAIN');
    if (domain) return `https://${domain}`;
    return `http://localhost:${this.config.get('PORT', '4000')}`;
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 7 * 24 * 3600 * 1000, // 7 days
      path: '/auth',
    });
  }

  private setOAuthStateCookie(res: Response, state: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // must be lax for OAuth redirects
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/auth',
    });
  }

  private validateOAuthState(req: any, state: string) {
    const cookieState = req.cookies?.oauth_state;
    if (
      !cookieState ||
      !state ||
      cookieState.length !== state.length ||
      !crypto.timingSafeEqual(Buffer.from(cookieState), Buffer.from(state))
    ) {
      throw new BadRequestException('Invalid OAuth state — possible CSRF attack');
    }
  }
}
