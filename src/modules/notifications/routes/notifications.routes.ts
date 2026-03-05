export const NotificationsRoutes = {
  ROOT: 'notifications',
  BY_ID: ':notificationId',
  READ: ':notificationId/read',
  READ_ALL: 'read-all',
  UNREAD_COUNT: 'unread-count',
} as const;
