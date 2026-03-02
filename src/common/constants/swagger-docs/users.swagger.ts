import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const UsersSwagger: Record<string, Partial<OperationObject>> = {
  CREATE: {
    summary: 'Create user (admin only)',
    description: 'Creates a user manually. Requires OWNER role.',
  },
  FIND_ALL: {
    summary: 'Get all users',
    description: 'Returns paginated list of all users.',
  },
  FIND_ME: {
    summary: 'Get my full profile',
    description: 'Returns full profile of the currently authenticated user from the database.',
  },
  FIND_ONE: {
    summary: 'Get user by ID (admin only)',
    description: 'Returns any user by UUID. Requires OWNER role.',
  },
  UPDATE_ME: {
    summary: 'Update my profile',
    description: "Updates the current user's name or password.",
  },
  REMOVE_ME: {
    summary: 'Delete my account',
    description: "Permanently deletes the authenticated user's account.",
  },
};

export const UserCompanyMembershipSwagger: Record<string, Partial<OperationObject>> = {
  COMPANY_INVITATIONS: {
    summary: 'My company invitations',
    description: 'Returns paginated list of company invitations sent to the current user.',
  },
  COMPANY_JOIN_REQUESTS: {
    summary: 'My join requests',
    description: 'Returns paginated list of join requests the current user has sent to companies.',
  },
  COMPANY_MEMBERSHIP: {
    summary: 'My company memberships',
    description: 'Returns all companies the current user is a member of.',
  },
  COMPANY_QUIZZES: {
    summary: 'My available quizzes',
    description: 'Returns quizzes available to the current user across all their companies.',
  },
  COMPANY_RATING: {
    summary: 'My quiz rating',
    description: 'Returns cumulative quiz rating stats (correct answers / total questions) across all companies.',
  },
  COMPANY_EXPORT: {
    summary: 'Export my quiz results',
    description:
      "Exports current user's quiz answers from Redis for a given company. Supports JSON or CSV format (via ?format=csv).",
  },
};
