import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { QuizzesPaginationDto } from '../dto/req/quiz/quizzes-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class QuizRepository extends Repository<Quiz> {
  constructor(dataSource: DataSource) {
    super(Quiz, dataSource.createEntityManager());
  }

  async findOneInCompanyOrFail(id: string, companyId: string): Promise<Quiz> {
    const quiz = await this.findOne({ where: { id, companyId } });
    GuardAssertions.exists(quiz, `Quiz with ID ${id} not found in this company`);
    return quiz;
  }

  async findPaginatedByCompany(
    companyId: string,
    dto: QuizzesPaginationDto,
  ): Promise<PaginatedResultResponseDto<Quiz>> {
    return createPaginatedResult(this, dto, { where: { companyId } });
  }

  async findPaginatedByCreator(
    userId: string,
    companyId: string,
    dto: QuizzesPaginationDto,
  ): Promise<PaginatedResultResponseDto<Quiz>> {
    return createPaginatedResult(this, dto, {
      where: { createdByUserId: userId, companyId },
    });
  }
}
