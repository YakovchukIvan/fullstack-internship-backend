import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth } from './entities/auth.entity';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthCredentialsService } from './services/auth-credentials.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { MailModule } from '../mail/mail.module';
import { getJwtConfig } from '@/config/jwt.config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { AuthFlowService } from './services/auth-flow.service';
import { AuthOAuthService } from './services/auth-oauth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCredentialsService,
    PasswordService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    Auth0Strategy,
    RolesGuard,
    ResourceOwnerGuard,
    AuthFlowService,
    AuthOAuthService,
  ],
  exports: [
    AuthService,
    AuthCredentialsService,
    PasswordService,
    TokenService,
    JwtModule,
    PassportModule,
    RolesGuard,
    ResourceOwnerGuard,
  ],
})
export class AuthModule {}
