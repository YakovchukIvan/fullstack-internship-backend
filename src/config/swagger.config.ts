import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

type SwaggerOp = { get(key: string): string };

export function setupSwagger(app: INestApplication, globalPrefix: string, configService: ConfigService): void {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

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

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      operationsSorter: (a: SwaggerOp, b: SwaggerOp) => {
        const methodHTTP = ['get', 'post', 'put', 'patch', 'delete'];

        return methodHTTP.indexOf(a.get('method')) - methodHTTP.indexOf(b.get('method'));
      },
      persistAuthorization: true,
    },
  });
}
