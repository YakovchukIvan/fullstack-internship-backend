import { Controller, Get, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRoleGuard } from '@/modules/companies/guards/company-role.guard';
import { RequireCompanyRoles } from '@/modules/companies/decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryDto, PersonalAnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import {
  DurationStatsResponseDto,
  LeaderboardTableResponseDto,
  PerformanceDistributionResponseDto,
  ScoreDynamicsResponseDto,
  StreakResponseDto,
} from '../dto/res/analytics.res.dto';
import { AnalyticsRoutes } from '../routes/analytics.routes';
import { AnalyticsSwagger } from '@/common/constants/swagger-docs/analytics.swagger';
import type { JwtPayload } from '@/common/interface/jwt-payload.interface';

@Controller(AnalyticsRoutes.ROOT)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(AnalyticsRoutes.ME_STREAK)
  @ApiEndpoint(StreakResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_STREAK)
  @ResponseMessage('Streak fetched successfully')
  async getMyStreak(
    @CurrentUser() user: JwtPayload,
    @Query() query: PersonalAnalyticsQueryDto,
  ): Promise<StreakResponseDto> {
    return this.analyticsService.getMyStreak(user.sub, query);
  }

  @Get(AnalyticsRoutes.ME_DURATION)
  @ApiEndpoint(DurationStatsResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_DURATION)
  @ResponseMessage('Duration stats fetched successfully')
  async getMyDuration(
    @CurrentUser() user: JwtPayload,
    @Query() query: PersonalAnalyticsQueryDto,
  ): Promise<DurationStatsResponseDto> {
    return this.analyticsService.getMyDuration(user.sub, query);
  }

  @Get(AnalyticsRoutes.ME_DYNAMICS)
  @ApiEndpoint(ScoreDynamicsResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_DYNAMICS)
  @ResponseMessage('Score dynamics fetched successfully')
  async getMyDynamics(
    @CurrentUser() user: JwtPayload,
    @Query() query: PersonalAnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    return this.analyticsService.getMyDynamics(user.sub, query);
  }

  @Get(AnalyticsRoutes.ME_PERFORMANCE)
  @ApiEndpoint(PerformanceDistributionResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_PERFORMANCE)
  @ResponseMessage('Performance distribution fetched successfully')
  async getMyPerformance(
    @CurrentUser() user: JwtPayload,
    @Query() query: PersonalAnalyticsQueryDto,
  ): Promise<PerformanceDistributionResponseDto> {
    return this.analyticsService.getMyPerformance(user.sub, query);
  }

  @Get(AnalyticsRoutes.COMPANY_LEADERBOARD)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(LeaderboardTableResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_LEADERBOARD)
  @ResponseMessage('Leaderboard fetched successfully')
  async getCompanyLeaderboard(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaderboardTableResponseDto> {
    return this.analyticsService.getCompanyLeaderboard(slug, user.sub);
  }

  @Get(AnalyticsRoutes.COMPANY_DYNAMICS)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(ScoreDynamicsResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_DYNAMICS)
  @ResponseMessage('Company dynamics fetched successfully')
  async getCompanyDynamics(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    return this.analyticsService.getCompanyDynamics(slug, user.sub, query);
  }

  @Get(AnalyticsRoutes.COMPANY_USER_DYNAMICS)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(ScoreDynamicsResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_USER_DYNAMICS)
  @ResponseMessage('User dynamics fetched successfully')
  async getCompanyUserDynamics(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    return this.analyticsService.getCompanyUserDynamics(slug, userId, user.sub, query);
  }
}
