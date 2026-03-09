import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { UsersController } from '../users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should create user', async () => {
    const dto = {
      email: 'test@test.com',
      firstName: 'Ivan',
      lastName: 'Test',
      password: '123456',
    };

    const createdUser = {
      id: '1',
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(usersService, 'create').mockResolvedValue(createdUser as User);

    const result = await usersController.create(dto);

    expect(result.user).toBeDefined();
    expect(result.user.id).toEqual(createdUser.id);
    expect(result.user.email).toEqual(createdUser.email);
    expect(result.user.firstName).toEqual(createdUser.firstName);
    expect(result.user.lastName).toEqual(createdUser.lastName);
    expect(result.user.role).toEqual(createdUser.role);
    expect(result.user.createdAt).toBeDefined();
    expect(result.user.updatedAt).toBeDefined();
  });
});
