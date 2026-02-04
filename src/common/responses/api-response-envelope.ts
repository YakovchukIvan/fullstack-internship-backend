import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEnvelope<T = unknown> {
  @ApiProperty()
  readonly success: boolean;

  @ApiProperty()
  readonly statusCode: number;

  @ApiProperty()
  readonly message: string;

  @ApiProperty()
  readonly detail?: T;

  @ApiProperty()
  readonly errorCode?: string;

  @ApiProperty()
  readonly path?: string;

  constructor(params: {
    success: boolean;
    statusCode: number;
    message: string;
    detail?: T;
    errorCode?: string;
    path?: string;
  }) {
    Object.assign(this, params);
  }
}
