import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, HttpException } from '@nestjs/common';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { CompaniesService } from '../../services/companies.service';
import { QuizzesService } from '../services/quizzes.service';
import { AiRateLimitService } from '../services/ai-rate-limit.service';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { QuizResponseDto } from '../dto/res/quiz.res.dto';
import { AiQuotaResponseDto } from '../dto/res/ai-quota.res.dto';
import { toQuizResponseDto } from '../mappers/quiz.mapper';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import { toIso } from '@/common/helpers/date.transformer';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
export class QuizzesAiController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly rateLimitService: AiRateLimitService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get(QuizzesRoutes.AI_QUOTA)
  @RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
  @ApiEndpoint(AiQuotaResponseDto, HttpStatus.OK)
  @ResponseMessage('AI quota fetched successfully')
  async getQuota(@Param('slug') slug: string, @CurrentUser() user: JwtPayload): Promise<AiQuotaResponseDto> {
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
    const quota = await this.rateLimitService.getRemainingQuota(company.id);

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
    const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
    const { allowed } = await this.rateLimitService.checkLimit(company.id);

    if (!allowed) {
      throw new HttpException(
        'Daily AI quiz generation limit reached. Try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const quiz = await this.quizzesService.generateWithAi(slug, user.sub, dto);
    await this.rateLimitService.incrementUsage(company.id);

    return {
      quiz: toQuizResponseDto(quiz),
    };
  }
}
