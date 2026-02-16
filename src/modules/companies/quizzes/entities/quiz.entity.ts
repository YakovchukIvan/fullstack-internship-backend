import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Company } from '../../entities/company.entity';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswers: number[];
  isMultiSelect: boolean;
}

@Entity('quizzes')
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
