import { Controller, Get, Query, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompanyInvitationsService } from '@/modules/companies/services/company-invitations.service';
import { CompanyJoinRequestsService } from '@/modules/companies/services/company-join-requests.service';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';
import { CompanyPaginationDto } from '@/modules/companies/dto/req/requests/company-invitations-pagination.req.dto';
import { CompanyMembersPaginationDto } from '@/modules/companies/dto/req/members/company-members-pagination.req.dto';
import { UserMembershipListResponseDto } from '../dto/res/membership/user-membership-list.res.dto';
import { UserInvitationsListResponseDto } from '../dto/res/membership/user-invitations-list.res.dto';
import { UserJoinRequestsListResponseDto } from '../dto/res/membership/user-join-requests-list.res.dto';
import { toUserMembershipResponseDto } from '../mappers/user-membership.mapper';
import { UsersRoutes } from '../routes/users.routes';
import { QuizzesService } from '@/modules/companies/quizzes/services/quizzes.service';
import { QuizzesPaginationDto } from '@/modules/companies/quizzes/dto/req/quizzes-pagination.req.dto';
import { UserQuizzesListResponseDto } from '../dto/res/quizzes/user-quizzes-list.res.dto';
import { toUserQuizListItemResponseDto } from '../mappers/user-quiz-list-item.mapper';
import {
  toUserInvitationItemResponseDto,
  toUserJoinRequestItemResponseDto,
} from '../mappers/user-company-interactions';
import { UserRatingResponseDto } from '@/common/dto/res/user-rating.res.dto';
import { QuizAttemptsService } from '@/modules/companies/quizzes/services/quiz-attempts.service';
import { QuizExportService } from '@/modules/companies/quizzes/services/quiz-export.service';
import { PersonalExportQueryDto } from '@/modules/companies/quizzes/dto/req/export-query.req.dto';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { UserExportResponseDto } from '../dto/res/quizzes/user-export.res.dto';
import { ExportFormat } from '@/modules/companies/quizzes/enums/export-format.enum';
import { buildExportFilename } from '@/modules/companies/quizzes/shared/helpers/export-filename.helper';
import { UserCompanyMembershipSwagger } from '@/common/constants/swagger-docs/users.swagger';
import { sendCsvResponse } from '@/common/helpers/csv-response.helper';

@Controller(UsersRoutes.COMPANY.ROOT)
export class UserCompanyMembershipController {
  constructor(
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
    private readonly membersService: CompanyMembersService,
    private readonly quizzesService: QuizzesService,
    private readonly quizAttemptsService: QuizAttemptsService,
    private readonly quizExportService: QuizExportService,
  ) {}

  @Get(UsersRoutes.COMPANY.INVITATIONS)
  @ApiEndpoint(UserInvitationsListResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_INVITATIONS)
  @ResponseMessage('User invitations fetched successfully')
  async getInvitations(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyPaginationDto,
  ): Promise<UserInvitationsListResponseDto> {
    const result = await this.invitationsService.getUserInvitations(user.sub, paginationDto);
    return {
      invitations: result.detail.map(toUserInvitationItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.COMPANY.JOIN_REQUESTS)
  @ApiEndpoint(UserJoinRequestsListResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_JOIN_REQUESTS)
  @ResponseMessage('User join requests fetched successfully')
  async getJoinRequests(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyPaginationDto,
  ): Promise<UserJoinRequestsListResponseDto> {
    const result = await this.joinRequestsService.getUserJoinRequests(user.sub, paginationDto);
    return {
      joinRequests: result.detail.map(toUserJoinRequestItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.COMPANY.MEMBERSHIP)
  @ApiEndpoint(UserMembershipListResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_MEMBERSHIP)
  @ResponseMessage('User membership fetched successfully')
  async getMembership(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<UserMembershipListResponseDto> {
    const result = await this.membersService.getUserMembership(user.sub, paginationDto);
    return {
      membership: result.detail.map(toUserMembershipResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.COMPANY.QUIZZES)
  @ApiEndpoint(UserQuizzesListResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_QUIZZES)
  @ResponseMessage('User quizzes fetched successfully')
  async getMyQuizzes(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: QuizzesPaginationDto,
    @Query('slug') slug?: string,
  ): Promise<UserQuizzesListResponseDto> {
    const result = await this.quizzesService.findAllByUser(user.sub, paginationDto, slug);
    return {
      quizzes: result.detail.map(toUserQuizListItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.COMPANY.RATING)
  @ApiEndpoint(UserRatingResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_RATING)
  @ResponseMessage('User rating fetched successfully')
  async getMyRating(@CurrentUser() user: JwtPayload): Promise<{ rating: UserRatingResponseDto }> {
    const rating = await this.quizAttemptsService.getUserRating(user.sub);
    return { rating };
  }

  @Get(UsersRoutes.COMPANY.EXPORT.ME)
  @ApiEndpoint(UserExportResponseDto, HttpStatus.OK, UserCompanyMembershipSwagger.COMPANY_EXPORT)
  @ResponseMessage('Export completed successfully')
  async exportMyResults(
    @CurrentUser() user: JwtPayload,
    @Query() query: PersonalExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const { snapshots, firstName, lastName } = await this.quizExportService.getSnapshotsForMemberExport(
        user.sub,
        query,
      );
      const csv = this.quizExportService.buildCsv(snapshots);

      const slugName = query.slug || 'all-companies';
      const filename = buildExportFilename('personal', slugName, snapshots, { firstName, lastName });

      sendCsvResponse(response, csv, filename);
      return;
    }

    return this.quizExportService.exportMyResults(user.sub, query);
  }
}
