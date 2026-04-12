// companies.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../controllers/companies.controller';
import { CompaniesService } from '../services/companies.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyRepository } from '../repositories/company.repository';
import { DataSource } from 'typeorm';
import { S3Service } from '@/modules/s3/s3.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        CompaniesService,
        {
          provide: CompanyRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            findBySlugOrFail: jest.fn(),
            findBySlugRaw: jest.fn(),
            findPaginated: jest.fn(),
          },
        },
        {
          provide: CompanyMembersService,
          useValue: {
            createInitialOwner: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
