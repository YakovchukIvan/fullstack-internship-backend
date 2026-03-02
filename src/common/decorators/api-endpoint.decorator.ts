import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ApiResponseEnvelope } from '../responses/api-response-envelope';

export const ApiEndpoint = <TModel extends Type<unknown>>(
  responseModel: TModel,
  status: HttpStatus = HttpStatus.OK,
  operation?: Partial<OperationObject>,
): MethodDecorator & ClassDecorator => {
  const decorators = [
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
  ];

  if (operation) {
    decorators.push(ApiOperation(operation));
  }

  return applyDecorators(...decorators);
};
