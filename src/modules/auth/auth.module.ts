import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { PasswordService } from './password.service';
import { AuthCredentialsService } from './services/auth-credentials.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])],
  providers: [PasswordService, AuthCredentialsService],
  exports: [AuthCredentialsService, PasswordService],
})
export class AuthModule {}
