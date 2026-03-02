import { Injectable } from '@nestjs/common';
import { QuizAnswerRedisRepository } from '../repositories/quiz-answer-redis.repository';
import { CompaniesService } from '../../services/companies.service';
import { CompanyMembersService } from '../../services/company-members.service';
import { CsvExportService } from '../export/csv-export.service';
import { QuizAnswerSnapshot } from '../shared/interfaces/quiz-answer-snapshot.interface';
import { ExportQueryDto, PersonalExportQueryDto } from '../dto/req/export-query.req.dto';
import { CompanyExportResponseDto, ExportSummaryDto } from '../dto/res/export.res.dto';
import { UserExportResponseDto } from '@/modules/users/dto/res/quizzes/user-export.res.dto';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { toExportAttemptResponseDto } from '../shared/mappers/quiz-export-answer.mapper';
import { calculateAccuracy } from '../shared/helpers/quiz-math.helper';

@Injectable()
export class QuizExportService {
  constructor(
    private readonly quizAnswerRedisRepository: QuizAnswerRedisRepository,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly csvExportService: CsvExportService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async exportMyResults(userId: string, query: PersonalExportQueryDto): Promise<UserExportResponseDto> {
    let snapshots: QuizAnswerSnapshot[] = [];

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, userId);
    } else {
      snapshots = await this.quizAnswerRedisRepository.getUserAnswers(userId);
    }

    snapshots = this.applyFilters(snapshots, query);
    return this.buildUserExport(userId, snapshots);
  }

  async exportUserResults(
    slug: string,
    requesterId: string,
    targetUserId: string,
    query: ExportQueryDto,
  ): Promise<UserExportResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);

    const membership = await this.companyMembersService.findMembershipBySlug(targetUserId, slug);
    GuardAssertions.isTrueForbidden(!!membership, 'Target user is not a member of this company');

    let snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, targetUserId);
    snapshots = this.applyFilters(snapshots, query);

    return this.buildUserExport(targetUserId, snapshots);
  }

  async exportCompanyResults(
    slug: string,
    requesterId: string,
    query: ExportQueryDto,
  ): Promise<CompanyExportResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const snapshots = await this.getFilteredCompanySnapshots(company.id, query);
    return this.buildCompanyExport(company.id, snapshots);
  }

  async exportQuizResults(
    slug: string,
    requesterId: string,
    quizId: string,
    query: ExportQueryDto,
  ): Promise<CompanyExportResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const snapshots = await this.getFilteredCompanySnapshots(company.id, query, quizId);
    return this.buildCompanyExport(company.id, snapshots);
  }

  buildCsv(snapshots: QuizAnswerSnapshot[]): string {
    return this.csvExportService.toCSV(snapshots);
  }

  async getSnapshotsForMemberExport(
    userId: string,
    query: PersonalExportQueryDto,
  ): Promise<{ snapshots: QuizAnswerSnapshot[]; firstName: string; lastName: string }> {
    let snapshots: QuizAnswerSnapshot[] = [];

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, userId);
    } else {
      snapshots = await this.quizAnswerRedisRepository.getUserAnswers(userId);
    }

    const { firstName, lastName } = await this.getUserDisplayName(userId);

    return {
      snapshots: this.applyFilters(snapshots, query),
      firstName,
      lastName,
    };
  }

  async getSnapshotsForCompanyExport(
    slug: string,
    requesterId: string,
    query: ExportQueryDto,
    targetUserId?: string,
  ): Promise<{ snapshots: QuizAnswerSnapshot[]; firstName?: string; lastName?: string }> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(company.id, targetUserId);
    const filtered = this.applyFilters(snapshots, query);

    if (targetUserId) {
      const { firstName, lastName } = await this.getUserDisplayName(targetUserId);
      return { snapshots: filtered, firstName, lastName };
    }

    return { snapshots: filtered };
  }

  private applyFilters(snapshots: QuizAnswerSnapshot[], query: ExportQueryDto): QuizAnswerSnapshot[] {
    let result = snapshots;

    if (query.quizId) {
      result = result.filter((s) => s.quizId === query.quizId);
    }

    if (query.from) {
      const from = new Date(query.from).getTime();
      result = result.filter((s) => new Date(s.completedAt).getTime() >= from);
    }

    if (query.to) {
      const to = new Date(query.to).getTime();
      result = result.filter((s) => new Date(s.completedAt).getTime() <= to);
    }

    return result;
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
    let snapshots = await this.quizAnswerRedisRepository.getCompanyAnswers(companyId);

    if (quizId) {
      snapshots = snapshots.filter((s) => s.quizId === quizId);
    }

    return this.applyFilters(snapshots, query);
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
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
    return {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
