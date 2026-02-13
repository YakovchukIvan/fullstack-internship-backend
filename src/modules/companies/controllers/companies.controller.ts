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
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from './../decorators/company-roles.decorator';
import { CompanyRoleGuard } from './../guards/company-role.guard';
import { CompaniesPaginatedResponseDto } from './../dto/res/company-paginated-response.dto';
import { CompanyMembersPaginationDto } from './../dto/req/company-members-pagination.dto';
import { CompaniesPaginationDto } from './../dto/req/companies-pagination.dto';
import { UpdateCompanyDto } from './../dto/req/update-company.dto';
import { CreateCompanyDto } from './../dto/req/create-company.dto';
import { CompanyDetailResponseDto } from './../dto/res/company-detail-response.dto';
import { CompanyResponseDto } from './../dto/res/company-response.dto';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompaniesRoutes } from './../routes/companies.routes';
import { toCompanyDetailResponseDto } from '../mappers/company-detail.mapper';
import { CompanyMembersService } from '../services/company-members.service';
import { CurrentCompanyId } from '../decorators/current-company-id.decorator';
import { toCompanyResponseDto } from '../mappers/company.mapper';

@Controller(CompaniesRoutes.ROOT)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly membersService: CompanyMembersService,
  ) {}

  @Post()
  @ApiEndpoint(CompanyResponseDto, HttpStatus.CREATED)
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

  @Get()
  @ApiEndpoint(CompaniesPaginatedResponseDto, HttpStatus.OK)
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

  @Get(CompaniesRoutes.BY_SLUG)
  @ApiEndpoint(CompanyDetailResponseDto, HttpStatus.OK)
  @ResponseMessage('Company fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ company: CompanyDetailResponseDto }> {
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
    const members = await this.membersService.findCompanyMembers(company.id, paginationDto);

    return {
      company: toCompanyDetailResponseDto(company, members.detail, members.pagination),
    };
  }

  @Patch(CompaniesRoutes.BY_SLUG)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(CompanyDetailResponseDto, HttpStatus.OK)
  @ResponseMessage('Company updated successfully')
  async update(
    @Param('slug') _slug: string,
    @CurrentCompanyId() companyId: string,
    @Body() dto: UpdateCompanyDto,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ company: CompanyDetailResponseDto }> {
    const company = await this.companiesService.updateById(companyId, dto);
    const members = await this.membersService.findCompanyMembers(companyId, paginationDto);

    return {
      company: toCompanyDetailResponseDto(company, members.detail, members.pagination),
    };
  }

  @Delete(CompaniesRoutes.BY_SLUG)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Company deleted successfully')
  async remove(@Param('slug') _slug: string, @CurrentCompanyId() companyId: string): Promise<{ message: string }> {
    await this.companiesService.removeById(companyId);

    return {
      message: 'Company has been deleted successfully',
    };
  }
}
