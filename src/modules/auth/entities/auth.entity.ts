import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';

@Entity('auth')
@Check(`
  "password_hash" IS NOT NULL 
  OR "google_id" IS NOT NULL 
  OR "github_id" IS NOT NULL
`)
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true, unique: true })
  googleId: string | null;

  @Column({ name: 'github_id', type: 'varchar', length: 64, nullable: true, unique: true })
  githubId: string | null;

  @Column({ name: 'reset_password_token', type: 'varchar', length: 255, nullable: true })
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires_at', type: 'timestamptz', nullable: true })
  resetPasswordExpiresAt: Date | null;

  @Column({ name: 'refresh_token', type: 'varchar', length: 512, nullable: true })
  refreshToken: string | null;

  @OneToOne(() => User, (user) => user.auth)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
