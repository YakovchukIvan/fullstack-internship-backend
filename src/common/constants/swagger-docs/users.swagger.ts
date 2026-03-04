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
