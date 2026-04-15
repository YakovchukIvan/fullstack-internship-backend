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
    summary: 'Get user by ID',
    description: 'Returns any user by UUID. Accessible by any authenticated user.',
  },
  UPDATE_ME: {
    summary: 'Update my profile',
    description: "Updates the current user's name or password.",
  },
  UPDATE_AVATAR: {
    summary: 'Update my avatar',
    description: 'Uploads a new avatar image (JPEG, PNG, WebP, max 5MB). Replaces the old one on S3 automatically.',
  },
  REMOVE_ME: {
    summary: 'Delete my account',
    description: "Permanently deletes the authenticated user's account.",
  },
};
