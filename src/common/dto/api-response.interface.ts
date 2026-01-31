export class ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly status_code: number;
  readonly message: string;
  readonly detail?: T;
  readonly error_code?: string;
  readonly path?: string;
  readonly timestamp: string;

  constructor(params: {
    success: boolean;
    status_code: number;
    message: string;
    detail?: T;
    error_code?: string;
    path?: string;
  }) {
    Object.assign(this, params);
    this.timestamp = new Date().toISOString();
  }
}
