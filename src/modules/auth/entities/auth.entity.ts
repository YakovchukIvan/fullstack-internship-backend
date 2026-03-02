import { Entity, Column, OneToOne, JoinColumn, Check } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { BaseEntity } from '@/common/entities/base.entity';
import { Exclude } from 'class-transformer';

@Entity('auth')
@Check(`
  "password_hash" IS NOT NULL 
  OR "google_id" IS NOT NULL 
`)
export class Auth extends BaseEntity {
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true, unique: true })
  @Exclude()
  googleId: string | null;

  @Column({ name: 'reset_password_token_hash', type: 'varchar', length: 64, nullable: true })
  @Exclude()
  resetPasswordTokenHash: string | null;

  @Column({ name: 'reset_password_expires_at', type: 'timestamptz', nullable: true })
  @Exclude()
  resetPasswordExpiresAt: Date | null;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  @Exclude()
  userId: string;

  @OneToOne(() => User, (user) => user.auth, { onDelete: 'CASCADE' })
  @Exclude()
  @JoinColumn({ name: 'user_id' })
  user: User;
}
