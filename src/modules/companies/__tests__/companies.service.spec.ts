// companies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CompanyRepository } from '../repositories/company.repository';
import { Company } from '../entities/company.entity';
import { CompanyMembersService } from '../services/company-members.service';
import { CompaniesService } from '../services/companies.service';
import { S3Service } from '@/modules/s3/s3.service';

// === Factory functions ===

const makeCompany = (overrides: Partial<Company> = {}): Company =>
  ({
    id: 'company-uuid-1',
    name: 'Test Company',
    slug: 'test-company',
    description: 'Test description',
    ownerId: 'user-uuid-1',
    isVisible: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Company;

// === Tests ===

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let companyMembersService: jest.Mocked<CompanyMembersService>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: CompanyRepository,
          useValue: {
            findBySlugOrFail: jest.fn(),
            findBySlugRaw: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            findPaginated: jest.fn(),
          },
        },
        {
          provide: CompanyMembersService,
          useValue: {
            createInitialOwner: jest.fn(),
            isMember: jest.fn(),
          },
        },
        // Typed as plain object to avoid DataSource transaction overload conflict
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

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get(CompanyRepository);
    companyMembersService = module.get(CompanyMembersService);
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
  });

  // === create ===

  describe('create', () => {
    it('should create company; throw ConflictException if name already exists', async () => {
      const company = makeCompany();
      const userId = 'user-uuid-1';
      const dto = { name: 'Test Company', description: 'Test description' };

      // ── Success case ──

      // Transaction mock: invoke callback with fake EntityManager
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<Company>) => {
        const fakeManager = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue(company),
          save: jest.fn().mockResolvedValue(company),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      companyMembersService.createInitialOwner.mockResolvedValue(undefined as never);

      const result = await service.create(dto, userId);

      expect(result.name).toBe(company.name);
      expect(result.slug).toBe(company.slug);

      // === Company name already exists ===

      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<Company>) => {
        const fakeManager = {
          // findOne returns existing company — triggers ConflictException
          findOne: jest.fn().mockResolvedValue(makeCompany()),
          create: jest.fn(),
          save: jest.fn(),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      await expect(service.create(dto, userId)).rejects.toThrow(ConflictException);
    });
  });

  // === findBySlug ===

  describe('findBySlug', () => {
    it('should throw NotFoundException if company is hidden and user is not owner', async () => {
      const hiddenCompany = makeCompany({ isVisible: false, ownerId: 'other-user-uuid' });

      companyRepository.findBySlugOrFail.mockResolvedValue(hiddenCompany);

      // Regular user trying to access hidden company they do not own
      await expect(service.findBySlug('test-company', 'user-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
