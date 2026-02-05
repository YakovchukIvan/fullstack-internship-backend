import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseEnvelope } from '../responses/api-response-envelope';

export const ApiEndpoint = <TModel extends Type<unknown>>(
  responseModel: TModel,
  status: HttpStatus = HttpStatus.OK,
): MethodDecorator & ClassDecorator =>
  applyDecorators(
    HttpCode(status),
    ApiExtraModels(ApiResponseEnvelope, responseModel),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseEnvelope) },
          {
            properties: {
              detail: { $ref: getSchemaPath(responseModel) },
            },
          },
        ],
      },
    }),
  );
