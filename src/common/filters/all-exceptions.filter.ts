import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@/common/logger/app-logger';
import { ApiResponse } from '@/common/dto/api-response.interface';

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

function isHttpExceptionResponse(value: unknown): value is HttpExceptionResponse {
  return typeof value === 'object' && value !== null && 'message' in value;
}

type RequestWithId = Request & { id?: string };

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setLoggerContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | undefined = 'Internal server error';
    let detail: unknown;
    let error_code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isHttpExceptionResponse(exceptionResponse)) {
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Validation failed';
          detail = { errors: exceptionResponse.message };
        } else {
          message = exceptionResponse.message;
        }

        error_code = exceptionResponse.error;
      } else {
        message = 'Request failed';
        detail = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
    }

    const logMessage = `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify({
      message,
      detail,
      error_code,
    })}`;

    if (exception instanceof Error) {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.error(logMessage);
    }

    const errorResponse = new ApiResponse({
      success: false,
      status_code: status,
      message,
      detail,
      error_code,
      path: request.url,
    });

    response.status(status).json(errorResponse);
  }
}
