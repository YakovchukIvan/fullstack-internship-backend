import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('health')
  @ApiOperation({ summary: 'Mail service health check' })
  async health(): Promise<{ status: 'ok' }> {
    await this.mailService.verifyHealth();
    return { status: 'ok' };
  }
}
