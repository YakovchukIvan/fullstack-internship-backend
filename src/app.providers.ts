import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { globalValidationPipe } from './common/pipes/global-validation.pipe';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { UniversalAuthGuard } from './modules/auth/guards/universal-auth.guard';

export const appProviders = [
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
  {
    provide: APP_PIPE,
    useValue: globalValidationPipe,
  },
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
  {
    provide: APP_GUARD,
    useClass: UniversalAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
] as const;
