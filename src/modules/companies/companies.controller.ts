import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompaniesRoutes } from './routes/companies.routes';
import { UniversalAuthGuard } from '@/modules/auth/guards/universal-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { toCompanyResponseDto } from './mappers/company.mapper';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { CompanyResponseDto } from './dto/res/company-response.dto';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';

@Controller(CompaniesRoutes.ROOT)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(UniversalAuthGuard)
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
  @UseGuards(UniversalAuthGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Companies fetched successfully')
  async findAll(@CurrentUser() user: JwtPayload): Promise<{ companies: CompanyResponseDto[] }> {
    const companies = await this.companiesService.findAll(user.role);
    return {
      companies: companies.map(toCompanyResponseDto),
    };
  }

  @Get(CompaniesRoutes.BY_SLUG)
  @UseGuards(UniversalAuthGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.findBySlug(slug, user.role);
    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Patch(CompaniesRoutes.BY_SLUG)
  @UseGuards(UniversalAuthGuard, CompanyOwnerGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company updated successfully')
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.update(slug, dto, user.role);
    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Delete(CompaniesRoutes.BY_SLUG)
  @UseGuards(UniversalAuthGuard, CompanyOwnerGuard)
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Company deleted successfully')
  async remove(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.companiesService.remove(slug, user.role);
    return {
      message: 'Company has been deleted successfully',
    };
  }
}
