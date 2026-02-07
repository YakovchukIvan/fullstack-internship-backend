import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponseEnvelope } from '@/common/responses/api-response-envelope';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T> | T> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseEnvelope<T> | T> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const statusCode = response.statusCode;

        if (statusCode === (HttpStatus.NO_CONTENT as number)) {
          return data;
        }

        const message =
          this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [context.getHandler(), context.getClass()]) ||
          'Operation successful';

        return new ApiResponseEnvelope({
          success: true,
          statusCode: statusCode,
          message: message,
          detail: data,
          path: request.url,
        });
      }),
    );
  }
}
