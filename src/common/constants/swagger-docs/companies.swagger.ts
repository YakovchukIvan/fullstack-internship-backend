import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const CompaniesSwagger: Record<string, Partial<OperationObject>> = {
  FIND_ALL: {
    summary: 'Get all companies',
    description:
      'Returns paginated list of visible companies. Hidden companies are visible only to their members/owner.',
  },
  FIND_ONE: {
    summary: 'Get company by slug',
    description: 'Returns company details. Hidden companies are accessible only to members.',
  },
  CREATE: {
    summary: 'Create company',
    description: 'Creates a new company. The authenticated user automatically becomes owner.',
  },
  UPDATE: {
    summary: 'Update company',
    description: 'Updates company name, description, or avatar. Requires company OWNER or company ADMIN role.',
  },
  UPDATE_AVATAR: {
    summary: 'Update company avatar',
    description:
      'Uploads a new company avatar image (JPEG, PNG, WebP, max 5MB). Requires company OWNER or ADMIN role. Replaces the old one on S3 automatically.',
  },
  REMOVE: {
    summary: 'Delete company',
    description: 'Permanently deletes the company and all its data. Requires company OWNER role.',
  },
  LEADERBOARD: {
    summary: 'Company leaderboard',
    description: 'Returns ranking of members by cumulative quiz score (correct / total questions) within this company.',
  },
  GET_MEMBERS: {
    summary: 'Get company members',
    description: 'Returns paginated list of members in the company.',
  },
};

export const CompanyOwnerSwagger: Record<string, Partial<OperationObject>> = {
  GET_INVITATIONS: {
    summary: 'Get pending invitations',
    description:
      'Returns paginated list of pending invitations for this company. Requires company OWNER or company ADMIN.',
  },
  INVITE_USER: {
    summary: 'Invite user',
    description: 'Sends an invitation to a user by email to join the company. Requires company OWNER or company ADMIN.',
  },
  CANCEL_INVITATION: {
    summary: 'Cancel invitation',
    description: 'Cancels a pending invitation before the user responds. Requires company OWNER or company ADMIN.',
  },
  ACCEPT_JOIN_REQUEST: {
    summary: 'Accept join request',
    description:
      'Company OWNER/Company ADMIN approves a join request — user becomes MEMBER. Requires company OWNER or company ADMIN.',
  },
  DECLINE_JOIN_REQUEST: {
    summary: 'Decline join request',
    description: 'Company OWNER/Company ADMIN rejects a join request. Requires company OWNER or company ADMIN.',
  },
  GET_JOIN_REQUESTS: {
    summary: 'Get join requests',
    description: 'Returns paginated list of pending join requests. Requires company OWNER or company ADMIN.',
  },
  UPDATE_MEMBER_ROLE: {
    summary: 'Update member role',
    description:
      'Assigns or removes ADMIN role for a member. Only company OWNER can change roles. Cannot change OWNER role.',
  },
  REMOVE_MEMBER: {
    summary: 'Remove member',
    description:
      'Removes a member from the company. Cannot remove the company OWNER. Company ADMINs cannot remove other company ADMINs.',
  },
};

export const CompanyMembersSwagger: Record<string, Partial<OperationObject>> = {
  ACCEPT_INVITATION: {
    summary: 'Accept invitation',
    description: 'Accept an invitation — the current user becomes a MEMBER of the company.',
  },
  DECLINE_INVITATION: {
    summary: 'Decline invitation',
    description: 'Decline a company invitation. The invitation is deleted.',
  },
  SEND_JOIN_REQUEST: {
    summary: 'Send join request',
    description: 'Current user requests to join the company.',
  },
  CANCEL_JOIN_REQUEST: {
    summary: 'Cancel join request',
    description: 'Current user cancels their pending join request.',
  },
  LEAVE_COMPANY: {
    summary: 'Leave company',
    description: 'Current user leaves the company. OWNER cannot leave — must delete the company instead.',
  },
  GET_MY_INVITATIONS: {
    summary: 'My company invitations',
    description: 'Returns paginated list of company invitations sent to the current user.',
  },
  GET_MY_JOIN_REQUESTS: {
    summary: 'My join requests',
    description: 'Returns paginated list of join requests the current user has sent to companies.',
  },
  GET_MY_MEMBERSHIP: {
    summary: 'My company memberships',
    description: 'Returns all companies the current user is a member of.',
  },
};
