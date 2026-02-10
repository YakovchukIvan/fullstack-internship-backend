import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { getEmailConfig, EmailConfig } from '@/config/email.config';
import { AppLogger } from '@/common/logger/app-logger';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly emailConfig: EmailConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(MailService.name);
    this.emailConfig = getEmailConfig(configService);

    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.password,
      },
    });

    void this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service ready', MailService.name);
      this.logger.log(`Sending emails from: ${this.emailConfig.fromEmail}`, MailService.name);
    } catch (err: unknown) {
      this.logger.error('❌ Email service connection failed:', this.formatUnknownError(err), MailService.name);
      this.logger.error('Check your EMAIL_* environment variables', MailService.name);
    }
  }

  async verifyHealth(): Promise<void> {
    await this.transporter.verify();
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.emailConfig.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions: Mail.Options = {
      from: { name: this.emailConfig.fromName, address: this.emailConfig.fromEmail },
      to,
      subject: 'Password Reset Request',
      text: this.getPasswordResetTextContent(resetUrl),
      html: this.getPasswordResetHtmlContent(resetUrl),
    };

    await this.sendEmail(mailOptions);
  }

  async sendOAuthLoginReminderEmail(to: string, provider: string): Promise<void> {
    const loginUrl = `${this.emailConfig.frontendUrl}/login`;

    const mailOptions: Mail.Options = {
      from: { name: this.emailConfig.fromName, address: this.emailConfig.fromEmail },
      to,
      subject: `Login with ${provider}`,
      text: this.getOAuthReminderTextContent(provider, loginUrl),
      html: this.getOAuthReminderHtmlContent(provider, loginUrl),
    };

    await this.sendEmail(mailOptions);
  }

  private async sendEmail(mailOptions: Mail.Options): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);

      this.logger.log('✅ Email sent', MailService.name);
    } catch (err: unknown) {
      this.logger.error('❌ Failed to send email', this.formatUnknownError(err), MailService.name);

      throw new InternalServerErrorException('Failed to send email');
    }
  }

  private formatUnknownError(err: unknown): string {
    if (err instanceof Error) {
      return `${err.name}: ${err.message}`;
    }
    if (typeof err === 'string') {
      return err;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  }

  private getPasswordResetHtmlContent(resetUrl: string): string {
    return `
      <html>
        <body>
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password.</p>
          <p><a href="${resetUrl}">Reset password</a></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <hr />
          <p>${this.emailConfig.fromName}</p>
        </body>
      </html>
    `;
  }

  private getPasswordResetTextContent(resetUrl: string): string {
    return `
      Reset Your Password
      We received a request to reset your password.
      Reset link:
      ${resetUrl}
      This link will expire in 1 hour.
      ${this.emailConfig.fromName}`.trim();
  }

  private getOAuthReminderHtmlContent(provider: string, loginUrl: string): string {
    return `
      <html>
        <body>
          <h2>Login with ${provider}</h2>
          <p>Your account is linked to ${provider}.</p>
          <p>You cannot reset a password for this account.</p>
          <p><a href="${loginUrl}">Go to login page</a></p>
          <hr />
          <p>${this.emailConfig.fromName}</p>
        </body>
      </html>
    `;
  }

  private getOAuthReminderTextContent(provider: string, loginUrl: string): string {
    return `
      Login with ${provider}
      Your account is linked to ${provider}.
      You cannot set/reset a password for this account.
      Login:
      ${loginUrl}
      ${this.emailConfig.fromName}`.trim();
  }
}
