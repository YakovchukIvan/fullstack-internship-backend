import type { Request } from 'express';
import type { User } from '@/modules/users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
