import { Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CompanyMemberResponseDto } from '../dto/res/members/company-member.res.dto';
import { CompaniesRoutes } from '../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { toCompanyJoinRequestItemResponseDto } from '../mappers/company-join-request.mapper';
import { CompanyMembersSwagger } from '@/common/constants/swagger-docs/companies.swagger';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyJoinRequestItemResponseDto } from '../dto/res/requests/company-join-request.res.dto';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

@Controller(CompaniesRoutes.ROOT)
export class CompanyMembersController {
  constructor(
    private readonly membersService: CompanyMembersService,
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
  ) {}

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
