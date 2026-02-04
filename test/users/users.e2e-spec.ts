import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { UsersRoutes } from '@/modules/users/routes/users.routes';

const USERS_URL = `/api/${UsersRoutes.ROOT}`;

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST create user', () => {
    const uniqueEmail = `test+${Date.now()}@test.com`;

    return request(app.getHttpServer())
      .post(USERS_URL)
      .send({
        email: uniqueEmail,
        firstName: 'IvanTwo',
        lastName: 'Test',
        password: '12345678',
      })
      .expect(201);
  });
});
