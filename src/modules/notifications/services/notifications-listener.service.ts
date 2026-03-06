import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { CompanyEvents } from '@/modules/companies/events/company.events';
import { QuizEvents } from '@/modules/companies/quizzes/events/quiz.events';
import { CompanyInvitationEvent } from '@/modules/companies/events/company-invitation.event';
import { CompanyInvitationAcceptedEvent } from '@/modules/companies/events/company-invitation-accepted.event';
import { CompanyJoinRequestEvent } from '@/modules/companies/events/company-join-request.event';
import { CompanyJoinRequestAcceptedEvent } from '@/modules/companies/events/company-join-request-accepted.event';
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
  async handleInvitationAccepted(event: CompanyInvitationAcceptedEvent): Promise<void> {
    await this.notificationsService.notifyInvitationAccepted(event);
  }

  @OnEvent(CompanyEvents.JOIN_REQUEST_SENT)
  async handleJoinRequestSent(event: CompanyJoinRequestEvent): Promise<void> {
    await this.notificationsService.notifyJoinRequestSent(event);
  }

  @OnEvent(CompanyEvents.JOIN_REQUEST_ACCEPTED)
  async handleJoinRequestAccepted(event: CompanyJoinRequestAcceptedEvent): Promise<void> {
    await this.notificationsService.notifyJoinRequestAccepted(event);
  }
}
