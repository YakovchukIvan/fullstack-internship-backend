import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  result: string;
}
