import { Param, ParseUUIDPipe } from '@nestjs/common';

export const UUIDParam = (paramName: string = 'id') => Param(paramName, new ParseUUIDPipe({ version: '4' }));
