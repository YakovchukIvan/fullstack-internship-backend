import { CSV_EXPORT_HEADERS } from './../constants/csv-export.constants';
import { Injectable } from '@nestjs/common';
import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';
import { calculateAccuracy } from '../helper/quiz-math.helper';

@Injectable()
export class CsvExportService {
  toCSV(snapshots: QuizAnswerSnapshot[]): string {
    const BOM = '\uFEFF';
    const header = CSV_EXPORT_HEADERS.join(',');

    if (snapshots.length === 0) {
      return BOM + header + '\n';
    }

    const rows: string[] = [header];

    for (const snapshot of snapshots) {
      const accuracyPercent = `${calculateAccuracy(snapshot.totalPoints, snapshot.maxPossiblePoints)}%`;
      const formattedDate = this.formatDate(snapshot.completedAt);

      for (const answer of snapshot.answers) {
        rows.push(
          [
            this.escape(snapshot.attemptId),
            this.escape(snapshot.quizId),
            this.escape(snapshot.quizTitle),
            this.escape(formattedDate),
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

    return BOM + rows.join('\n');
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const date = [d.getDate(), d.getMonth() + 1, d.getFullYear()].map((n) => String(n).padStart(2, '0')).join('.');
    const time = [d.getHours(), d.getMinutes()].map((n) => String(n).padStart(2, '0')).join(':');
    return `${date} ${time}`;
  }

  private escape(value: string): string {
    const str = String(value);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
