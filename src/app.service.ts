import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './common/dto/res/health.res.dto';

@Injectable()
export class AppService {
  getHealthCheck(): HealthCheckResponseDto {
    return {
      status: 'ok',
      result: 'working',
    };
  }
}
