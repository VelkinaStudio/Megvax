import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;
  private frontendUrl: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    this.from = this.config.get('FROM_EMAIL', 'noreply@megvax.com');
    this.frontendUrl = this.config.getOrThrow('FRONTEND_URL');
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(email, 'E-postanızı doğrulayın — MegVax', `
      <h2>MegVax'a hoş geldiniz!</h2>
      <p>E-postanızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">E-postamı Doğrula</a>
      <p>Bu bağlantı 24 saat geçerlidir.</p>
    `);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.send(email, 'Şifre sıfırlama — MegVax', `
      <h2>Şifre Sıfırlama</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Şifremi Sıfırla</a>
      <p>Bu bağlantı 1 saat geçerlidir. Siz talep etmediyseniz bu e-postayı görmezden gelin.</p>
    `);
  }

  async sendInvitationEmail(email: string, token: string, workspaceName: string, inviterName: string) {
    const url = `${this.frontendUrl}/signup?invitation=${token}`;
    await this.send(email, `${workspaceName} ekibine davet — MegVax`, `
      <h2>Ekip Daveti</h2>
      <p><strong>${inviterName}</strong> sizi <strong>${workspaceName}</strong> çalışma alanına davet etti.</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Daveti Kabul Et</a>
      <p>Bu bağlantı 7 gün geçerlidir.</p>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      // Don't throw — email failure shouldn't break auth flow
    }
  }
}
