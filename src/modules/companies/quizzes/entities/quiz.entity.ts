import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Company } from '../../entities/company.entity';
import { ManyToOne, JoinColumn } from 'typeorm';
import type { QuizCreatedBySnapshot, QuizQuestion } from '../interfaces/quiz.interfaces';

@Entity('quizzes')
@Index(['companyId'])
@Index(['createdByUserId'])
export class Quiz extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', name: 'frequency_in_days' })
  frequencyInDays: number;

  @Column({ type: 'jsonb' })
  questions: QuizQuestion[];

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'created_by_user_id' })
  createdByUserId: string;

  @Column({ type: 'jsonb', name: 'created_by_snapshot' })
  createdBySnapshot: QuizCreatedBySnapshot;

  @Column({ type: 'boolean', default: false, name: 'is_ai_generated' })
  isAiGenerated: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'ai_prompt' })
  aiPrompt: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_metadata' })
  aiMetadata: {
    model: string;
    generatedAt: Date;
    difficulty: string;
  } | null;
}
