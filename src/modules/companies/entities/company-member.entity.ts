import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from './company.entity';
import { Exclude } from 'class-transformer';
import { CompanyRole } from '@/common/enums/company-role.enum';

@Entity('company_members')
@Unique(['userId', 'companyId'])
@Index(['companyId'])
@Index(['userId'])
export class CompanyMember extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  @Exclude()
  userId: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: false })
  @Exclude()
  companyId: string;

  @Column({ type: 'enum', enum: CompanyRole, nullable: false })
  role: CompanyRole;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
