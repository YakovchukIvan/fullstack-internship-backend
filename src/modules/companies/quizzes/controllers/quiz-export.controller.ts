import { Controller, Get, Param, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { QuizExportService } from '../services/quiz-export.service';
import { ExportQueryDto, ExportFormat } from '../dto/req/export-query.req.dto';
import { CompanyExportResponseDto } from '../dto/res/export.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import type { JwtPayload } from '@/common/interface/jwt-payload.interface';
import { UserExportResponseDto } from '@/modules/users/dto/res/quizzes/user-export.res.dto';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
@RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
export class QuizExportController {
  constructor(private readonly quizExportService: QuizExportService) {}

  @Get(QuizzesRoutes.EXPORT.COMPANY)
  @ApiEndpoint(CompanyExportResponseDto, HttpStatus.OK)
  @ResponseMessage('Company export completed successfully')
  async exportCompany(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CompanyExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const snapshots = await this.quizExportService.getSnapshotsForCompanyExport(slug, user.sub, query);
      const csv = this.quizExportService.buildCsv(snapshots);
      const filename = `export-company-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;

      response.setHeader('Content-Type', 'text/csv');
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(csv);
      return;
    }

    return this.quizExportService.exportCompanyResults(slug, user.sub, query);
  }

  @Get(QuizzesRoutes.EXPORT.USER)
  @ApiEndpoint(UserExportResponseDto, HttpStatus.OK)
  @ResponseMessage('User export completed successfully')
  async exportUser(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const snapshots = await this.quizExportService.getSnapshotsForCompanyExport(slug, user.sub, query, userId);
      const csv = this.quizExportService.buildCsv(snapshots);
      const filename = `export-user-${userId}-${new Date().toISOString().slice(0, 10)}.csv`;

      response.setHeader('Content-Type', 'text/csv');
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(csv);
      return;
    }

    return this.quizExportService.exportUserResults(slug, user.sub, userId, query);
  }

  @Get(QuizzesRoutes.EXPORT.QUIZ)
  @ApiEndpoint(CompanyExportResponseDto, HttpStatus.OK)
  @ResponseMessage('Quiz export completed successfully')
  async exportQuiz(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Param('quizId') quizId: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CompanyExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const snapshots = await this.quizExportService.getSnapshotsForCompanyExport(
        slug,
        user.sub,
        query,
        undefined,
        quizId,
      );
      const csv = this.quizExportService.buildCsv(snapshots);
      const filename = `export-quiz-${quizId}-${new Date().toISOString().slice(0, 10)}.csv`;

      response.setHeader('Content-Type', 'text/csv');
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(csv);
      return;
    }

    return this.quizExportService.exportQuizResults(slug, user.sub, quizId, query);
  }
}
