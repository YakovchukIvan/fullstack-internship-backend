import { NotificationType } from '../enums/notification-type.enum';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  text: string;
  companyId: string | null;
}
