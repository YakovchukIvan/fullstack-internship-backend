import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { SubmitQuizDto } from '../dto/req/submit-quiz.req.dto';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { QuizStartResponseDto } from '../dto/res/quiz-session.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { QuizSessionSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import { QuizzesService } from '../services/quizzes.service';
import { QuizAttemptsService } from '../services/quiz-attempts.service';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { toQuizStartResponseDto } from '../shared/mappers/quiz.mapper';
@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizSessionController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizAttemptsService: QuizAttemptsService,
  ) {}

  @Get(QuizzesRoutes.SESSION.START)
  @ApiEndpoint(QuizStartResponseDto, HttpStatus.OK, QuizSessionSwagger.START)
  @ResponseMessage('Quiz started successfully')
  async start(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizStartResponseDto }> {
    const { quiz, startedAt } = await this.quizzesService.findOne(quizId, slug, user.sub);

    return {
      quiz: toQuizStartResponseDto(quiz, startedAt),
    };
  }

  @Post(QuizzesRoutes.SESSION.SUBMIT)
  @ApiEndpoint(QuizAttemptResponseDto, HttpStatus.CREATED, QuizSessionSwagger.SUBMIT)
  @ResponseMessage('Quiz submitted successfully')
  async submit(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ attempt: QuizAttemptResponseDto }> {
    const attempt = await this.quizAttemptsService.submit(slug, quizId, user.sub, dto);

    return { attempt };
  }
}
