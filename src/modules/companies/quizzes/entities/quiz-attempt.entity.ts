import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Quiz } from '../entities/quiz.entity';
import { Company } from '../../entities/company.entity';
import { User } from '@/modules/users/entities/user.entity';
import { QuizAttemptAnswer } from '../interfaces/quiz-attempt.interfaces';

@Entity('quiz_attempts')
@Index(['userId'])
@Index(['quizId'])
@Index(['companyId'])
@Index(['userId', 'companyId'])
@Index(['userId', 'quizId'])
export class QuizAttempt extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'total_points', type: 'float' })
  totalPoints: number;

  @Column({ name: 'max_possible_points', type: 'int' })
  maxPossiblePoints: number;

  @Column({ type: 'jsonb' })
  answers: QuizAttemptAnswer[];

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
