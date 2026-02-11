import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompaniesRoutes } from './routes/companies.routes';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { toCompanyResponseDto, toCompanyMemberResponseDto } from './mappers/company.mapper';
import { CompanyResponseDto, CompanyMemberResponseDto } from './dto/res/company-response.dto';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';
import { CompanyRoleGuard } from './guards/company-role.guard';
import { RequireCompanyRoles } from './decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CompanyMembersPaginationDto } from './dto/req/company-members-pagination.dto';
import { CompaniesPaginationDto } from './dto/req/companies-pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import type { CompanyRequest } from './interfaces/company-request.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';

@Roles(UserRole.USER, UserRole.OWNER)
@UseGuards(CompanyRoleGuard)
@Controller(CompaniesRoutes.ROOT)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiEndpoint(CompanyResponseDto, HttpStatus.CREATED)
  @ResponseMessage('Company created successfully')
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.create(dto, user.sub);
    const membersCount = 1;
    return {
      company: toCompanyResponseDto(company, membersCount),
    };
  }

  @Get()
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Companies fetched successfully')
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompaniesPaginationDto,
  ): Promise<{ companies: CompanyResponseDto[]; pagination: PaginationMetadataDto }> {
    const result = await this.companiesService.findAll(user.role, paginationDto);
    return {
      companies: result.detail.map((c) => toCompanyResponseDto(c, 0)),
      pagination: result.pagination,
    };
  }

  @Get(CompaniesRoutes.BY_SLUG)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const { company, membersCount } = await this.companiesService.findBySlug(slug, user.role);
    return {
      company: toCompanyResponseDto(company, membersCount),
    };
  }

  @Get(CompaniesRoutes.MEMBERS)
  @ApiEndpoint(CompanyMemberResponseDto, HttpStatus.OK)
  @ResponseMessage('Company members fetched successfully')
  async findMembers(
    @Req() request: CompanyRequest,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ members: CompanyMemberResponseDto[]; pagination: PaginationMetadataDto }> {
    const companyId = request.companyId!;
    const result = await this.companiesService.findCompanyMembers(companyId, paginationDto);

    return {
      members: result.detail.map(toCompanyMemberResponseDto),
      pagination: result.pagination,
    };
  }

  @Patch(CompaniesRoutes.BY_SLUG)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company updated successfully')
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.update(slug, dto, user.role);
    const membersCount = await this.companiesService.getMembersCount(company.id);

    return {
      company: toCompanyResponseDto(company, membersCount),
    };
  }

  @Delete(CompaniesRoutes.BY_SLUG)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Company deleted successfully')
  async remove(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.companiesService.remove(slug, user.role);
    return {
      message: 'Company has been deleted successfully',
    };
  }
}
