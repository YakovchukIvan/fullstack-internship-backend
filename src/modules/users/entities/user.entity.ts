import { Entity, Column, OneToOne, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Auth } from '@/modules/auth/entities/auth.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth?: Auth;
}
