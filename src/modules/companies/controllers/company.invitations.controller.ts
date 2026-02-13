import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyMemberResponseDto } from './../dto/res/company-member.res.dto';
import {
  toCompanyInvitationItemDto,
  toCompanyInvitationResponseDto,
} from '@/modules/companies/mappers/company-invitation.mapper';
import { CompanyInvitationItemDto, CompanyInvitationResponseDto } from './../dto/res/company-invitation-response.dto';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { InviteUserDto } from './../dto/req/invite-user.dto';
import { CompaniesRoutes } from './../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CurrentCompanyId } from '../decorators/current-company-id.decorator';

@Controller(CompaniesRoutes.ROOT)
export class CompanyInvitationsController {
  constructor(private readonly invitationsService: CompanyInvitationsService) {}

  @Get(CompaniesRoutes.INVITATIONS)
  @UseGuards(CompanyRoleGuard)
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

  @Post(CompaniesRoutes.INVITATIONS)
  @UseGuards(CompanyRoleGuard)
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

  @Post(CompaniesRoutes.ACCEPT_INVITATION)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
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

  @Post(CompaniesRoutes.DECLINE_INVITATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Invitation declined successfully')
  async declineInvitation(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.invitationsService.declineInvitation(slug, user.sub);
    return { message: 'Invitation has been declined' };
  }

  @Delete(CompaniesRoutes.INVITATION_BY_USER)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Invitation cancelled successfully')
  async cancelInvitation(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.invitationsService.cancelInvitation(companyId, userId);
    return { message: 'Invitation has been cancelled' };
  }
}
