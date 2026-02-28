import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { getGeminiConfig } from '@/config/gemini.config';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizConfig } from '../shared/constants/quiz.constants';
import { QuizQuestion } from '../shared/interfaces/quiz.interfaces';
import { QUIZ_AI_DIFFICULTY_GUIDELINES } from '../shared/constants/quiz-ai.constants';
import { QUIZ_AI_PROMPT_TEMPLATE } from '../shared/constants/quiz-prompt.template';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { validateQuizQuestions } from '../shared/helpers/quiz-questions.helper';

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
    GuardAssertions.isTrueBadRequest(
      this.genAI !== null,
      'AI quiz generation not configured. Add GEMINI_API_KEY to .env',
    );

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
      this.normalizeAndValidate(quiz, dto.questionsCount);

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

  private buildQuestionsSpec(questionsCount: number): string {
    return Array.from({ length: questionsCount })
      .map((_, i) => {
        const rand = Math.random();
        let count = 1;
        if (rand > 0.95) {
          count = 4;
        } else if (rand > 0.85) {
          count = 3;
        } else if (rand > 0.6) {
          count = 2;
        } else {
          count = 1;
        }

        count = Math.min(count, QuizConfig.OPTIONS.MAX);
        return `  Question ${i + 1}: exactly ${count} correct answer${count > 1 ? 's' : ''}`;
      })
      .join('\n');
  }

  private buildPrompt(dto: GenerateQuizAiDto): string {
    const questionsSpec = this.buildQuestionsSpec(dto.questionsCount);

    return QUIZ_AI_PROMPT_TEMPLATE.replaceAll('{{topic}}', dto.topic)
      .replaceAll('{{difficulty}}', dto.difficulty)
      .replaceAll('{{guidelines}}', QUIZ_AI_DIFFICULTY_GUIDELINES[dto.difficulty])
      .replaceAll('{{questionsCount}}', String(dto.questionsCount))
      .replaceAll('{{optionsMax}}', String(QuizConfig.OPTIONS.MAX))
      .replaceAll('{{questionsSpec}}', questionsSpec);
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

  private normalizeAndValidate(quiz: AiQuizResponse, expectedCount: number): void {
    if (!quiz.title || typeof quiz.title !== 'string') {
      throw new Error('Invalid quiz title');
    }

    if (quiz.questions.length < QuizConfig.OPTIONS.MIN) {
      throw new Error(`Quiz must have at least ${QuizConfig.OPTIONS.MIN} questions`);
    }

    if (quiz.questions.length !== expectedCount) {
      this.logger.warn(
        `Expected ${expectedCount} questions, got ${quiz.questions.length}. Adjusting...`,
        AiQuizGeneratorService.name,
      );
      quiz.questions = quiz.questions.slice(0, expectedCount);
    }

    validateQuizQuestions(quiz.questions);
  }
}
