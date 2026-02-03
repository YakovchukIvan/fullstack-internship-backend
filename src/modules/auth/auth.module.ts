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
import { PasswordService } from './password.service';
import { TokenService } from './services/token.service';

import { getJwtConfig } from '@/config/jwt.config';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { Auth0Strategy } from '../strategies/auth0.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
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
  ],
  exports: [AuthService, AuthCredentialsService, PasswordService, TokenService, JwtModule, PassportModule],
})
export class AuthModule {}
