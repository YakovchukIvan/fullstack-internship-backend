import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, globalPrefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Fullstack Internship Backend API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerPath = `${globalPrefix}/docs`;

  SwaggerModule.setup(swaggerPath, app, document);
}
