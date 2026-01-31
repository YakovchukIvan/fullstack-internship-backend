export class ApiResponse<T> {
  success: boolean;
  status_code: number;
  message?: string;
  detail?: T;
  error_code?: string;
  path?: string;
  timestamp: string;

  constructor(params: {
    success: boolean;
    status_code: number;
    message?: string;
    detail?: T;
    error_code?: string;
    path?: string;
  }) {
    Object.assign(this, params);
    this.timestamp = new Date().toISOString();
  }
}
