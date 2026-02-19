import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { QuizzesService } from '../services/quizzes.service';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { QuizResponseDto } from '../dto/res/quiz.res.dto';
import { AiQuotaResponseDto } from '../dto/res/ai-quota.res.dto';
import { toQuizResponseDto } from '../mappers/quiz.mapper';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { toIso } from '@/common/helpers/date.transformer';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizzesAiController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(QuizzesRoutes.AI_QUOTA)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(AiQuotaResponseDto, HttpStatus.OK)
  @ResponseMessage('AI quota fetched successfully')
  async getQuota(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<AiQuotaResponseDto> {
    const quota = await this.quizzesService.getAiQuota(slug, user.sub, user.role);

    return {
      remaining: quota.remaining,
      limit: quota.limit,
      resetsAt: toIso(quota.resetsAt),
    };
  }

  @Post(QuizzesRoutes.GENERATE_AI)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(QuizResponseDto, HttpStatus.CREATED)
  @ResponseMessage('Quiz generated successfully with AI')
  async generate(
    @Param('slug') slug: string,
    @Body() dto: GenerateQuizAiDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizResponseDto }> {
    const { quiz, remaining } = await this.quizzesService.generateWithAi(slug, user.sub, dto, user.role);

    return {
      quiz: toQuizResponseDto(quiz, remaining),
    };
  }
}
