import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyInvitationRepository } from '../repositories/company-invitation.repository';
import { CompanyJoinRequestRepository } from '../repositories/company-join-request.repository';
import { Company } from '../entities/company.entity';
import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CompanyJoinRequestsService } from '../services/company-join-requests.service';
import { CompanyMembersService } from '../services/company-members.service';

// ─── Factory functions ────────────────────────────────────────────────────────

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Ivan',
    lastName: 'Test',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as User;

const makeCompany = (overrides: Partial<Company> = {}): Company =>
  ({
    id: 'company-uuid-1',
    name: 'Test Company',
    slug: 'test-company',
    ownerId: 'owner-uuid-1',
    isVisible: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Company;

const makeJoinRequest = (overrides: Partial<CompanyJoinRequest> = {}): CompanyJoinRequest =>
  ({
    id: 'request-uuid-1',
    userId: 'user-uuid-1',
    companyId: 'company-uuid-1',
    user: makeUser(),
    ...overrides,
  }) as CompanyJoinRequest;

const makeMember = (overrides: Partial<CompanyMember> = {}): CompanyMember =>
  ({
    id: 'member-uuid-1',
    userId: 'user-uuid-1',
    companyId: 'company-uuid-1',
    role: CompanyRole.MEMBER,
    ...overrides,
  }) as CompanyMember;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompanyJoinRequestsService', () => {
  let service: CompanyJoinRequestsService;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let joinRequestRepository: jest.Mocked<CompanyJoinRequestRepository>;
  let invitationRepository: jest.Mocked<CompanyInvitationRepository>;
  let companyMembersService: jest.Mocked<CompanyMembersService>;
  let dataSource: { transaction: jest.Mock };
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyJoinRequestsService,
        {
          provide: CompanyRepository,
          useValue: {
            findBySlugOrFail: jest.fn(),
          },
        },
        {
          provide: CompanyJoinRequestRepository,
          useValue: {
            findByUserAndCompany: jest.fn(),
            findByIdInCompanyOrFail: jest.fn(),
            findOneOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CompanyInvitationRepository,
          useValue: {
            findByUserAndCompany: jest.fn(),
          },
        },
        {
          provide: CompanyMembersService,
          useValue: {
            isMember: jest.fn(),
            addMember: jest.fn(),
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
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompanyJoinRequestsService>(CompanyJoinRequestsService);
    companyRepository = module.get(CompanyRepository);
    joinRequestRepository = module.get(CompanyJoinRequestRepository);
    invitationRepository = module.get(CompanyInvitationRepository);
    companyMembersService = module.get(CompanyMembersService);
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
    eventEmitter = module.get(EventEmitter2);
  });

  // ─── sendJoinRequest ──────────────────────────────────────────────────────

  describe('sendJoinRequest', () => {
    it('should throw ConflictException if user is already a member or has pending request', async () => {
      const company = makeCompany();
      const userId = 'user-uuid-1';

      // ── User is already a member ──

      companyRepository.findBySlugOrFail.mockResolvedValue(company);
      // isMember returns true — user already belongs to the company
      companyMembersService.isMember.mockResolvedValueOnce(true);

      await expect(service.sendJoinRequest('test-company', userId)).rejects.toThrow(ConflictException);

      // ── Pending join request already exists ──

      companyRepository.findBySlugOrFail.mockResolvedValue(company);
      companyMembersService.isMember.mockResolvedValueOnce(false);
      // Existing request found — triggers ConflictException via GuardAssertions.notExists
      joinRequestRepository.findByUserAndCompany.mockResolvedValueOnce(makeJoinRequest());
      invitationRepository.findByUserAndCompany.mockResolvedValueOnce(null);

      await expect(service.sendJoinRequest('test-company', userId)).rejects.toThrow(ConflictException);
    });
  });

  // ─── acceptJoinRequest ────────────────────────────────────────────────────

  describe('acceptJoinRequest', () => {
    it('should add member, remove join request and emit JOIN_REQUEST_ACCEPTED event', async () => {
      const company = makeCompany();
      const joinRequest = makeJoinRequest();
      const member = makeMember();

      // Transaction mock: invoke callback with fake EntityManager
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<CompanyMember>) => {
        const fakeManager = {
          remove: jest.fn(),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      companyRepository.findBySlugOrFail.mockResolvedValue(company);
      joinRequestRepository.findByIdInCompanyOrFail.mockResolvedValue(joinRequest);
      // findOneOrFail loads user relation needed for event emission
      joinRequestRepository.findOneOrFail.mockResolvedValue({ ...joinRequest, user: makeUser() });
      companyMembersService.addMember.mockResolvedValue(member);

      const result = await service.acceptJoinRequest('test-company', joinRequest.id);

      expect(result.userId).toBe(member.userId);
      // JOIN_REQUEST_ACCEPTED event must be emitted after successful acceptance
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'company.join_request.accepted',
        expect.objectContaining({ userId: joinRequest.userId }),
      );
    });
  });
});
