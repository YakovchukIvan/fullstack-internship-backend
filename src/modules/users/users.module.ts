import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UserCompanyMembershipController } from './controllers/user-company-membership.controller';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, CompaniesModule],
  controllers: [UsersController, UserCompanyMembershipController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
