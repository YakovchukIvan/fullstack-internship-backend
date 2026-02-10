import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const ttl = Number(config.get('THROTTLE_TTL', 60_000));
    const limit = Number(config.get('THROTTLE_LIMIT', 5));

    return {
      throttlers: [
        {
          ttl,
          limit,
        },
      ],
    };
  },
};
