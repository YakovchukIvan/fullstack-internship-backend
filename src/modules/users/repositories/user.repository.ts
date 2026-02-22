import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { UsersPaginationQueryDto } from '../dto/req/users-pagination-query.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByIdOrFail(id: string, relations: string[] = []): Promise<User> {
    const user = await this.findOne({ where: { id }, relations });
    GuardAssertions.exists(user, `User with ID ${id} not found`);
    return user;
  }

  async findByEmailOrFail(email: string): Promise<User> {
    const user = await this.findOne({ where: { email } });
    GuardAssertions.exists(user, 'User with this email not found');
    return user;
  }

  async findPaginated(dto: UsersPaginationQueryDto): Promise<PaginatedResultResponseDto<User>> {
    return createPaginatedResult(this, dto);
  }
}
