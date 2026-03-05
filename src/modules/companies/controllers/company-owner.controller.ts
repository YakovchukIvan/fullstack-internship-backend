import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyMemberResponseDto } from '../dto/res/company/company-member.res.dto';
import { toCompanyInvitationItemResponseDto } from '../mappers/company/company-invitation.mapper';
import { toCompanyJoinRequestItemResponseDto } from '../mappers/company/company-join-request.mapper';
import { RequireCompanyRoles } from '../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../guards/company-role.guard';
import { InviteUserDto } from '../dto/req/members/invite-user.req.dto';
import { UpdateMemberRoleDto } from '../dto/req/members/update-member-role.req.dto';
import { CompaniesRoutes } from '../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CompanyOwnerSwagger } from '@/common/constants/swagger-docs/companies.swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company/company-member.mapper';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInteractionsPaginationDto } from '../dto/req/company/company-interactions-pagination.req.dto';
import { toCompanyBasicResponseDto } from '../mappers/company-basic.mapper';
import {
  CompanyInvitationItemResponseDto,
  CompanyInvitationsPaginationResponseDto,
} from '../dto/res/company/company-invitation.res.dto';
import { CompanyJoinRequestPaginationResponseDto } from '../dto/res/company/company-join-request.res.dto';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

@Controller(CompaniesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
@RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
export class CompanyOwnerController {
  constructor(
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
    private readonly membersService: CompanyMembersService,
  ) {}

  @Get(CompaniesRoutes.INVITATIONS.BASE)
  @ApiEndpoint(CompanyInvitationsPaginationResponseDto, HttpStatus.OK, CompanyOwnerSwagger.GET_INVITATIONS)
  @ResponseMessage('Invitations fetched successfully')
  async getCompanyInvitations(
    @Param('slug') slug: string,
    @Query() paginationDto: CompanyInteractionsPaginationDto,
  ): Promise<CompanyInvitationsPaginationResponseDto> {
    const { invitation, company } = await this.invitationsService.getCompanyInvitations(slug, paginationDto);

    return {
      company: toCompanyBasicResponseDto(company),
      invitation: invitation.detail.map(toCompanyInvitationItemResponseDto),
      pagination: invitation.pagination,
    };
  }

  @Get(CompaniesRoutes.JOIN_REQUESTS.BASE)
  @ApiEndpoint(CompanyJoinRequestPaginationResponseDto, HttpStatus.OK, CompanyOwnerSwagger.GET_JOIN_REQUESTS)
  @ResponseMessage('Join requests fetched successfully')
  async getCompanyJoinRequests(
    @Param('slug') slug: string,
    @Query() paginationDto: CompanyInteractionsPaginationDto,
  ): Promise<CompanyJoinRequestPaginationResponseDto> {
    const { joinRequests, company } = await this.joinRequestsService.getCompanyJoinRequests(slug, paginationDto);

    return {
      company: toCompanyBasicResponseDto(company),
      joinRequest: joinRequests.detail.map(toCompanyJoinRequestItemResponseDto),
      pagination: joinRequests.pagination,
    };
  }

  @Post(CompaniesRoutes.INVITATIONS.BASE)
  @ApiEndpoint(CompanyInvitationItemResponseDto, HttpStatus.CREATED, CompanyOwnerSwagger.INVITE_USER)
  @ResponseMessage('User invited successfully')
  async inviteUser(
    @Param('slug') slug: string,
    @Body() dto: InviteUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyInvitationItemResponseDto> {
    const invitation = await this.invitationsService.inviteUser(slug, dto.email, user.sub, dto.message);

    return toCompanyInvitationItemResponseDto(invitation);
  }

  @Post(CompaniesRoutes.JOIN_REQUESTS.ACCEPT)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK, CompanyOwnerSwagger.ACCEPT_JOIN_REQUEST)
  @ResponseMessage('Join request accepted successfully')
  async acceptJoinRequest(
    @Param('slug') slug: string,
    @Param('requestId') requestId: string,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.joinRequestsService.acceptJoinRequest(slug, requestId);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Post(CompaniesRoutes.JOIN_REQUESTS.DECLINE)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyOwnerSwagger.DECLINE_JOIN_REQUEST)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Join request declined successfully')
  async declineJoinRequest(@Param('slug') slug: string, @Param('requestId') requestId: string): Promise<void> {
    await this.joinRequestsService.declineJoinRequest(slug, requestId);
  }

  @Patch(CompaniesRoutes.MEMBERS.UPDATE_ROLE)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK, CompanyOwnerSwagger.UPDATE_MEMBER_ROLE)
  @ResponseMessage('Member role updated successfully')
  async updateMemberRole(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.membersService.updateMemberRole(slug, memberId, dto.role);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Delete(CompaniesRoutes.INVITATIONS.BY_ID)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyOwnerSwagger.CANCEL_INVITATION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Invitation cancelled successfully')
  async cancelInvitation(@Param('slug') slug: string, @Param('invitationId') invitationId: string): Promise<void> {
    await this.invitationsService.cancelInvitation(slug, invitationId);
  }

  @Delete(CompaniesRoutes.MEMBERS.BY_ID)
  @ApiEndpoint(Object, HttpStatus.OK, CompanyOwnerSwagger.REMOVE_MEMBER)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Member removed successfully')
  async removeMember(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.membersService.removeMember(slug, memberId, user.sub);
  }
}
