import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  validateCustomDecorators: false,
  transformOptions: {
    enableImplicitConversion: true,
  },
});
