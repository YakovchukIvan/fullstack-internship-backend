import { CSV_EXPORT_HEADERS } from './../constants/csv-export.constants';
import { Injectable } from '@nestjs/common';
import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';

@Injectable()
export class CsvExportService {
  toCSV(snapshots: QuizAnswerSnapshot[]): string {
    if (snapshots.length === 0) {
      return CSV_EXPORT_HEADERS.join(',') + '\n';
    }

    const rows: string[] = [CSV_EXPORT_HEADERS.join(',')];

    for (const snapshot of snapshots) {
      const accuracyPercent = Number(((snapshot.totalPoints / snapshot.maxPossiblePoints) * 100).toFixed(2));

      for (const answer of snapshot.answers) {
        rows.push(
          [
            this.escape(snapshot.attemptId),
            this.escape(snapshot.quizId),
            this.escape(snapshot.quizTitle),
            this.escape(snapshot.completedAt),
            snapshot.totalPoints,
            snapshot.maxPossiblePoints,
            accuracyPercent,
            answer.questionIndex,
            this.escape(answer.questionText),
            this.escape(answer.options.join(' | ')),
            this.escape(answer.selectedAnswers.join(', ')),
            this.escape(answer.correctAnswers.join(', ')),
            answer.isCorrect,
            answer.questionScore,
          ].join(','),
        );
      }
    }

    return rows.join('\n');
  }

  private escape(value: string): string {
    const str = String(value);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
