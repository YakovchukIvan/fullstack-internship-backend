import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CompanyMemberResponseDto } from './../dto/res/company-member.res.dto';
import { toCompanyJoinRequestResponseDto } from '@/modules/companies/mappers/company-join-request.mapper';
import { CompanyJoinRequestResponseDto } from './../dto/res/company-join-request-response.dto';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { CompaniesRoutes } from './../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CurrentCompanyId } from '../decorators/current-company-id.decorator';

@Controller(CompaniesRoutes.ROOT)
export class CompanyJoinRequestsController {
  constructor(private readonly joinRequestsService: CompanyJoinRequestsService) {}

  @Post(CompaniesRoutes.JOIN_REQUESTS)
  @UseGuards(CompanyRoleGuard)
  @ApiEndpoint(CompanyJoinRequestResponseDto, HttpStatus.CREATED)
  @ResponseMessage('Join request sent successfully')
  async sendJoinRequest(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ joinRequest: CompanyJoinRequestResponseDto }> {
    const joinRequest = await this.joinRequestsService.sendJoinRequest(companyId, user.sub);

    return {
      joinRequest: toCompanyJoinRequestResponseDto(joinRequest),
    };
  }

  @Get(CompaniesRoutes.JOIN_REQUESTS)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyJoinRequestResponseDto, HttpStatus.OK)
  @ResponseMessage('Join requests fetched successfully')
  async getCompanyJoinRequests(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyInvitationsPaginationDto,
  ): Promise<{ joinRequests: CompanyJoinRequestResponseDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.joinRequestsService.getCompanyJoinRequests(companyId, user.sub, paginationDto);

    return {
      joinRequests: result.detail.map(toCompanyJoinRequestResponseDto),
      pagination: result.pagination,
    };
  }

  @Post(CompaniesRoutes.ACCEPT_JOIN_REQUEST)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('Join request accepted successfully')
  async acceptJoinRequest(
    @CurrentCompanyId() companyId: string,
    @Param('userId') userId: string, // ID юзера, чий запит приймаємо
    @CurrentUser() admin: JwtPayload,
  ): Promise<{ member: CompanyMemberResponseDto }> {
    const member = await this.joinRequestsService.acceptJoinRequest(companyId, userId, admin.sub);

    return {
      member: toCompanyMemberResponseDto(member),
    };
  }

  @Post(CompaniesRoutes.DECLINE_JOIN_REQUEST)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Join request declined successfully')
  async declineJoinRequest(
    @CurrentCompanyId() companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() admin: JwtPayload,
  ): Promise<{ message: string }> {
    await this.joinRequestsService.declineJoinRequest(companyId, userId, admin.sub);
    return { message: 'Join request has been declined' };
  }

  @Delete(CompaniesRoutes.JOIN_REQUESTS)
  @UseGuards(CompanyRoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Join request cancelled successfully')
  async cancelJoinRequest(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.joinRequestsService.cancelJoinRequest(companyId, user.sub);
    return { message: 'Join request has been cancelled' };
  }
}
