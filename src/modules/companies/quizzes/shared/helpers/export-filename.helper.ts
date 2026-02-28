import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';

type ExportFilenameType = 'personal' | 'member' | 'company';

interface ExportFilenameOptions {
  firstName?: string;
  lastName?: string;
}

export function buildExportFilename(
  type: ExportFilenameType,
  slug: string,
  snapshots: QuizAnswerSnapshot[],
  extra?: ExportFilenameOptions,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const quizTitle = snapshots[0]?.quizTitle?.replace(/\s+/g, '-') ?? 'all';
  const firstName = extra?.firstName ?? 'user';
  const lastName = extra?.lastName ?? '';

  switch (type) {
    case 'personal':
      return `export-${firstName}-${lastName}-${slug}-${quizTitle}-${date}.csv`.replace(/--+/g, '-');

    case 'member':
      return `export-${firstName}-${lastName}-${slug}-${date}.csv`;

    case 'company':
      return snapshots[0]?.quizTitle ? `export-${slug}-${quizTitle}-${date}.csv` : `export-${slug}-${date}.csv`;
    default:
      throw new Error(`Unsupported export filename type: ${String(type)}`);
  }
}
