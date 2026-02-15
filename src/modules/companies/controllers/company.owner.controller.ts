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
import { CompanyMemberResponseDto } from './../dto/res/company-member.res.dto';
import {
  toCompanyInvitationItemDto,
  toCompanyInvitationResponseDto,
} from '@/modules/companies/mappers/company-invitation.mapper';
import { CompanyInvitationItemDto, CompanyInvitationResponseDto } from './../dto/res/company-invitation-response.dto';
import { toCompanyJoinRequestResponseDto } from '@/modules/companies/mappers/company-join-request.mapper';
import { CompanyJoinRequestResponseDto } from './../dto/res/company-join-request-response.dto';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { InviteUserDto } from './../dto/req/invite-user.dto';
import { UpdateMemberRoleDto } from './../dto/req/update-member-role.dto';
import { CompaniesRoutes } from './../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CurrentCompanyId } from '../decorators/current-company-id.decorator';

@Controller(CompaniesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class CompanyOwnerController {
  constructor(
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
    private readonly membersService: CompanyMembersService,
  ) {}

  @Get(CompaniesRoutes.INVITATIONS)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyInvitationResponseDto, HttpStatus.OK)
  @ResponseMessage('Invitations fetched successfully')
  async getCompanyInvitations(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ detail: CompanyInvitationResponseDto; pagination: PaginationMetadataDto }> {
    const { invitations, company } = await this.invitationsService.getCompanyInvitations(companyId, paginationDto);

    return {
      detail: toCompanyInvitationResponseDto(invitations.detail, company),
      pagination: invitations.pagination,
    };
  }

  @Get(CompaniesRoutes.JOIN_REQUESTS)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyJoinRequestResponseDto, HttpStatus.OK)
  @ResponseMessage('Join requests fetched successfully')
  async getCompanyJoinRequests(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ data: CompanyJoinRequestResponseDto; pagination: PaginationMetadataDto }> {
    const { joinRequests, company } = await this.joinRequestsService.getCompanyJoinRequests(companyId, paginationDto);

    return {
      data: toCompanyJoinRequestResponseDto(joinRequests.detail, company),
      pagination: joinRequests.pagination,
    };
  }

  @Post(CompaniesRoutes.INVITATIONS)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyInvitationResponseDto, HttpStatus.CREATED)
  @ResponseMessage('User invited successfully')
  async inviteUser(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Body() dto: InviteUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyInvitationItemDto> {
    const invitation = await this.invitationsService.inviteUser(companyId, dto.email, user.sub, dto.message);

    return toCompanyInvitationItemDto(invitation);
  }

  @Post(CompaniesRoutes.ACCEPT_JOIN_REQUEST)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('Join request accepted successfully')
  async acceptJoinRequest(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Param('requestId') requestId: string,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.joinRequestsService.acceptJoinRequest(companyId, requestId);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Post(CompaniesRoutes.DECLINE_JOIN_REQUEST)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Join request declined successfully')
  async declineJoinRequest(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Param('requestId') requestId: string,
  ): Promise<{ message: string }> {
    await this.joinRequestsService.declineJoinRequest(companyId, requestId);
    return { message: 'Join request has been declined' };
  }

  @Patch(CompaniesRoutes.UPDATE_MEMBER_ROLE)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('Member role updated successfully')
  async updateMemberRole(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.membersService.updateMemberRole(slug, memberId, dto.role, user.sub);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Delete(CompaniesRoutes.INVITATION_BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Invitation cancelled successfully')
  async cancelInvitation(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Param('invitationId') invitationId: string,
  ): Promise<{ message: string }> {
    await this.invitationsService.cancelInvitation(companyId, invitationId);
    return { message: 'Invitation has been cancelled' };
  }

  @Delete(CompaniesRoutes.MEMBER_BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Member removed successfully')
  async removeMember(
    @Param('slug') slug: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.membersService.removeMember(slug, memberId, user.sub);
    return {
      message: 'Member has been removed from the company',
    };
  }
}
