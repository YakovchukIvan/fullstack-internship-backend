import { Controller, Get, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRoleGuard } from '@/modules/companies/guards/company-role.guard';
import { RequireCompanyRoles } from '@/modules/companies/decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CompanyAnalyticsService } from '../services/company-analytics.service';
import { AnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import { LeaderboardTableResponseDto } from '../dto/res/leaderboard.res.dto';
import { ScoreDynamicsResponseDto } from '../dto/res/dynamics.res.dto';
import { UserAnalyticsProfileDto } from '../dto/res/user-profile.res.dto';
import { UserQuizzesResponseDto, QuizAttemptsOverviewResponseDto } from '../dto/res/quiz-overview.res.dto';
import { AnalyticsRoutes } from '../routes/analytics.routes';
import { AnalyticsSwagger } from '@/common/constants/swagger-docs/analytics.swagger';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { AnalyticsPaginationDto } from '../dto/req/analytics-pagination.req.dto';

@UseGuards(CompanyRoleGuard)
@RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
@Controller(AnalyticsRoutes.ROOT)
export class CompanyAnalyticsController {
  constructor(private readonly companyAnalyticsService: CompanyAnalyticsService) {}

  @Get(AnalyticsRoutes.COMPANY_LEADERBOARD)
  @ApiEndpoint(LeaderboardTableResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_LEADERBOARD)
  @ResponseMessage('Leaderboard fetched successfully')
  async getCompanyLeaderboard(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsPaginationDto,
  ): Promise<LeaderboardTableResponseDto> {
    return this.companyAnalyticsService.getCompanyLeaderboard(slug, user.sub, query);
  }

  @Get(AnalyticsRoutes.COMPANY_DYNAMICS)
  @ApiEndpoint(ScoreDynamicsResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_DYNAMICS)
  @ResponseMessage('Company dynamics fetched successfully')
  async getCompanyDynamics(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ScoreDynamicsResponseDto> {
    return this.companyAnalyticsService.getCompanyDynamics(slug, user.sub, query);
  }

  @Get(AnalyticsRoutes.COMPANY_USER_PROFILE)
  @ApiEndpoint(UserAnalyticsProfileDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_USER_PROFILE)
  @ResponseMessage('User profile fetched successfully')
  async getCompanyUserProfile(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserAnalyticsProfileDto> {
    return this.companyAnalyticsService.getCompanyUserProfile(slug, userId, user.sub);
  }

  @Get(AnalyticsRoutes.COMPANY_USER_QUIZZES)
  @ApiEndpoint(UserQuizzesResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_USER_QUIZZES)
  @ResponseMessage('User quizzes fetched successfully')
  async getCompanyUserQuizzes(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsPaginationDto,
  ): Promise<UserQuizzesResponseDto> {
    return this.companyAnalyticsService.getCompanyUserQuizzes(slug, userId, user.sub, query);
  }

  @Get(AnalyticsRoutes.COMPANY_QUIZ_ATTEMPTS)
  @ApiEndpoint(QuizAttemptsOverviewResponseDto, HttpStatus.OK, AnalyticsSwagger.COMPANY_QUIZ_ATTEMPTS)
  @ResponseMessage('Quiz attempts fetched successfully')
  async getCompanyQuizAttempts(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsPaginationDto,
  ): Promise<QuizAttemptsOverviewResponseDto> {
    return this.companyAnalyticsService.getCompanyQuizAttempts(slug, quizId, user.sub, query);
  }
}
