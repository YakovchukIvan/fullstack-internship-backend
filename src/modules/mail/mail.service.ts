import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import formData from 'form-data';

/* eslint-disable */
@Injectable()
export class MailService {
  private readonly client;
  private readonly domain: string;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = process.env.MAIL_FROM;

    if (!apiKey || !domain || !from) {
      throw new Error('MAILGUN_API_KEY, MAILGUN_DOMAIN, MAIL_FROM must be set');
    }

    const mg = new Mailgun(formData);
    const url = process.env.MAILGUN_REGION === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';

    this.client = mg.client({ username: 'api', key: apiKey, url });
    this.domain = domain;
    this.from = from;
  }

  async sendTestEmail(to: string) {
    try {
      await this.client.messages.create(this.domain, {
        from: this.from,
        to: [to],
        subject: 'Mailgun test',
        text: 'If you got this email, Mailgun works ✅',
      });
    } catch (e: any) {
      const status = e?.status || e?.statusCode;
      const details = e?.details || e?.response?.body || e?.response?.data || e?.message;

      throw new InternalServerErrorException(
        `Mailgun send failed (${status ?? 'unknown status'}): ${JSON.stringify(details)}`,
      );
    }
  }
}
