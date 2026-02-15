import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyInvitationsService } from '@/modules/companies/services/company-invitations.service';
import { CompanyJoinRequestsService } from '@/modules/companies/services/company-join-requests.service';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';
import { CompanyInvitationsPaginationDto } from '@/modules/companies/dto/req/company-invitations-pagination.dto';
import { CompanyMembersPaginationDto } from '@/modules/companies/dto/req/company-members-pagination.dto';
import { CompanyInvitationItemDto } from '@/modules/companies/dto/res/company-invitation-response.dto';
import { CompanyJoinRequestItemDto } from '@/modules/companies/dto/res/company-join-request-response.dto';
import { CompanyMemberResponseDto } from '@/modules/companies/dto/res/company-member.res.dto';
import { toCompanyInvitationItemDto } from '@/modules/companies/mappers/company-invitation.mapper';
import { toCompanyJoinRequestItemDto } from '@/modules/companies/mappers/company-join-request.mapper';
import { toCompanyMemberResponseDto } from '@/modules/companies/mappers/company-member.mapper';
import { HttpStatus } from '@nestjs/common';

@Controller('users/me/company')
export class UserCompanyMembershipController {
  constructor(
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
    private readonly membersService: CompanyMembersService,
  ) {}

  @Get('invitations')
  @ApiEndpoint(CompanyInvitationItemDto, HttpStatus.OK)
  @ResponseMessage('User invitations fetched successfully')
  async getInvitations(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ invitations: CompanyInvitationItemDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.invitationsService.getUserInvitations(user.sub, paginationDto);

    return {
      invitations: result.detail.map(toCompanyInvitationItemDto),
      pagination: result.pagination,
    };
  }

  @Get('join-requests')
  @ApiEndpoint(CompanyJoinRequestItemDto, HttpStatus.OK)
  @ResponseMessage('User join requests fetched successfully')
  async getJoinRequests(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ joinRequests: CompanyJoinRequestItemDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.joinRequestsService.getUserJoinRequests(user.sub, paginationDto);

    return {
      joinRequests: result.detail.map(toCompanyJoinRequestItemDto),
      pagination: result.pagination,
    };
  }

  @Get('membership')
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('User membership fetched successfully')
  async getMembership(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ membership: CompanyMemberResponseDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.membersService.getUserMembership(user.sub, paginationDto);

    return {
      membership: result.detail.map(toCompanyMemberResponseDto),
      pagination: result.pagination,
    };
  }
}
