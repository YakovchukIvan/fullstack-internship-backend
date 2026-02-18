import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
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
} from '../mappers/user-company-interactions.res.dto';
import { UserRatingResponseDto } from '@/modules/companies/quizzes/dto/res/user-rating.res.dto';
import { QuizAttemptsService } from '@/modules/companies/quizzes/services/quiz-attempts.service';

@Controller(UsersRoutes.COMPANY.ROOT)
export class UserCompanyMembershipController {
  constructor(
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
    private readonly membersService: CompanyMembersService,
    private readonly quizzesService: QuizzesService,
    private readonly quizAttemptsService: QuizAttemptsService,
  ) {}

  @Get(UsersRoutes.COMPANY.INVITATIONS)
  @ApiEndpoint(UserInvitationsListResponseDto, HttpStatus.OK)
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
  @ApiEndpoint(UserJoinRequestsListResponseDto, HttpStatus.OK)
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
  @ApiEndpoint(UserMembershipListResponseDto, HttpStatus.OK)
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
  @ApiEndpoint(UserQuizzesListResponseDto, HttpStatus.OK)
  @ResponseMessage('User quizzes fetched successfully')
  async getMyQuizzes(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: QuizzesPaginationDto,
  ): Promise<UserQuizzesListResponseDto> {
    const result = await this.quizzesService.findAllByUser(user.sub, paginationDto);

    return {
      quizzes: result.detail.map(toUserQuizListItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.RATING)
  @ApiEndpoint(UserRatingResponseDto, HttpStatus.OK)
  @ResponseMessage('User rating fetched successfully')
  async getMyRating(@CurrentUser() user: JwtPayload): Promise<{ rating: UserRatingResponseDto }> {
    const rating = await this.quizAttemptsService.getUserRating(user.sub);

    return { rating };
  }
}
