import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
@Index(['userId'])
@Index(['userId', 'isRead'])
@Index(['userId', 'isSeen'])
export class Notification extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_seen' })
  isSeen: boolean;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @Column({ name: 'quiz_id', type: 'uuid', nullable: true })
  quizId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quiz, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz | null;
}
