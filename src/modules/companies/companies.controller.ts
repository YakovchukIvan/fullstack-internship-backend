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
import { CompaniesService } from './companies.service';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompaniesRoutes } from './routes/companies.routes';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { toCompanyResponseDto } from './mappers/company.mapper';
import { CompanyResponseDto } from './dto/res/company-response.dto';
import { CompanyDetailResponseDto } from './dto/res/company-detail-response.dto';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';
import { CompanyMembersPaginationDto } from './dto/req/company-members-pagination.dto';
import { CompaniesPaginationDto } from './dto/req/companies-pagination.dto';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompaniesPaginatedResponseDto } from './dto/res/company-paginated-response.dto';
import { toCompanyDetailResponseDto } from './mappers/company-detail.mapper';
import { CompanyRoleGuard } from './guards/company-role.guard';
import { RequireCompanyRoles } from './decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';

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
    const membersCount = await this.companiesService.getCompanyMembersCount(company.id);

    return {
      company: toCompanyResponseDto(company, membersCount),
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

    const companiesWithCounts = await Promise.all(
      result.detail.map(async (company) => {
        const membersCount = await this.companiesService.getCompanyMembersCount(company.id);
        return toCompanyResponseDto(company, membersCount);
      }),
    );

    return {
      companies: companiesWithCounts,
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
    const { company, members } = await this.companiesService.findBySlugWithMembers(
      slug,
      user.sub,
      user.role,
      paginationDto,
    );

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
    @Param('slug') slug: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: CompanyMembersPaginationDto,
  ): Promise<{ company: CompanyDetailResponseDto }> {
    const company = await this.companiesService.update(slug, dto, user.sub, user.role);
    const members = await this.companiesService.findCompanyMembers(company.id, paginationDto);

    return {
      company: toCompanyDetailResponseDto(company, members.detail, members.pagination),
    };
  }

  @Delete(CompaniesRoutes.BY_SLUG)
  @UseGuards(CompanyRoleGuard)
  @RequireCompanyRoles(CompanyRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Company deleted successfully')
  async remove(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.companiesService.remove(slug, user.sub, user.role);
    return {
      message: 'Company has been deleted successfully',
    };
  }
}
