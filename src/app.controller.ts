import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiEndpoint } from './common/decorators/api-endpoint.decorator';
import { ResponseMessage } from './common/decorators/response-message.decorator';
import { HealthCheckResponseDto } from './common/dto/res/health.res.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiEndpoint(HealthCheckResponseDto, HttpStatus.OK)
  @ResponseMessage('API is running')
  getHealthCheck() {
    return this.appService.getHealthCheck();
  }
}
