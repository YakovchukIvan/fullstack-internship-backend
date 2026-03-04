import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { QuizSessionSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import { QuizAttemptsService } from '../services/quiz-attempts.service';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { QuizAnswerSnapshot } from '../shared/interfaces/quiz-answer-snapshot.interface';
import { UserRatingResponseDto } from '@/common/dto/res/user-rating.res.dto';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Get(QuizzesRoutes.ATTEMPTS.RATING)
  @ApiEndpoint(UserRatingResponseDto, HttpStatus.OK, QuizSessionSwagger.ME_ATTEMPTS)
  @ResponseMessage('User rating fetched successfully')
  async getMyRating(@CurrentUser() user: JwtPayload): Promise<{ rating: UserRatingResponseDto }> {
    const rating = await this.quizAttemptsService.getUserRating(user.sub);
    return { rating };
  }

  @Get(QuizzesRoutes.ATTEMPTS.ME)
  @ApiEndpoint(Object, HttpStatus.OK, QuizSessionSwagger.ME_ATTEMPTS)
  @ResponseMessage('Attempts fetched successfully')
  async myAttempts(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ attempts: QuizAnswerSnapshot[] }> {
    const attempts = await this.quizAttemptsService.getMyAttempts(slug, quizId, user.sub);

    return { attempts };
  }

  @Get(QuizzesRoutes.ATTEMPTS.MEMBER)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(Object, HttpStatus.OK, QuizSessionSwagger.MEMBER_ATTEMPTS)
  @ResponseMessage('Member attempts fetched successfully')
  async memberAttempts(
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @Param('userId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ attempts: QuizAnswerSnapshot[] }> {
    const attempts = await this.quizAttemptsService.getMemberAttempts(slug, quizId, user.sub, memberId);

    return { attempts };
  }
}
