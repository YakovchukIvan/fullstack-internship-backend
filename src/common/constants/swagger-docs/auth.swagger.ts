import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const AuthSwagger: Record<string, Partial<OperationObject>> = {
  REGISTER: {
    summary: 'Sign Up',
    description: 'Register a new user. Returns access token and sets refresh token in cookie.',
  },
  LOGIN: {
    summary: 'Sign In',
    description: 'Authenticate with email and password. Returns access token and sets refresh token in cookie.',
  },
  LOGOUT: {
    summary: 'Logout',
    description: 'Revokes current access and refresh tokens. Clears cookie.',
  },
  REFRESH: {
    summary: 'Refresh token',
    description: 'Issues a new access token using the refresh token from the cookie.',
  },
  ME: {
    summary: 'Get current user (from token)',
    description: 'Returns minimal user info decoded directly from JWT without DB query.',
  },
  FORGOT_PASSWORD: {
    summary: 'Request password reset',
    description: 'Sends a password reset link to the specified email.',
  },
  RESET_PASSWORD: {
    summary: 'Reset password',
    description: 'Resets user password using a valid reset token.',
  },
};
