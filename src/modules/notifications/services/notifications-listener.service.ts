import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { CompanyEvents } from '@/modules/companies/events/company.events';
import { QuizEvents } from '@/modules/companies/quizzes/events/quiz.events';
import { CompanyInvitationEvent } from '@/modules/companies/events/company-invitation.event';
import { CompanyMembershipEvent } from '@/modules/companies/events/company-membership.event';
import { QuizCreatedEvent } from '@/modules/companies/quizzes/events/quiz-created.event';

@Injectable()
export class NotificationsListenerService {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(QuizEvents.QUIZ_CREATED)
  async handleQuizCreated(event: QuizCreatedEvent): Promise<void> {
    await this.notificationsService.notifyQuizCreated(event);
  }

  @OnEvent(CompanyEvents.INVITATION_SENT)
  async handleInvitationSent(event: CompanyInvitationEvent): Promise<void> {
    await this.notificationsService.notifyInvitationSent(event);
  }

  @OnEvent(CompanyEvents.INVITATION_ACCEPTED)
  async handleInvitationAccepted(event: CompanyMembershipEvent): Promise<void> {
    await this.notificationsService.notifyInvitationAccepted(event);
  }

  @OnEvent(CompanyEvents.JOIN_REQUEST_SENT)
  async handleJoinRequestCreated(event: CompanyMembershipEvent): Promise<void> {
    await this.notificationsService.notifyJoinRequestCreated(event);
  }

  @OnEvent(CompanyEvents.JOIN_REQUEST_ACCEPTED)
  async handleJoinRequestAccepted(event: CompanyMembershipEvent): Promise<void> {
    await this.notificationsService.notifyJoinRequestAccepted(event);
  }
}
