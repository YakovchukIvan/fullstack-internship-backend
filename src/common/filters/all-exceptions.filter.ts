import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@/common/logger/app-logger';
import { ApiResponseEnvelope } from '@/common/responses/api-response-envelope';

interface HttpExceptionResponse {
  message?: string | string[] | object;
  error?: string;
  statusCode?: number;
}

interface ParsedExceptionData {
  status: number;
  message: string;
  detail?: unknown;
  errorCode?: string;
}

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, detail, errorCode } = this.parseException(exception);

    this.logException(request, status, message, detail, errorCode, exception);

    const errorResponse = new ApiResponseEnvelope({
      success: false,
      statusCode: status,
      message,
      detail,
      errorCode,
      path: request.url,
    });

    response.status(status).json(errorResponse);
  }

  private parseException(exception: unknown): ParsedExceptionData {
    if (exception instanceof HttpException) {
      return this.parseHttpException(exception);
    }

    if (exception instanceof Error) {
      return this.createParsedData(HttpStatus.INTERNAL_SERVER_ERROR, exception.message || 'Internal server error');
    }

    return this.createParsedData(HttpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
  }

  private parseHttpException(exception: HttpException): ParsedExceptionData {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return this.createParsedData(status, exceptionResponse);
    }

    const responseObj: HttpExceptionResponse = exceptionResponse;
    const messages = responseObj.message;
    const errorCode = responseObj.error;

    if (Array.isArray(messages)) {
      return this.createParsedData(status, 'Validation failed', { errors: messages }, errorCode);
    }

    if (typeof messages === 'string') {
      return this.createParsedData(status, messages || 'Request failed', undefined, errorCode);
    }

    return this.createParsedData(status, 'Request failed', messages, errorCode);
  }

  private createParsedData(status: number, message: string, detail?: unknown, errorCode?: string): ParsedExceptionData {
    return { status, message, detail, errorCode };
  }

  private logException(
    request: Request,
    status: number,
    message: string,
    detail: unknown,
    errorCode: string | undefined,
    exception: unknown,
  ): void {
    const logMessage = `[${request.method}] ${request.url} - Status: ${status} - ${message}`;
    const context = detail || errorCode ? JSON.stringify({ detail, errorCode }) : '';

    this.logger.logError(`${logMessage}${context ? ` - ${context}` : ''}`, exception);
  }
}
