import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserCompanyMembershipController } from './controllers/user-company-membership.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CompaniesModule } from '../companies/companies.module';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, CompaniesModule],
  controllers: [UsersController, UserCompanyMembershipController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
