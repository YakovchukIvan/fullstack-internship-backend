import { QuizDifficulty } from '../enums/quiz-difficulty.enum';

export const QUIZ_AI_DIFFICULTY_GUIDELINES: Record<QuizDifficulty, string> = {
  [QuizDifficulty.EASY]: 'Use simple language and straightforward questions. Avoid tricky wording.',
  [QuizDifficulty.MEDIUM]: 'Use moderate complexity. Include some nuanced questions.',
  [QuizDifficulty.HARD]: 'Use complex scenarios and challenging questions. Test deep understanding.',
};
