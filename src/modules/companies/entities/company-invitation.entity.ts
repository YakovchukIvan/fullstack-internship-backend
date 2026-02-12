import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from './company.entity';
import { Exclude } from 'class-transformer';

@Entity('company_invitations')
@Unique(['userId', 'companyId'])
@Index(['companyId'])
@Index(['userId'])
export class CompanyInvitation extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  @Exclude()
  userId: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: false })
  @Exclude()
  companyId: string;

  @Column({ name: 'invited_by', type: 'uuid', nullable: false })
  @Exclude()
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;
}
