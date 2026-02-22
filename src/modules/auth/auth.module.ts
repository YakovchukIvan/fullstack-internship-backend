import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth } from './entities/auth.entity';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthCredentialsService } from './services/auth-credentials.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { MailModule } from '../mail/mail.module';
import { getJwtConfig } from '@/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { RolesGuard } from './guards/roles.guard';
import { AuthFacadeService } from './services/auth-facade.service';
import { AuthOAuthService } from './services/auth-oauth.service';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { AuthRepository } from './repositories/auth.repository';
import { TokenRedisRepository } from './repositories/token-redis.repository';

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
    UserAuthRepository,
    AuthRepository,
    TokenRedisRepository,
    AuthCredentialsService,
    PasswordService,
    TokenService,
    JwtStrategy,
    Auth0Strategy,
    RolesGuard,
    AuthFacadeService,
    AuthOAuthService,
  ],
  exports: [AuthCredentialsService, PasswordService, TokenService, JwtModule, PassportModule, RolesGuard],
})
export class AuthModule {}
