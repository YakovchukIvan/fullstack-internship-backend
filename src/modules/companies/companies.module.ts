import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { CompanyMember } from './entities/company-member.entity';
import { CompanyRoleGuard } from './guards/company-role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyMember])],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRoleGuard],
  exports: [CompaniesService],
})
export class CompaniesModule {}
