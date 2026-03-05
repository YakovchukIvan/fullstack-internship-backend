import { QuizAnswerRecord, QuizAnswerSnapshot } from '../../interfaces/quiz-answer-snapshot.interface';
import { BuildSnapshotParams, QuizAttemptAnswer } from '../../interfaces/quiz-attempt.interfaces';

export function toAnswerRecord(
  answer: QuizAttemptAnswer,
  question: { question: string; options: string[] },
): QuizAnswerRecord {
  return {
    questionIndex: answer.questionIndex,
    questionText: question.question,
    options: question.options,
    selectedOptionIndexes: answer.selectedOptionIndexes,
    correctOptionIndexes: answer.correctOptionIndexes,
    isCorrect: answer.questionScore === 1,
    questionScore: answer.questionScore,
  };
}

export function toAnswerSnapshot(params: BuildSnapshotParams, answerRecords: QuizAnswerRecord[]): QuizAnswerSnapshot {
  const { attemptId, userId, companyId, quiz, totalPoints, completedAt } = params;
  return {
    attemptId,
    userId,
    companyId,
    quizId: quiz.id,
    quizTitle: quiz.title,
    completedAt: completedAt.toISOString(),
    totalPoints,
    maxPossiblePoints: quiz.questions.length,
    answers: answerRecords,
  };
}

export function toQuizAttemptAnswer(index: number, selected: number[], correct: number[]): QuizAttemptAnswer {
  const correctSelected = selected.filter((s) => correct.includes(s)).length;
  const incorrectSelected = selected.filter((s) => !correct.includes(s)).length;
  const questionScore = Number(Math.max(0, (correctSelected - incorrectSelected) / correct.length).toFixed(4));

  return {
    questionIndex: index,
    selectedOptionIndexes: selected,
    correctOptionIndexes: correct,
    questionScore,
  };
}
