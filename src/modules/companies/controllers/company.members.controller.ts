import { Controller, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CompanyMemberResponseDto } from './../dto/res/company-member.res.dto';
import { CompanyJoinRequestItemDto } from './../dto/res/company-join-request-response.dto';
import { CompaniesRoutes } from './../routes/companies.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { toCompanyJoinRequestItemDto } from '../mappers/company-join-request.mapper';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyInvitationsService } from '../services/company-invitations.service';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';

@Controller(CompaniesRoutes.ROOT)
export class CompanyMembersController {
  constructor(
    private readonly membersService: CompanyMembersService,
    private readonly invitationsService: CompanyInvitationsService,
    private readonly joinRequestsService: CompanyJoinRequestsService,
  ) {}

  @Post(CompaniesRoutes.LEAVE_COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Successfully left the company')
  async leaveCompany(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.membersService.leaveCompany(slug, user.sub);
    return {
      message: 'You have left the company',
    };
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

  @Post(CompaniesRoutes.JOIN_REQUESTS)
  @ApiEndpoint(CompanyJoinRequestItemDto, HttpStatus.CREATED)
  @ResponseMessage('Join request sent successfully')
  async sendJoinRequest(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyJoinRequestItemDto> {
    const joinRequest = await this.joinRequestsService.sendJoinRequest(slug, user.sub);

    return toCompanyJoinRequestItemDto(joinRequest);
  }

  @Delete(CompaniesRoutes.JOIN_REQUESTS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Join request cancelled successfully')
  async cancelJoinRequest(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.joinRequestsService.cancelJoinRequest(slug, user.sub);
    return { message: 'Join request has been cancelled' };
  }
}
