import { PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.req.dto';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {}
