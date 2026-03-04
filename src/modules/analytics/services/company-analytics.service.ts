import { Injectable } from '@nestjs/common';
import { UserAnalyticsRepository } from '../repositories/user-analytics.repository';
import { CompanyAnalyticsRepository } from '../repositories/company-analytics.repository';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';
import { parseDateFilter } from '../helpers/analytics-date.helper';
import { toLeaderboardEntries } from '../mappers/leaderboard.mapper';
import { toScoreDynamicsResponseDto } from '../mappers/dynamics.mapper';
import { toUserQuizSummaryItems, toQuizAttemptSummaryItems } from '../mappers/quiz-overview.mapper';
import { LeaderboardTableResponseDto } from '../dto/res/leaderboard.res.dto';
import { ScoreDynamicsResponseDto } from '../dto/res/dynamics.res.dto';
import { UserAnalyticsProfileDto } from '../dto/res/user-profile.res.dto';
import { UserQuizzesResponseDto, QuizAttemptsOverviewResponseDto } from '../dto/res/quiz-overview.res.dto';
import { AnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { MemberProfileAnalyticsService } from './member-profile-analytics.service';
import { AnalyticsPaginationDto } from '../dto/req/analytics-pagination.req.dto';
import { buildPaginationMeta } from '@/common/helpers/create-paginated-result.helper';
import { ANALYTICS_CONSTANTS } from '../constants/analytics.constants';

@Injectable()
export class CompanyAnalyticsService {
  constructor(
    private readonly userAnalyticsRepository: UserAnalyticsRepository,
    private readonly companyAnalyticsRepository: CompanyAnalyticsRepository,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly companyMemberRepository: CompanyMemberRepository,
    private readonly memberProfileAnalyticsService: MemberProfileAnalyticsService,
  ) {}

  async getCompanyLeaderboard(
    slug: string,
    requesterId: string,
    query: AnalyticsPaginationDto,
  ): Promise<LeaderboardTableResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const pagination = { page: query.page, limit: query.limit };

    const [{ rows, total }, totalMembers] = await Promise.all([
      this.companyAnalyticsRepository.getLeaderboardByCompany(company.id, pagination),
      this.companyMemberRepository.count({ where: { companyId: company.id } }),
    ]);

    return {
      leaderboard: toLeaderboardEntries(rows),
      totalMembers,
      minimumAttemptsRequired: ANALYTICS_CONSTANTS.MINIMUM_ATTEMPTS_FOR_RATING,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getCompanyDynamics(
    slug: string,
    requesterId: string,
    query: AnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const { from, to } = parseDateFilter(query.from, query.to);
    const rows = await this.companyAnalyticsRepository.getCompanyScoreDynamics(company.id, from, to);
    return toScoreDynamicsResponseDto(rows);
  }

  async getCompanyUserProfile(
    slug: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<UserAnalyticsProfileDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    await this.assertCompanyMember(targetUserId, slug);
    return this.memberProfileAnalyticsService.getMemberProfile(targetUserId, company.id);
  }

  async getCompanyUserQuizzes(
    slug: string,
    targetUserId: string,
    requesterId: string,
    query: AnalyticsPaginationDto,
  ): Promise<UserQuizzesResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    await this.assertCompanyMember(targetUserId, slug);

    const pagination = { page: query.page, limit: query.limit };
    const { rows, total } = await this.userAnalyticsRepository.getUserQuizzesSummary(
      targetUserId,
      company.id,
      pagination,
    );

    return {
      quizzes: toUserQuizSummaryItems(rows),
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getCompanyQuizAttempts(
    slug: string,
    quizId: string,
    requesterId: string,
    query: AnalyticsPaginationDto,
  ): Promise<QuizAttemptsOverviewResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);
    const pagination = { page: query.page, limit: query.limit };

    const [{ rows, total }, quizTitle] = await Promise.all([
      this.companyAnalyticsRepository.getQuizAttemptsSummary(quizId, company.id, pagination),
      this.companyAnalyticsRepository.getQuizTitle(quizId),
    ]);

    GuardAssertions.exists(quizTitle, 'Quiz not found in this company');

    return {
      quizId,
      quizTitle,
      totalParticipants: rows.length,
      attempts: toQuizAttemptSummaryItems(rows),
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private async assertCompanyMember(userId: string, slug: string): Promise<void> {
    const membership = await this.companyMembersService.findMembershipBySlug(userId, slug);
    GuardAssertions.exists(membership, 'Target user is not a member of this company');
  }
}
