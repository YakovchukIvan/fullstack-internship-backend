import { Controller, Get, Param, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CompanyRoleGuard } from '../../guards/company-role.guard';
import { RequireCompanyRoles } from '../../decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { QuizExportService } from '../services/quiz-export.service';
import { ExportQueryDto } from '../dto/req/export-query.req.dto';
import { CompanyExportResponseDto } from '../dto/res/export.res.dto';
import { QuizzesRoutes } from '../routes/quizzes.routes';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { UserExportResponseDto } from '@/modules/users/dto/res/quizzes/user-export.res.dto';
import { ExportFormat } from '../enums/export-format.enum';
import { buildExportFilename } from '../shared/helpers/export-filename.helper';
import { QuizExportSwagger } from '@/common/constants/swagger-docs/quizzes.swagger';
import { sendCsvResponse } from '@/common/helpers/csv-response.helper';

@Controller(QuizzesRoutes.ROOT)
@UseGuards(CompanyRoleGuard)
@RequireCompanyRoles(CompanyRole.OWNER, CompanyRole.ADMIN)
export class QuizExportController {
  constructor(private readonly quizExportService: QuizExportService) {}

  @Get(QuizzesRoutes.EXPORT.COMPANY)
  @ApiEndpoint(CompanyExportResponseDto, HttpStatus.OK, QuizExportSwagger.EXPORT_COMPANY)
  @ResponseMessage('Company export completed successfully')
  async exportCompany(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CompanyExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const { snapshots } = await this.quizExportService.getSnapshotsForCompanyExport(slug, user.sub, query);
      const csv = this.quizExportService.buildCsv(snapshots);
      const filename = buildExportFilename('company', slug, snapshots);

      sendCsvResponse(response, csv, filename);
      return;
    }

    return this.quizExportService.exportCompanyResults(slug, user.sub, query);
  }

  @Get(QuizzesRoutes.EXPORT.USER)
  @ApiEndpoint(UserExportResponseDto, HttpStatus.OK, QuizExportSwagger.EXPORT_USER)
  @ResponseMessage('User export completed successfully')
  async exportUser(
    @CurrentUser() user: JwtPayload,
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserExportResponseDto | void> {
    if (query.format === ExportFormat.CSV) {
      const { snapshots, firstName, lastName } = await this.quizExportService.getSnapshotsForCompanyExport(
        slug,
        user.sub,
        query,
        userId,
      );
      const csv = this.quizExportService.buildCsv(snapshots);
      const filename = buildExportFilename('member', slug, snapshots, { firstName, lastName });

      sendCsvResponse(response, csv, filename);
      return;
    }

    return this.quizExportService.exportUserResults(slug, user.sub, userId, query);
  }
}
