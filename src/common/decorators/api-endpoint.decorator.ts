import { applyDecorators, Type, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiResponseEnvelope } from '../responses/api-response-envelope';

export const ApiEndpoint = <TModel extends Type<unknown>>(
  responseModel: TModel,
  status: HttpStatus = HttpStatus.OK,
  isPublic: boolean = false,
  isArray: boolean = false,
) => {
  const decorators = [HttpCode(status)];

  if (!isPublic) {
    decorators.push(ApiBearerAuth('JWT-auth'), ApiUnauthorizedResponse({ description: 'Unauthorized' }));
  }

  const detailSchema = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(responseModel) } }
    : { $ref: getSchemaPath(responseModel) };

  decorators.push(
    ApiExtraModels(ApiResponseEnvelope, responseModel),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseEnvelope) },
          {
            properties: {
              success: { type: 'boolean', example: true },
              statusCode: { type: 'number', example: status },
              message: { type: 'string', example: 'Success' },
              detail: detailSchema,
            },
          },
        ],
      },
    }),
  );

  return applyDecorators(...decorators);
};
