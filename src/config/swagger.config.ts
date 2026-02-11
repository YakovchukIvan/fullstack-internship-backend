import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication, globalPrefix: string, configService: ConfigService): void {
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Fullstack Internship Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = `${globalPrefix}/docs`;

  type SwaggerOperation = { get(key: 'method'): string };

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      operationsSorter: (a: SwaggerOperation, b: SwaggerOperation) => {
        const order = ['post', 'get', 'put', 'patch', 'delete'];

        const ai = order.indexOf(a.get('method'));
        const bi = order.indexOf(b.get('method'));

        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      },
      persistAuthorization: true,
    },
  });
}
