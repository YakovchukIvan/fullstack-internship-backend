import { Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CompanyMemberResponseDto } from '../dto/res/company/company-member.res.dto';
import { CompaniesRoutes } from '../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { toCompanyMemberResponseDto } from '../mappers/company/company-member.mapper';
import { toCompanyJoinRequestItemResponseDto } from '../mappers/company/company-join-request.mapper';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyJoinRequestItemResponseDto } from '../dto/res/company/company-join-request.res.dto';
import { CompanyInteractionsPaginationDto } from '../dto/req/company/company-interactions-pagination.req.dto';
import { CompanyMembersPaginationDto } from '../dto/req/members/company-members-pagination.req.dto';
import { UserInvitationsListResponseDto } from '@/modules/companies/dto/res/members/user-invitations-list.res.dto';
import { UserJoinRequestsListResponseDto } from '@/modules/companies/dto/res/members/user-join-requests-list.res.dto';
import { UserMembershipListResponseDto } from '@/modules/companies/dto/res/members/user-membership-list.res.dto';
import {
  toMembersInvitationItemResponseDto,
  toMembersJoinRequestItemResponseDto,
} from '@/modules/companies/mappers/members/user-company-interactions';
import { CompanyMembersSwagger } from '@/common/constants/swagger-docs/companies.swagger';
import { toUserMembersResponseDto } from '@/modules/companies/mappers/members/user-membership.mapper';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { Query, Get } from '@nestjs/common';

@Controller(CompaniesRoutes.ROOT)
export class CompanyMembersController {
  constructor(
    private readonly membersService: CompanyMembersService,
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
  ) {}

  @Get(CompaniesRoutes.INVITATIONS.ME)
  @ApiEndpoint(UserInvitationsListResponseDto, HttpStatus.OK, CompanyMembersSwagger.GET_MY_INVITATIONS)
  @ResponseMessage('User invitations fetched successfully')
  async getMyInvitations(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInteractionsPaginationDto,
  ): Promise<UserInvitationsListResponseDto> {
    const result = await this.invitationsService.getUserInvitations(user.sub, paginationDto);
    return {
      invitation: result.detail.map(toMembersInvitationItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.JOIN_REQUESTS.ME)
  @ApiEndpoint(UserJoinRequestsListResponseDto, HttpStatus.OK, CompanyMembersSwagger.GET_MY_JOIN_REQUESTS)
  @ResponseMessage('User join requests fetched successfully')
  async getMyJoinRequests(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInteractionsPaginationDto,
  ): Promise<UserJoinRequestsListResponseDto> {
    const result = await this.joinRequestsService.getUserJoinRequests(user.sub, paginationDto);
    return {
      joinRequests: result.detail.map(toMembersJoinRequestItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.MEMBERS.ME)
  @ApiEndpoint(UserMembershipListResponseDto, HttpStatus.OK, CompanyMembersSwagger.GET_MY_MEMBERSHIP)
  @ResponseMessage('User membership fetched successfully')
  async getMyMembership(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<UserMembershipListResponseDto> {
    const result = await this.membersService.getUserMembership(user.sub, paginationDto);
    return {
      membership: result.detail.map(toUserMembersResponseDto),
      pagination: result.pagination,
    };
  }

  @Post(CompaniesRoutes.INVITATIONS.ACCEPT)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK, CompanyMembersSwagger.ACCEPT_INVITATION)
  @ResponseMessage('Invitation accepted successfully')
  async acceptInvitation(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.invitationsService.acceptInvitation(slug, user.sub);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Post(CompaniesRoutes.INVITATIONS.DECLINE)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyMembersSwagger.DECLINE_INVITATION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Invitation declined successfully')
  async declineInvitation(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.invitationsService.declineInvitation(slug, user.sub);
    return { message: 'Invitation has been declined' };
  }

  @Post(CompaniesRoutes.JOIN_REQUESTS.BASE)
  @ApiEndpoint(CompanyJoinRequestItemResponseDto, HttpStatus.CREATED, CompanyMembersSwagger.SEND_JOIN_REQUEST)
  @ResponseMessage('Join request sent successfully')
  async sendJoinRequest(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyJoinRequestItemResponseDto> {
    const joinRequest = await this.joinRequestsService.sendJoinRequest(slug, user.sub);

    return toCompanyJoinRequestItemResponseDto(joinRequest);
  }

  @Delete(CompaniesRoutes.JOIN_REQUESTS.BASE)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyMembersSwagger.CANCEL_JOIN_REQUEST)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Join request cancelled successfully')
  async cancelJoinRequest(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<void> {
    await this.joinRequestsService.cancelJoinRequest(slug, user.sub);
  }

  @Delete(CompaniesRoutes.LEAVE)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyMembersSwagger.LEAVE_COMPANY)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Successfully left the company')
  async leaveCompany(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.membersService.leaveCompany(slug, user.sub);
    return {
      message: 'You have left the company',
    };
  }
}
