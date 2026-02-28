import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from '../dto/req/create-quiz.req.dto';
import { UpdateQuizDto } from '../dto/req/update-quiz.req.dto';
import { QuizzesPaginationDto } from '../dto/req/quizzes-pagination.req.dto';
import { QuizResponseDto } from '../dto/res/quiz.res.dto';
import { QuizzesPaginatedResponseDto } from '../dto/res/quizzes-paginated.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { toQuizResponseDto } from '../shared/mappers/quiz.mapper';
import { QuizzesSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiEndpoint(QuizzesPaginatedResponseDto, HttpStatus.OK, QuizzesSwagger.FIND_ALL)
  @ResponseMessage('Quizzes fetched successfully')
  async findAll(
    @Param('slug') slug: string,
    @Query() dto: QuizzesPaginationDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<QuizzesPaginatedResponseDto> {
    const result = await this.quizzesService.findAll(slug, user.sub, dto);

    return {
      quizzes: result.detail.map(toQuizResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(QuizzesRoutes.BY_ID)
  @ApiEndpoint(QuizResponseDto, HttpStatus.OK, QuizzesSwagger.FIND_ONE)
  @ResponseMessage('Quiz fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizResponseDto }> {
    const quiz = await this.quizzesService.findOne(quizId, slug, user.sub);

    return {
      quiz: toQuizResponseDto(quiz),
    };
  }

  @Post()
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizResponseDto, HttpStatus.CREATED, QuizzesSwagger.CREATE)
  @ResponseMessage('Quiz created successfully')
  async create(
    @Param('slug') slug: string,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizResponseDto }> {
    const quiz = await this.quizzesService.create(slug, user.sub, dto);

    return {
      quiz: toQuizResponseDto(quiz),
    };
  }

  @Patch(QuizzesRoutes.BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizResponseDto, HttpStatus.OK, QuizzesSwagger.UPDATE)
  @ResponseMessage('Quiz updated successfully')
  async update(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizResponseDto }> {
    const quiz = await this.quizzesService.update(quizId, slug, user.sub, dto);

    return {
      quiz: toQuizResponseDto(quiz),
    };
  }

  @Delete(QuizzesRoutes.BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(Object, HttpStatus.OK, QuizzesSwagger.REMOVE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Quiz deleted successfully')
  async remove(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.quizzesService.remove(quizId, slug, user.sub);
  }
}
