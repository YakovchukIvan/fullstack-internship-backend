export const NotificationMessages = {
  quizCreated: (quizTitle: string, companyName: string): string =>
    `New quiz "${quizTitle}" was added in ${companyName}`,
  invitationReceived: (companyName: string): string => `You have been invited to join ${companyName}`,
  invitationAccepted: (userName: string, companyName: string): string =>
    `${userName} has joined ${companyName} via invitation`,
  joinRequestSent: (requesterName: string, companyName: string): string =>
    `${requesterName} wants to join ${companyName}`,
  joinRequestAccepted: (companyName: string): string => `Your request to join ${companyName} was accepted`,
  joinRequestAcceptedAdmin: (userName: string, companyName: string): string =>
    `${userName} has joined ${companyName} via join request`,
} as const;
