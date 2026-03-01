import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { calculateStreak } from '../helpers/streak.helper';
import { parseDateFilter } from '../helpers/analytics-date.helper';
import {
  toLeaderboardTableResponseDto,
  toPerformanceDistributionResponseDto,
  toScoreDynamicsResponseDto,
  toStreakResponseDto,
  toDurationStatsResponseDto,
} from '../mappers/analytics.mapper';
import {
  DurationStatsResponseDto,
  LeaderboardTableResponseDto,
  PerformanceDistributionResponseDto,
  ScoreDynamicsResponseDto,
  StreakResponseDto,
} from '../dto/res/analytics.res.dto';
import { AnalyticsQueryDto, PersonalAnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly companiesService: CompaniesService,
    private readonly companyMembersService: CompanyMembersService,
    private readonly companyMemberRepository: CompanyMemberRepository,
  ) {}

  async getMyStreak(userId: string, query: PersonalAnalyticsQueryDto): Promise<StreakResponseDto> {
    let companyId: string | undefined;

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      companyId = company.id;
    }

    const dates = await this.analyticsRepository.getUserAttemptDates(userId, companyId);
    return toStreakResponseDto(calculateStreak(dates));
  }

  async getMyDuration(userId: string, query: PersonalAnalyticsQueryDto): Promise<DurationStatsResponseDto> {
    let companyId: string | undefined;

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      companyId = company.id;
    }

    const { from, to } = parseDateFilter(query.from, query.to);

    const [stats, dynamics] = await Promise.all([
      this.analyticsRepository.getUserDurationStats(userId, from, to, companyId),
      this.analyticsRepository.getUserDurationDynamics(userId, from, to, companyId),
    ]);

    return toDurationStatsResponseDto(stats, dynamics);
  }

  async getMyDynamics(userId: string, query: PersonalAnalyticsQueryDto): Promise<ScoreDynamicsResponseDto> {
    let companyId: string | undefined;

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      companyId = company.id;
    }

    const { from, to } = parseDateFilter(query.from, query.to);
    const rows = await this.analyticsRepository.getUserScoreDynamics(userId, from, to, companyId);
    return toScoreDynamicsResponseDto(rows);
  }

  async getMyPerformance(
    userId: string,
    query: PersonalAnalyticsQueryDto,
  ): Promise<PerformanceDistributionResponseDto> {
    let companyId: string | undefined;

    if (query.companySlug) {
      const company = await this.companiesService.findBySlug(query.companySlug, userId);
      companyId = company.id;
    }

    const { from, to } = parseDateFilter(query.from, query.to);
    const attempts = await this.analyticsRepository.getUserAttemptsForPerformance(userId, from, to, companyId);
    return toPerformanceDistributionResponseDto(attempts);
  }

  async getCompanyLeaderboard(slug: string, userId: string): Promise<LeaderboardTableResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);

    const [rows, totalMembers] = await Promise.all([
      this.analyticsRepository.getLeaderboardByCompany(company.id),
      this.companyMemberRepository.count({ where: { companyId: company.id } }),
    ]);

    return toLeaderboardTableResponseDto(rows, totalMembers);
  }

  async getCompanyDynamics(slug: string, userId: string, query: AnalyticsQueryDto): Promise<ScoreDynamicsResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);
    const { from, to } = parseDateFilter(query.from, query.to);
    const rows = await this.analyticsRepository.getCompanyScoreDynamics(company.id, from, to);
    return toScoreDynamicsResponseDto(rows);
  }

  async getCompanyUserDynamics(
    slug: string,
    targetUserId: string,
    requesterId: string,
    query: AnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    const company = await this.companiesService.findBySlug(slug, requesterId);

    const membership = await this.companyMembersService.findMembershipBySlug(targetUserId, slug);
    GuardAssertions.exists(membership, 'Target user is not a member of this company');

    const { from, to } = parseDateFilter(query.from, query.to);
    const rows = await this.analyticsRepository.getCompanyUserScoreDynamics(company.id, targetUserId, from, to);
    return toScoreDynamicsResponseDto(rows);
  }
}
