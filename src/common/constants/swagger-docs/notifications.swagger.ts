import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const NotificationsSwagger: Record<string, Partial<OperationObject>> = {
  GET_ALL: {
    summary: 'Get my notifications',
    description:
      'Returns paginated list of notifications for current user with unread count. Supports optional ?isRead filter.',
  },
  UNREAD_COUNT: {
    summary: 'Get unread notifications count',
    description: 'Returns count of unread notifications for current user. Use for badge display in navbar.',
  },
  MARK_AS_READ: {
    summary: 'Mark notification as read',
    description: 'Marks a single notification as read by ID. Returns updated notification.',
  },
  MARK_ALL_AS_READ: {
    summary: 'Mark all notifications as read',
    description: 'Marks all unread notifications as read for current user.',
  },
};
