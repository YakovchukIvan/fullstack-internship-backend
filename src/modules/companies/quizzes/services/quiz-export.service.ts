import { Injectable } from '@nestjs/common';
import { QuizAnswerRedisRepository } from '../repositories/quiz-answer-redis.repository';
import { CompaniesService } from '../../services/companies.service';
import { CompanyMembersService } from '../../services/company-members.service';
import { CsvExportService } from './csv-export.service';
import { QuizAnswerSnapshot } from '../shared/interfaces/quiz-answer-snapshot.interface';
import { ExportQueryDto } from '../dto/req/attempt/export-query.req.dto';
import { CompanyExportResponseDto, ExportSummaryDto, UserExportResponseDto } from '../dto/res/attempt/export.res.dto';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { toExportAttemptResponseDto } from '../shared/mappers/attempt/quiz-export-answer.mapper';
import { calculateAccuracy } from '../shared/helpers/quiz-math.helper';
import { UserRepository } from '@/modules/users/repositories/user.repository';

@Injectable()
export class QuizExportService {
  constructor(
    private readonly quizAnswerRedisRepository: QuizAnswerRedisRepository,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly csvExportService: CsvExportService,
    private readonly userRepository: UserRepository,
  ) {}

  async exportMyResults(
    slug: string,
    userId: string,
    query: ExportQueryDto,
  ): Promise<{ data: UserExportResponseDto; snapshots: QuizAnswerSnapshot[]; firstName: string; lastName: string }> {
    const company = await this.companiesService.findBySlug(slug, userId);
    const snapshots = this.applyFilters(
      await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, userId),
      query,
    );
    const { firstName, lastName } = await this.getUserDisplayName(userId);

    return { data: this.buildUserExport(userId, snapshots), snapshots, firstName, lastName };
  }

  async exportUserResults(
    slug: string,
    requesterId: string,
    targetUserId: string,
    query: ExportQueryDto,
  ): Promise<{ data: UserExportResponseDto; snapshots: QuizAnswerSnapshot[]; firstName: string; lastName: string }> {
    const company = await this.companiesService.findBySlug(slug, requesterId);

    const membership = await this.companyMembersService.findMembershipBySlug(targetUserId, slug);
    GuardAssertions.isTrueForbidden(!!membership, 'Target user is not a member of this company');

    const snapshots = this.applyFilters(
      await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, targetUserId),
      query,
    );
    const { firstName, lastName } = await this.getUserDisplayName(targetUserId);

    return { data: this.buildUserExport(targetUserId, snapshots), snapshots, firstName, lastName };
  }

  async exportCompanyResults(
    slug: string,
    requesterId: string,
    query: ExportQueryDto,
  ): Promise<{ data: CompanyExportResponseDto; snapshots: QuizAnswerSnapshot[] }> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const snapshots = await this.getFilteredCompanySnapshots(company.id, query);

    return { data: this.buildCompanyExport(company.id, snapshots), snapshots };
  }

  buildCsv(snapshots: QuizAnswerSnapshot[]): string {
    return this.csvExportService.toCSV(snapshots);
  }

  private applyFilters(snapshots: QuizAnswerSnapshot[], query: ExportQueryDto): QuizAnswerSnapshot[] {
    return query.quizId ? snapshots.filter((s) => s.quizId === query.quizId) : snapshots;
  }

  private buildUserExport(userId: string, snapshots: QuizAnswerSnapshot[]): UserExportResponseDto {
    return {
      userId,
      exportedAt: new Date().toISOString(),
      summary: this.buildSummary(snapshots),
      attempts: snapshots.map(toExportAttemptResponseDto),
    };
  }

  private buildSummary(snapshots: QuizAnswerSnapshot[]): ExportSummaryDto {
    if (snapshots.length === 0) {
      return { totalAttempts: 0, averageScore: 0, bestScore: 0, worstScore: 0 };
    }
    const scores = snapshots.map((s) => calculateAccuracy(s.totalPoints, s.maxPossiblePoints));
    return {
      totalAttempts: snapshots.length,
      averageScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
    };
  }

  private async getFilteredCompanySnapshots(
    companyId: string,
    query: ExportQueryDto,
    quizId?: string,
  ): Promise<QuizAnswerSnapshot[]> {
    const snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(companyId);
    const filtered = quizId ? snapshots.filter((s) => s.quizId === quizId) : snapshots;
    return this.applyFilters(filtered, query);
  }

  private buildCompanyExport(companyId: string, snapshots: QuizAnswerSnapshot[]): CompanyExportResponseDto {
    return {
      companyId,
      exportedAt: new Date().toISOString(),
      totalUsers: new Set(snapshots.map((s) => s.userId)).size,
      summary: this.buildSummary(snapshots),
      attempts: snapshots.map(toExportAttemptResponseDto),
    };
  }

  private async getUserDisplayName(userId: string): Promise<{ firstName: string; lastName: string }> {
    const user = await this.userRepository.findByIdOrFail(userId);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
