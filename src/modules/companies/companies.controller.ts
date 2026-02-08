import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompaniesRoutes } from './routes/companies.routes';
import { UniversalAuthGuard } from '@/modules/auth/guards/universal-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { toCompanyResponseDto } from './mappers/company.mapper';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { CompanyResponseDto } from './dto/res/company-response.dto';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';

@Controller(CompaniesRoutes.ROOT)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(UniversalAuthGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.CREATED)
  @ResponseMessage('Company created successfully')
  async create(@Body() dto: CreateCompanyDto, @CurrentUser() user: User): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.create(dto, user.id);
    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Get()
  @UseGuards(UniversalAuthGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Companies fetched successfully')
  async findAll(@CurrentUser() user: User): Promise<{ companies: CompanyResponseDto[] }> {
    const companies = await this.companiesService.findAll(user.role);
    return {
      companies: companies.map(toCompanyResponseDto),
    };
  }

  @Get(CompaniesRoutes.BY_ID)
  @UseGuards(UniversalAuthGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company fetched successfully')
  async findOne(@UUIDParam() id: string, @CurrentUser() user: User): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.findOne(id, user.role);
    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Patch(CompaniesRoutes.BY_ID)
  @UseGuards(UniversalAuthGuard, CompanyOwnerGuard)
  @ApiEndpoint(CompanyResponseDto, HttpStatus.OK)
  @ResponseMessage('Company updated successfully')
  async update(@UUIDParam() id: string, @Body() dto: UpdateCompanyDto): Promise<{ company: CompanyResponseDto }> {
    const company = await this.companiesService.update(id, dto);
    return {
      company: toCompanyResponseDto(company),
    };
  }

  @Delete(CompaniesRoutes.BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UniversalAuthGuard, CompanyOwnerGuard)
  @ResponseMessage('Company deleted successfully')
  async remove(@UUIDParam() id: string): Promise<{ message: string }> {
    await this.companiesService.remove(id);
    return {
      message: 'Company has been deleted successfully',
    };
  }
}
