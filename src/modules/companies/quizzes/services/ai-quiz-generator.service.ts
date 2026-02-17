import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { getGeminiConfig } from '@/config/gemini.config';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { QuizQuestion } from '../entities/quiz.entity';
import { AppLogger } from '@/common/logger/app-logger';
import { QUIZ_QUESTIONS_MIN, QUIZ_OPTIONS_MAX } from '../constants/quiz.constants';

interface AiQuizResponse {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface AiGeneratedQuiz extends AiQuizResponse {
  model: string;
}

@Injectable()
export class AiQuizGeneratorService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(AiQuizGeneratorService.name);

    const config = getGeminiConfig(this.configService);
    this.modelName = config.model;

    if (!config.apiKey) {
      this.logger.warn('❌ GEMINI_API_KEY not configured. AI quiz generation disabled.', AiQuizGeneratorService.name);
    } else {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.logger.log(`✅ Gemini AI initialized successfully (model=${this.modelName})`, AiQuizGeneratorService.name);
    }
  }

  async generateQuiz(dto: GenerateQuizAiDto): Promise<AiGeneratedQuiz> {
    if (!this.genAI) {
      throw new BadRequestException('AI quiz generation not configured. Add GEMINI_API_KEY to .env');
    }

    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const prompt = this.buildPrompt(dto);

    try {
      this.logger.log(
        `Generating AI quiz: topic="${dto.topic}", difficulty=${dto.difficulty}, questions=${dto.questionsCount}`,
        AiQuizGeneratorService.name,
      );

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      this.logger.log(`Tokens used: ${JSON.stringify(result.response.usageMetadata)}`, AiQuizGeneratorService.name);

      const quiz = this.parseResponse(text);
      this.validateQuiz(quiz, dto.questionsCount);

      const generatedQuiz: AiGeneratedQuiz = {
        ...quiz,
        model: this.modelName,
      };

      this.logger.log(`AI quiz generated successfully: "${generatedQuiz.title}"`, AiQuizGeneratorService.name);
      return generatedQuiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.logError(`AI quiz generation failed: ${errorMessage}`, error, AiQuizGeneratorService.name);
      throw new BadRequestException(`AI generation failed: ${errorMessage}`);
    }
  }

  private buildPrompt(dto: GenerateQuizAiDto): string {
    const guidelines: Record<string, string> = {
      easy: 'Use simple language and straightforward questions. Avoid tricky wording.',
      medium: 'Use moderate complexity. Include some nuanced questions.',
      hard: 'Use complex scenarios and challenging questions. Test deep understanding.',
    };

    const answerCounts = Array.from(
      { length: dto.questionsCount },
      () => Math.floor(Math.random() * QUIZ_OPTIONS_MAX) + 1,
    );

    const questionsSpec = answerCounts
      .map((count, i) => {
        const isMulti = count > 1;
        return `  Question ${i + 1}: exactly ${count} correct answer${count > 1 ? 's' : ''}, "isMultiSelect": ${isMulti}`;
      })
      .join('\n');

    return `
      You are an expert quiz creator. Generate a quiz in valid JSON format.

      Requirements:
      - Topic: "${dto.topic}"
      - Difficulty: ${dto.difficulty}
      - Guidelines: ${guidelines[dto.difficulty]}
      - Number of questions: ${dto.questionsCount}
      - Each question MUST have exactly ${QUIZ_OPTIONS_MAX} answer options
      - Follow EXACTLY this correct answers count per question:
      ${questionsSpec}

      RULES:
      - If a question has exactly 1 correct answer → "isMultiSelect": false
      - If a question has 2, 3 or 4 correct answers → "isMultiSelect": true
      - correctAnswers array must contain EXACTLY the count specified above
      - correctAnswers are zero-based indices into the options array (0, 1, 2, or 3)
      - Do NOT deviate from the specified counts

      CRITICAL: Return ONLY valid JSON. No markdown formatting, no explanations, no code blocks.

      JSON structure:
      {
        "title": "Engaging quiz title about ${dto.topic}",
        "description": "Brief 1-2 sentence description of what this quiz tests",
        "questions": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswers": [1],
            "isMultiSelect": false
          }
        ]
      }

      Generate ${dto.questionsCount} questions now:`.trim();
  }

  private parseResponse(text: string): AiQuizResponse {
    let clean = text.trim();
    clean = clean
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      clean = match[0];
    }

    try {
      const parsed: unknown = JSON.parse(clean);

      if (!this.isValidAiQuizStructure(parsed)) {
        throw new Error('Invalid AI response structure');
      }

      return parsed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      this.logger.logError(`Failed to parse AI response: ${errorMessage}`, error, AiQuizGeneratorService.name);
      throw new Error('Invalid JSON from AI');
    }
  }

  private isValidAiQuizStructure(data: unknown): data is AiQuizResponse {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return typeof obj.title === 'string' && typeof obj.description === 'string' && Array.isArray(obj.questions);
  }

  private validateQuiz(quiz: AiQuizResponse, expectedCount: number): void {
    if (!quiz.title || typeof quiz.title !== 'string') {
      throw new Error('Invalid quiz title');
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Quiz must have questions array');
    }

    if (quiz.questions.length < QUIZ_QUESTIONS_MIN) {
      throw new Error(`Quiz must have at least ${QUIZ_QUESTIONS_MIN} questions`);
    }

    if (quiz.questions.length !== expectedCount) {
      this.logger.warn(
        `Expected ${expectedCount} questions, got ${quiz.questions.length}. Adjusting...`,
        AiQuizGeneratorService.name,
      );
      quiz.questions = quiz.questions.slice(0, expectedCount);
    }

    quiz.questions.forEach((q, index) => {
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Question ${index + 1}: Invalid question text`);
      }

      if (!Array.isArray(q.options) || q.options.length !== QUIZ_OPTIONS_MAX) {
        throw new Error(`Question ${index + 1}: Must have exactly ${QUIZ_OPTIONS_MAX} options`);
      }

      if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
        throw new Error(`Question ${index + 1}: correctAnswers must be a non-empty array`);
      }

      q.correctAnswers.forEach((answerIdx) => {
        if (typeof answerIdx !== 'number' || answerIdx < 0 || answerIdx >= QUIZ_OPTIONS_MAX) {
          throw new Error(`Question ${index + 1}: Invalid correctAnswer index ${answerIdx}`);
        }
      });

      if (typeof q.isMultiSelect !== 'boolean') {
        q.isMultiSelect = q.correctAnswers.length > 1;
        this.logger.warn(
          `Question ${index + 1}: isMultiSelect not provided, set to ${q.isMultiSelect}`,
          AiQuizGeneratorService.name,
        );
      }

      if (q.isMultiSelect && (q.correctAnswers.length < 2 || q.correctAnswers.length > QUIZ_OPTIONS_MAX)) {
        throw new Error(
          `Question ${index + 1}: Multi-select must have between 2 and ${QUIZ_OPTIONS_MAX} correct answers`,
        );
      }

      if (!q.isMultiSelect && q.correctAnswers.length !== 1) {
        throw new Error(`Question ${index + 1}: Single-select must have exactly 1 correct answer`);
      }
    });
  }
}
