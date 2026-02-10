import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly BCRYPT_ROUNDS = 10;
  private readonly RESET_TOKEN_LENGTH = 32;
  private readonly RESET_TOKEN_EXPIRY_HOURS = 1;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.BCRYPT_ROUNDS);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  generateResetToken(): string {
    return crypto.randomBytes(this.RESET_TOKEN_LENGTH).toString('hex');
  }

  hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  getResetTokenExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.RESET_TOKEN_EXPIRY_HOURS);
    return expiryDate;
  }

  isResetTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
