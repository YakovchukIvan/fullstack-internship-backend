import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { RedisService } from './redis.service';
import { getRedisConfig } from '@/config/redis.config';
import { LoggerModule } from '@/common/logger/logger.module';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = getRedisConfig(configService);
        const url = config.password
          ? `redis://:${config.password}@${config.host}:${config.port}`
          : `redis://${config.host}:${config.port}`;

        return {
          stores: [createKeyv(url)],
        };
      },
    }),
    LoggerModule,
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {}
