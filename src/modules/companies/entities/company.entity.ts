import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CompanyMember } from './company-member.entity';
import { Exclude } from 'class-transformer';

@Entity('companies')
@Index(['slug'])
@Index(['ownerId'])
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  @Index()
  isVisible: boolean;

  @Column({ name: 'members_count', type: 'int', default: 1 })
  membersCount: number;

  @Column({ name: 'owner_id', type: 'uuid', nullable: false })
  @Exclude()
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CompanyMember, (member) => member.company)
  members?: CompanyMember[];
}
