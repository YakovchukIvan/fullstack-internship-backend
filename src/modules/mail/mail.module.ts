import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { LoggerModule } from '@/common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
