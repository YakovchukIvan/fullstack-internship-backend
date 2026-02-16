import { NotFoundException } from '@nestjs/common';
import type { Repository, FindOneOptions, ObjectLiteral } from 'typeorm';

export async function findOneOrFail<T extends ObjectLiteral>(
  repo: Repository<T>,
  options: FindOneOptions<T>,
  message = 'Entity not found',
): Promise<T> {
  const entity = await repo.findOne(options);

  if (!entity) {
    throw new NotFoundException(message);
  }

  return entity;
}
