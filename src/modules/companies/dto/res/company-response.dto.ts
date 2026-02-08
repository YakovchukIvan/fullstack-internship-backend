import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompanyResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty()
  @Expose()
  isVisible: boolean;

  @ApiProperty()
  @Expose()
  ownerId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
