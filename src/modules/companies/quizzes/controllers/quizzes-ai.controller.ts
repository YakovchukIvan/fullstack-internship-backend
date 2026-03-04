import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { AiQuotaResponseDto, QuizAiResponseDto } from '../dto/res/quiz-ai.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { toIso } from '@/common/helpers/date.transformer';
import { QuizzesAiSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { QuizzesService } from '../services/quizzes.service';
import { toQuizAiResponseDto } from '../shared/mappers/quiz-ai.mapper';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizzesAiController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(QuizzesRoutes.AI_QUOTA)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(AiQuotaResponseDto, HttpStatus.OK, QuizzesAiSwagger.AI_QUOTA)
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
  @ApiEndpoint(QuizAiResponseDto, HttpStatus.CREATED, QuizzesAiSwagger.GENERATE_AI)
  @ResponseMessage('Quiz generated successfully with AI')
  async generate(
    @Param('slug') slug: string,
    @Body() dto: GenerateQuizAiDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ quiz: QuizAiResponseDto }> {
    const { quiz, remaining } = await this.quizzesService.generateWithAi(slug, user.sub, dto, user.role);

    return {
      quiz: toQuizAiResponseDto(quiz, remaining),
    };
  }
}
