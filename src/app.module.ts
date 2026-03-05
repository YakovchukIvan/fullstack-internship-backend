import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttlerConfig } from './config/throttler.config';
import { databaseConfig } from './config/database.config';
import { appProviders } from './app.providers';
import { CompaniesModule } from './modules/companies/companies.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './modules/redis/redis.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    ThrottlerModule.forRootAsync(throttlerConfig),
    EventEmitterModule.forRoot(),
    RedisModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    MailModule,
    CompaniesModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...appProviders],
})
export class AppModule {}
