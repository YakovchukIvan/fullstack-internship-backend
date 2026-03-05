import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AnalyticsQueryDto } from '../dto/req/analytics-query.req.dto';
import { UserAnalyticsProfileDto } from '../dto/res/user-profile.res.dto';
import { UserQuizzesResponseDto } from '../dto/res/quiz-overview.res.dto';
import { DurationDynamicsResponseDto } from '../dto/res/dynamics.res.dto';
import { AnalyticsRoutes } from '../routes/analytics.routes';
import { AnalyticsSwagger } from '@/common/constants/swagger-docs/analytics.swagger';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { MemberAnalyticsService } from '../services/member-analytics.service';
import { AnalyticsPaginationDto } from '../dto/req/analytics-pagination.req.dto';

@Controller(AnalyticsRoutes.ROOT)
export class MemberAnalyticsController {
  constructor(private readonly memberAnalyticsService: MemberAnalyticsService) {}

  @Get(AnalyticsRoutes.ME_COMPANY)
  @ApiEndpoint(UserAnalyticsProfileDto, HttpStatus.OK, AnalyticsSwagger.ME_COMPANY)
  @ResponseMessage('Member analytics fetched successfully')
  async getMyCompanyAnalytics(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserAnalyticsProfileDto> {
    return this.memberAnalyticsService.getMyCompanyAnalytics(user.sub, slug);
  }

  @Get(AnalyticsRoutes.ME_COMPANY_QUIZZES)
  @ApiEndpoint(UserQuizzesResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_COMPANY_QUIZZES)
  @ResponseMessage('Member quizzes fetched successfully')
  async getMyCompanyQuizzes(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsPaginationDto,
  ): Promise<UserQuizzesResponseDto> {
    return this.memberAnalyticsService.getMyCompanyQuizzes(user.sub, slug, query);
  }

  @Get(AnalyticsRoutes.ME_COMPANY_DURATION_DYNAMICS)
  @ApiEndpoint(DurationDynamicsResponseDto, HttpStatus.OK, AnalyticsSwagger.ME_COMPANY_DURATION_DYNAMICS)
  @ResponseMessage('Member duration dynamics fetched successfully')
  async getMyCompanyDurationDynamics(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: AnalyticsQueryDto,
  ): Promise<DurationDynamicsResponseDto> {
    return this.memberAnalyticsService.getMyCompanyDurationDynamics(user.sub, slug, query);
  }
}
