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
import { CompanyMemberResponseDto } from '../dto/res/members/company-member.res.dto';
import { toCompanyInvitationItemResponseDto } from '@/modules/companies/mappers/company-invitation.mapper';
import { toCompanyJoinRequestItemResponseDto } from '@/modules/companies/mappers/company-join-request.mapper';
import { RequireCompanyRoles } from '../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../guards/company-role.guard';
import { InviteUserDto } from '../dto/req/requests/invite-user.req.dto';
import { UpdateMemberRoleDto } from '../dto/req/members/update-member-role.req.dto';
import { CompaniesRoutes } from '../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyPaginationDto } from '../dto/req/requests/company-invitations-pagination.req.dto';
import { toCompanyBasicResponseDto } from '../mappers/company-basic.mapper';
import {
  CompanyInvitationItemResponseDto,
  CompanyInvitationsPaginationResponseDto,
} from '../dto/res/requests/company-invitation.res.dto';
import { CompanyJoinRequestPaginationResponseDto } from '../dto/res/requests/company-join-request.res.dto';
import type { JwtPayload } from '@/common/interface/jwt-payload.interface';

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
  @ApiEndpoint(CompanyInvitationsPaginationResponseDto, HttpStatus.OK)
  @ResponseMessage('Invitations fetched successfully')
  async getCompanyInvitations(
    @Param('slug') slug: string,
    @Query() paginationDto: CompanyPaginationDto,
  ): Promise<CompanyInvitationsPaginationResponseDto> {
    const { invitations, company } = await this.invitationsService.getCompanyInvitations(slug, paginationDto);

    return {
      company: toCompanyBasicResponseDto(company),
      invitations: invitations.detail.map(toCompanyInvitationItemResponseDto),
      pagination: invitations.pagination,
    };
  }

  @Get(CompaniesRoutes.JOIN_REQUESTS.BASE)
  @ApiEndpoint(CompanyJoinRequestPaginationResponseDto, HttpStatus.OK)
  @ResponseMessage('Join requests fetched successfully')
  async getCompanyJoinRequests(
    @Param('slug') slug: string,
    @Query() paginationDto: CompanyPaginationDto,
  ): Promise<CompanyJoinRequestPaginationResponseDto> {
    const { joinRequests, company } = await this.joinRequestsService.getCompanyJoinRequests(slug, paginationDto);

    return {
      company: toCompanyBasicResponseDto(company),
      joinRequest: joinRequests.detail.map(toCompanyJoinRequestItemResponseDto),
      pagination: joinRequests.pagination,
    };
  }

  @Post(CompaniesRoutes.INVITATIONS.BASE)
  @ApiEndpoint(CompanyInvitationItemResponseDto, HttpStatus.CREATED)
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
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Join request declined successfully')
  async declineJoinRequest(@Param('slug') slug: string, @Param('requestId') requestId: string): Promise<void> {
    await this.joinRequestsService.declineJoinRequest(slug, requestId);
  }

  @Patch(CompaniesRoutes.MEMBERS.UPDATE_ROLE)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Invitation cancelled successfully')
  async cancelInvitation(@Param('slug') slug: string, @Param('invitationId') invitationId: string): Promise<void> {
    await this.invitationsService.cancelInvitation(slug, invitationId);
  }

  @Delete(CompaniesRoutes.MEMBERS.BY_ID)
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
