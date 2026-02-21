import { Body, Controller, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { QuizAttemptsService } from '../services/quiz-attempts.service';
import { SubmitQuizDto } from '../dto/req/submit-quiz.req.dto';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import type { JwtPayload } from '@/common/interface/jwt-payload.interface';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post(QuizzesRoutes.ATTEMPTS.BASE)
  @ApiEndpoint(QuizAttemptResponseDto, HttpStatus.CREATED)
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
