import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyInvitationRepository } from '../repositories/company-invitation.repository';
import { CompanyJoinRequestRepository } from '../repositories/company-join-request.repository';
import { UserRepository } from '@/modules/users/repositories/user.repository';
import { Company } from '../entities/company.entity';
import { CompanyInvitation } from '../entities/company-invitation.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CompanyInvitationsService } from '../services/company-invitations.service';
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

const makeInvitation = (overrides: Partial<CompanyInvitation> = {}): CompanyInvitation =>
  ({
    id: 'invitation-uuid-1',
    userId: 'user-uuid-1',
    companyId: 'company-uuid-1',
    invitedBy: 'owner-uuid-1',
    message: null,
    ...overrides,
  }) as CompanyInvitation;

const makeMember = (overrides: Partial<CompanyMember> = {}): CompanyMember =>
  ({
    id: 'member-uuid-1',
    userId: 'user-uuid-1',
    companyId: 'company-uuid-1',
    role: CompanyRole.MEMBER,
    ...overrides,
  }) as CompanyMember;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CompanyInvitationsService', () => {
  let service: CompanyInvitationsService;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let invitationRepository: jest.Mocked<CompanyInvitationRepository>;
  let joinRequestRepository: jest.Mocked<CompanyJoinRequestRepository>;
  let companyMembersService: jest.Mocked<CompanyMembersService>;
  let userRepository: jest.Mocked<UserRepository>;
  let dataSource: { transaction: jest.Mock };
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyInvitationsService,
        {
          provide: CompanyRepository,
          useValue: {
            findBySlugOrFail: jest.fn(),
          },
        },
        {
          provide: CompanyInvitationRepository,
          useValue: {
            findByUserAndCompany: jest.fn(),
            findBySlugAndUserOrFail: jest.fn(),
            findOneOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CompanyJoinRequestRepository,
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
        {
          provide: UserRepository,
          useValue: {
            findByEmailOrFail: jest.fn(),
            findOneOrFail: jest.fn(),
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

    service = module.get<CompanyInvitationsService>(CompanyInvitationsService);
    companyRepository = module.get(CompanyRepository);
    invitationRepository = module.get(CompanyInvitationRepository);
    joinRequestRepository = module.get(CompanyJoinRequestRepository);
    companyMembersService = module.get(CompanyMembersService);
    userRepository = module.get(UserRepository);
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
    eventEmitter = module.get(EventEmitter2);
  });

  // ─── inviteUser ───────────────────────────────────────────────────────────

  describe('inviteUser', () => {
    it('should throw ConflictException if user is already a member or has pending invitation', async () => {
      const company = makeCompany();
      const user = makeUser();

      // ── User is already a member ──

      companyRepository.findBySlugOrFail.mockResolvedValue(company);
      userRepository.findByEmailOrFail.mockResolvedValue(user);
      // isMember returns true — user already belongs to the company
      companyMembersService.isMember.mockResolvedValueOnce(true);

      await expect(service.inviteUser('test-company', user.email, 'owner-uuid-1')).rejects.toThrow(ConflictException);

      // ── Pending invitation already exists ──

      companyRepository.findBySlugOrFail.mockResolvedValue(company);
      userRepository.findByEmailOrFail.mockResolvedValue(user);
      companyMembersService.isMember.mockResolvedValueOnce(false);
      // Existing invitation found — triggers ConflictException via GuardAssertions.notExists
      invitationRepository.findByUserAndCompany.mockResolvedValueOnce(makeInvitation());
      joinRequestRepository.findByUserAndCompany.mockResolvedValueOnce(null);

      await expect(service.inviteUser('test-company', user.email, 'owner-uuid-1')).rejects.toThrow(ConflictException);
    });
  });

  // ─── acceptInvitation ─────────────────────────────────────────────────────

  describe('acceptInvitation', () => {
    it('should add member, remove invitation and emit INVITATION_ACCEPTED event', async () => {
      const company = makeCompany();
      const user = makeUser();
      const invitation = makeInvitation({ company });
      const member = makeMember();

      // Transaction mock: invoke callback with fake EntityManager
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<CompanyMember>) => {
        const fakeManager = {
          remove: jest.fn(),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      invitationRepository.findBySlugAndUserOrFail.mockResolvedValue(invitation);
      userRepository.findOneOrFail.mockResolvedValue(user);
      companyMembersService.addMember.mockResolvedValue(member);

      const result = await service.acceptInvitation('test-company', user.id);

      expect(result.userId).toBe(member.userId);
      // INVITATION_ACCEPTED event must be emitted after successful acceptance
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'company.invitation.accepted',
        expect.objectContaining({ userId: user.id }),
      );
    });
  });
});
