export class ApiResponseEnvelope<T = unknown> {
  readonly success: boolean;
  readonly statusCode: number;
  readonly message: string;
  readonly detail?: T;
  readonly errorCode?: string;
  readonly path?: string;
  readonly timestamp: string;

  constructor(params: {
    success: boolean;
    statusCode: number;
    message: string;
    detail?: T;
    errorCode?: string;
    path?: string;
  }) {
    Object.assign(this, params);
    this.timestamp = new Date().toISOString();
  }
}
