import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { getGeminiConfig } from '@/config/gemini.config';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { AppLogger } from '@/common/logger/app-logger';
import { QUIZ_QUESTIONS_MIN, QUIZ_OPTIONS_MAX } from '../constants/quiz.constants';
import { QuizQuestion } from '../interfaces/quiz.interfaces';
import { QUIZ_AI_DIFFICULTY_GUIDELINES } from '../constants/quiz-ai.constants';
import { QUIZ_AI_PROMPT_TEMPLATE } from '../constants/quiz-prompt.template';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { validateQuizQuestions } from '../helper/quiz-questions.helper';

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
    return Array.from({ length: questionsCount }, () => Math.floor(Math.random() * QUIZ_OPTIONS_MAX) + 1)
      .map((count, i) => {
        const isMulti = count > 1;
        return `  Question ${i + 1}: exactly ${count} correct answer${count > 1 ? 's' : ''}, "isMultiSelect": ${isMulti}`;
      })
      .join('\n');
  }

  private buildPrompt(dto: GenerateQuizAiDto): string {
    const questionsSpec = this.buildQuestionsSpec(dto.questionsCount);

    return QUIZ_AI_PROMPT_TEMPLATE.replaceAll('{{topic}}', dto.topic)
      .replaceAll('{{difficulty}}', dto.difficulty)
      .replaceAll('{{guidelines}}', QUIZ_AI_DIFFICULTY_GUIDELINES[dto.difficulty])
      .replaceAll('{{questionsCount}}', String(dto.questionsCount))
      .replaceAll('{{optionsMax}}', String(QUIZ_OPTIONS_MAX))
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
      if (typeof q.isMultiSelect !== 'boolean') {
        q.isMultiSelect = q.correctAnswers.length > 1;
        this.logger.warn(
          `Question ${index + 1}: isMultiSelect not provided, set to ${q.isMultiSelect}`,
          AiQuizGeneratorService.name,
        );
      }
    });

    validateQuizQuestions(quiz.questions);
  }
}
