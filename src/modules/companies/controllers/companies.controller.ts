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
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { CompaniesPaginatedBaseResponseDto, CompanyResponseDto } from '../dto/res/company/company-response.res.dto';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompaniesRoutes } from './../routes/companies.routes';
import { toCompanyResponseDto } from '../mappers/company.mapper';
import { CompanyMembersPaginationDto } from '../dto/req/members/company-members-pagination.req.dto';
import { CompaniesSwagger } from '@/common/constants/swagger-docs/companies.swagger';
import { CompanyMembersService } from '../services/company-members.service';
import { toCompanyMemberResponseDto } from '../mappers/company-member.mapper';
import { CompanyMembersListResponseDto } from '../dto/res/members/company-member.res.dto';
import { CreateCompanyDto } from '../dto/req/company/create-company.req.dto';
import { UpdateCompanyDto } from '../dto/req/company/update-company.req.dto';
import { QuizAttemptsService } from '../quizzes/services/quiz-attempts.service';
import { CompanyLeaderboardResponseDto } from '../../analytics/dto/res/leaderboard.res.dto';
import type { JwtPayload } from '@/common/interface/jwt-payload.interface';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';

@Controller(CompaniesRoutes.ROOT)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly membersService: CompanyMembersService,
    private readonly quizAttemptsService: QuizAttemptsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  @ApiEndpoint(CompaniesPaginatedBaseResponseDto, HttpStatus.OK, CompaniesSwagger.FIND_ALL)
  @ResponseMessage('Companies fetched successfully')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompaniesPaginationDto,
  ): Promise<{ companies: CompanyResponseDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.companiesService.findAll(user.sub, user.role, paginationDto);
    const companies = result.detail.map((company) => toCompanyResponseDto(company));

    return {
      companies,
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.LEADERBOARD)
  @UseGuards(CompanyRoleGuard)
  @ApiEndpoint(CompanyLeaderboardResponseDto, HttpStatus.OK, CompaniesSwagger.LEADERBOARD)
  @ResponseMessage('Leaderboard fetched successfully')
  async getCompanyLeaderboard(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyLeaderboardResponseDto> {
    return this.analyticsService.getCompanyLeaderboard(slug, user.sub);
  }

  @Get(CompaniesRoutes.MEMBERS.BASE)
  @ApiEndpoint(CompanyMembersListResponseDto, HttpStatus.OK, CompaniesSwagger.GET_MEMBERS)
  @ResponseMessage('Members fetched successfully')
  async getCompanyMembers(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<CompanyMembersListResponseDto> {
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
    const result = await this.membersService.findCompanyMembers(company.id, paginationDto);

    return {
      members: result.detail.map(toCompanyMemberResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.BY_SLUG)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK, CompaniesSwagger.FIND_ONE)
  @ResponseMessage('Company fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);

    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Post()
  @ApiEndpoint(CompanyResponseDto, HttpStatus.CREATED, CompaniesSwagger.CREATE)
  @ResponseMessage('Company created successfully')
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.create(dto, user.sub);

    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Patch(CompaniesRoutes.BY_SLUG)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK, CompaniesSwagger.UPDATE)
  @ResponseMessage('Company updated successfully')
  async update(@Param('slug') slug: string, @Body() dto: UpdateCompanyDto): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.updateBySlug(slug, dto);

    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Delete(CompaniesRoutes.BY_SLUG)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @ApiEndpoint(Object, HttpStatus.OK, CompaniesSwagger.REMOVE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Company deleted successfully')
  async remove(@Param('slug') slug: string): Promise<void> {
    await this.companiesService.removeBySlug(slug);
  }
}
