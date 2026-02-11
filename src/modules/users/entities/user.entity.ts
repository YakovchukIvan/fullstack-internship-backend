import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Auth } from '@/modules/auth/entities/auth.entity';
import { Exclude } from 'class-transformer';
import { Company } from '@/modules/companies/entities/company.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToOne(() => Auth, (auth) => auth.user)
  @Exclude()
  auth?: Auth;

  @OneToMany(() => Company, (company) => company.owner)
  companies?: Company[];
}
