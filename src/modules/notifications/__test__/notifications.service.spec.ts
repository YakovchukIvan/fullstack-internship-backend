import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationsGateway } from '../notifications.gateway';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { Notification } from '../entities/notification.entity';
import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { QuizCreatedEvent } from '@/modules/companies/quizzes/events/quiz-created.event';
import { CompanyInvitationAcceptedEvent } from '@/modules/companies/events/company-invitation-accepted.event';
import { CompanyJoinRequestEvent } from '@/modules/companies/events/company-join-request.event';
import { CompanyJoinRequestAcceptedEvent } from '@/modules/companies/events/company-join-request-accepted.event';
import { NotificationsService } from '../services/notifications.service';

// === Factory functions ===

const makeNotification = (overrides: Partial<Notification> = {}): Notification =>
  ({
    id: 'notification-uuid-1',
    userId: 'user-uuid-1',
    type: NotificationType.QUIZ_CREATED,
    text: 'Test notification',
    isRead: false,
    isSeen: false,
    companyId: 'company-uuid-1',
    quizId: null,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Notification;

const makeMember = (userId: string, role: CompanyRole = CompanyRole.MEMBER): CompanyMember =>
  ({
    id: `member-${userId}`,
    userId,
    companyId: 'company-uuid-1',
    role,
  }) as CompanyMember;

// === Tests ===

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let companyMemberRepository: jest.Mocked<CompanyMemberRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            countUnread: jest.fn(),
            findPaginatedByUser: jest.fn(),
            findOneByIdAndUserOrFail: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
        {
          provide: NotificationsGateway,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: CompanyMemberRepository,
          useValue: {
            findAllByCompanyId: jest.fn(),
            findOwnerAndAdminsByCompanyId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(NotificationRepository);
    companyMemberRepository = module.get(CompanyMemberRepository);
    // Gateway is injected but not asserted directly —
    // its behaviour is covered implicitly via notificationRepository.save calls
  });

  // === notifyJoinRequestSent ===

  describe('notifyJoinRequestSent', () => {
    it('should send notification only to admins and owner, not to the requester', async () => {
      const requesterId = 'requester-uuid';
      const adminId = 'admin-uuid';
      const ownerId = 'owner-uuid';

      const event = new CompanyJoinRequestEvent(requesterId, 'Ivan Test', 'company-uuid-1', 'Test Company');

      // Company has owner and admin — both should receive notification
      companyMemberRepository.findOwnerAndAdminsByCompanyId.mockResolvedValue([
        makeMember(ownerId, CompanyRole.OWNER),
        makeMember(adminId, CompanyRole.ADMIN),
      ]);

      const notification = makeNotification({ type: NotificationType.JOIN_REQUEST_SENT });
      notificationRepository.create.mockReturnValue(notification);
      notificationRepository.save.mockResolvedValue([notification, notification] as never);

      await service.notifyJoinRequestSent(event);

      // createMany must be called — params array is not empty
      expect(notificationRepository.save).toHaveBeenCalled();

      const savedParams = notificationRepository.create.mock.calls.map((call) => call[0] as { userId: string });
      const notifiedUserIds = savedParams.map((p) => p.userId);

      // Requester must NOT receive their own join request notification
      expect(notifiedUserIds).not.toContain(requesterId);
      // Owner and admin must receive the notification
      expect(notifiedUserIds).toContain(ownerId);
      expect(notifiedUserIds).toContain(adminId);
    });
  });

  // === notifyInvitationAccepted ===

  describe('notifyInvitationAccepted', () => {
    it('should send notification to admins, excluding the user who accepted the invitation', async () => {
      const acceptedUserId = 'accepted-uuid';
      const adminId = 'admin-uuid';
      const ownerId = 'owner-uuid';

      const event = new CompanyInvitationAcceptedEvent(acceptedUserId, 'Ivan Test', 'company-uuid-1', 'Test Company');

      // Accepted user is also in the list — must be filtered out by service logic
      companyMemberRepository.findOwnerAndAdminsByCompanyId.mockResolvedValue([
        makeMember(ownerId, CompanyRole.OWNER),
        makeMember(adminId, CompanyRole.ADMIN),
        makeMember(acceptedUserId, CompanyRole.MEMBER),
      ]);

      const notification = makeNotification({ type: NotificationType.INVITATION_ACCEPTED });
      notificationRepository.create.mockReturnValue(notification);
      notificationRepository.save.mockResolvedValue([notification, notification] as never);

      await service.notifyInvitationAccepted(event);

      const savedParams = notificationRepository.create.mock.calls.map((call) => call[0] as { userId: string });
      const notifiedUserIds = savedParams.map((p) => p.userId);

      // Accepted user must NOT receive notification about their own acceptance
      expect(notifiedUserIds).not.toContain(acceptedUserId);
      expect(notifiedUserIds).toContain(ownerId);
      expect(notifiedUserIds).toContain(adminId);
    });
  });

  // === notifyJoinRequestAccepted ===

  describe('notifyJoinRequestAccepted', () => {
    it('should send different notification texts to accepted user and admins', async () => {
      const acceptedUserId = 'accepted-uuid';
      const adminId = 'admin-uuid';

      const event = new CompanyJoinRequestAcceptedEvent(acceptedUserId, 'Ivan Test', 'company-uuid-1', 'Test Company');

      companyMemberRepository.findOwnerAndAdminsByCompanyId.mockResolvedValue([makeMember(adminId, CompanyRole.ADMIN)]);

      const notification = makeNotification({ type: NotificationType.JOIN_REQUEST_ACCEPTED });
      notificationRepository.create.mockReturnValue(notification);
      notificationRepository.save.mockResolvedValue([notification, notification] as never);

      await service.notifyJoinRequestAccepted(event);

      const savedParams = notificationRepository.create.mock.calls.map(
        (call) => call[0] as { userId: string; text: string },
      );

      const userNotification = savedParams.find((p) => p.userId === acceptedUserId);
      const adminNotification = savedParams.find((p) => p.userId === adminId);

      // User receives personal acceptance message referencing the company
      expect(userNotification?.text).toContain('Test Company');
      // Admin receives message about who joined — must contain the user's name
      expect(adminNotification?.text).toContain('Ivan Test');
    });
  });

  // === notifyQuizCreated ===

  describe('notifyQuizCreated', () => {
    it('should notify all members except the quiz creator', async () => {
      const creatorId = 'creator-uuid';
      const memberId1 = 'member-uuid-1';
      const memberId2 = 'member-uuid-2';

      const event = new QuizCreatedEvent('quiz-uuid-1', 'Test Quiz', 'company-uuid-1', creatorId, 'Test Company');

      // Three members total — creator must be filtered out, only 2 notified
      companyMemberRepository.findAllByCompanyId.mockResolvedValue([
        makeMember(creatorId, CompanyRole.OWNER),
        makeMember(memberId1),
        makeMember(memberId2),
      ]);

      const notification = makeNotification();
      notificationRepository.create.mockReturnValue(notification);
      notificationRepository.save.mockResolvedValue([notification, notification] as never);

      await service.notifyQuizCreated(event);

      const savedParams = notificationRepository.create.mock.calls.map((call) => call[0] as { userId: string });
      const notifiedUserIds = savedParams.map((p) => p.userId);

      // Creator must NOT receive notification for their own quiz
      expect(notifiedUserIds).not.toContain(creatorId);
      expect(notifiedUserIds).toContain(memberId1);
      expect(notifiedUserIds).toContain(memberId2);
    });
  });

  // === createManyIfNotEmpty ===

  describe('createManyIfNotEmpty (via notifyInvitationAccepted)', () => {
    it('should not call createMany if params array is empty', async () => {
      const event = new CompanyInvitationAcceptedEvent('user-uuid-1', 'Ivan Test', 'company-uuid-1', 'Test Company');

      // Empty list after filter — createManyIfNotEmpty must return early without saving
      companyMemberRepository.findOwnerAndAdminsByCompanyId.mockResolvedValue([]);

      await service.notifyInvitationAccepted(event);

      expect(notificationRepository.save).not.toHaveBeenCalled();
    });
  });
});
