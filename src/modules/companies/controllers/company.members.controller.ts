import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { CompanyMembersPaginationDto } from './../dto/req/company-members-pagination.dto';
import { CompaniesRoutes } from './../routes/companies.routes';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyMemberResponseDto } from '../dto/res/company-member.res.dto';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CompanyInvitationItemDto } from '../dto/res/company-invitation-response.dto';
import { CompanyJoinRequestItemDto } from '../dto/res/company-join-request-response.dto';
import { toCompanyInvitationItemDto } from '../mappers/company-invitation.mapper';
import { toCompanyJoinRequestItemDto } from '../mappers/company-join-request.mapper';

@Controller(CompaniesRoutes.ROOT)
export class CompanyMembersController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly membersService: CompanyMembersService,
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
  ) {}

  @Get(CompaniesRoutes.MEMBERS)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('Members fetched successfully')
  async getCompanyMembers(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ members: CompanyMemberResponseDto[]; pagination: PaginationMetadataDto }> {
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
    const result = await this.membersService.findCompanyMembers(company.id, paginationDto);

    return {
      members: result.detail.map(toCompanyMemberResponseDto),
      pagination: result.pagination,
    };
  }

  @Post(CompaniesRoutes.LEAVE_COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Successfully left the company')
  async leaveCompany(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.membersService.leaveCompany(slug, user.sub);
    return {
      message: 'You have left the company',
    };
  }

  @Delete(CompaniesRoutes.MEMBER_BY_ID)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Member removed successfully')
  async removeMember(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.membersService.removeMember(slug, userId, user.sub);
    return {
      message: 'Member has been removed from the company',
    };
  }

  @Get(CompaniesRoutes.MY_INVITATIONS)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('User invitations fetched successfully')
  async getMyInvitations(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ invitations: CompanyInvitationItemDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.invitationsService.getUserInvitations(user.sub, paginationDto);

    return {
      invitations: result.detail.map(toCompanyInvitationItemDto),
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.MY_JOIN_REQUESTS)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('User join requests fetched successfully')
  async getMyJoinRequests(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ joinRequests: CompanyJoinRequestItemDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.joinRequestsService.getUserJoinRequests(user.sub, paginationDto);

    return {
      joinRequests: result.detail.map(toCompanyJoinRequestItemDto),
      pagination: result.pagination,
    };
  }
}
