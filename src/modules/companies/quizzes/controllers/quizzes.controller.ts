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
import { QuizzesService } from '../services/quizzes.service';
import { CreateQuizDto } from '../dto/req/quiz/create-quiz.req.dto';
import { UpdateQuizDto } from '../dto/req/quiz/update-quiz.req.dto';
import { QuizzesPaginationDto } from '../dto/req/quiz/quizzes-pagination.req.dto';
import { QuizAdminResponseDto } from '../dto/res/quiz/quiz-detail.res.dto';
import { QuizListResponseDto, UserQuizzesListResponseDto } from '../dto/res/quiz/quizzes-paginated.res.dto';
import { QuizzesPaginatedResponseDto } from '../dto/res/quiz/quizzes-paginated.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { toQuizAdminResponseDto, toQuizListResponseDto } from '../shared/mappers/quiz.mapper';
import { QuizzesSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { toUserQuizListItemResponseDto } from '@/modules/companies/quizzes/shared/mappers/quiz/user-quiz-list-item.mapper';

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
      quizzes: result.detail.map((quiz) => toQuizListResponseDto(quiz)),
      pagination: result.pagination,
    };
  }

  @Get(QuizzesRoutes.AVAILABLE)
  @ApiEndpoint(UserQuizzesListResponseDto, HttpStatus.OK, QuizzesSwagger.FIND_ALL)
  @ResponseMessage('Available quizzes fetched successfully')
  async getAvailableQuizzes(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: QuizzesPaginationDto,
  ): Promise<UserQuizzesListResponseDto> {
    const result = await this.quizzesService.findCreatedByUser(slug, user.sub, paginationDto);

    return {
      quizzes: result.detail.map(toUserQuizListItemResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(QuizzesRoutes.BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizAdminResponseDto, HttpStatus.OK, QuizzesSwagger.FIND_ONE)
  @ResponseMessage('Quiz fetched successfully')
  async findOne(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizAdminResponseDto }> {
    const quiz = await this.quizzesService.findOneForView(quizId, slug, user.sub);

    return { quiz: toQuizAdminResponseDto(quiz) };
  }

  @Post()
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizListResponseDto, HttpStatus.CREATED, QuizzesSwagger.CREATE)
  @ResponseMessage('Quiz created successfully')
  async create(
    @Param('slug') slug: string,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizListResponseDto }> {
    const quiz = await this.quizzesService.create(slug, user.sub, dto);

    return { quiz: toQuizListResponseDto(quiz) };
  }

  @Patch(QuizzesRoutes.BY_ID)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizListResponseDto, HttpStatus.OK, QuizzesSwagger.UPDATE)
  @ResponseMessage('Quiz updated successfully')
  async update(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizListResponseDto }> {
    const quiz = await this.quizzesService.update(quizId, slug, user.sub, dto);

    return { quiz: toQuizListResponseDto(quiz) };
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
