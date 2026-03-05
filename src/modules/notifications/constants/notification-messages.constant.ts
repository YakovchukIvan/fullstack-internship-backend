export const NotificationMessages = {
  quizCreated: (quizTitle: string, companyName: string): string =>
    `New quiz "${quizTitle}" was added in ${companyName}`,
  invitationReceived: (companyName: string): string => `You have been invited to join ${companyName}`,
  invitationAccepted: (companyName: string): string => `You are now a member of ${companyName}`,
  joinRequestCreated: (companyName: string): string => `Your request to join ${companyName} has been sent`,
  joinRequestAccepted: (companyName: string): string => `Your request to join ${companyName} was accepted`,
} as const;
