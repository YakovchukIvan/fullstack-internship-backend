import { Entity, Column, OneToOne, JoinColumn, Check } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('auth')
@Check(`
  "password_hash" IS NOT NULL 
  OR "google_id" IS NOT NULL 
`)
export class Auth extends BaseEntity {
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: 'reset_password_token_hash', type: 'varchar', length: 64, nullable: true })
  resetPasswordTokenHash: string | null;

  @Column({ name: 'reset_password_expires_at', type: 'timestamptz', nullable: true })
  resetPasswordExpiresAt: Date | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, nullable: true })
  refreshTokenHash: string | null;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
