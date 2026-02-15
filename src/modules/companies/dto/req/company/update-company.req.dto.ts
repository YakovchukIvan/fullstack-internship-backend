import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.req.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
