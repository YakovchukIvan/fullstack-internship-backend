import { Injectable } from '@nestjs/common';
import { UserAnalyticsRepository } from '../repositories/user-analytics.repository';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { parseDateFilter } from '../helpers/analytics-date.helper';
import { toUserQuizSummaryItems } from '../mappers/quiz-overview.mapper';
import { toDurationDynamicsResponseDto } from '../mappers/dynamics.mapper';
import { UserAnalyticsProfileDto } from '../dto/res/user-profile.res.dto';
import { UserQuizzesResponseDto } from '../dto/res/quiz-overview.res.dto';
import { DurationDynamicsResponseDto } from '../dto/res/dynamics.res.dto';
import { AnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import { MemberProfileAnalyticsService } from './member-profile-analytics.service';
import { AnalyticsPaginationDto } from '../dto/req/analytics-pagination.req.dto';
import { buildPaginationMeta } from '@/common/helpers/create-paginated-result.helper';

@Injectable()
export class MemberAnalyticsService {
  constructor(
    private readonly userAnalyticsRepository: UserAnalyticsRepository,
    private readonly companiesService: CompaniesService,
    private readonly memberProfileAnalyticsService: MemberProfileAnalyticsService,
  ) {}

  async getMyCompanyAnalytics(userId: string, slug: string): Promise<UserAnalyticsProfileDto> {
    const company = await this.companiesService.findBySlug(slug, userId);
    return this.memberProfileAnalyticsService.getMemberProfile(userId, company.id);
  }

  async getMyCompanyQuizzes(
    userId: string,
    slug: string,
    query: AnalyticsPaginationDto,
  ): Promise<UserQuizzesResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);
    const pagination = { page: query.page, limit: query.limit };
    const { rows, total } = await this.userAnalyticsRepository.getUserQuizzesSummary(userId, company.id, pagination);

    return {
      quizzes: toUserQuizSummaryItems(rows),
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getMyCompanyDurationDynamics(
    userId: string,
    slug: string,
    query: AnalyticsQueryDto,
  ): Promise<DurationDynamicsResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);
    const { from, to } = parseDateFilter(query.from, query.to);
    const rows = await this.userAnalyticsRepository.getUserDurationDynamics({
      userId,
      companyId: company.id,
      from,
      to,
    });
    return toDurationDynamicsResponseDto(rows);
  }
}
