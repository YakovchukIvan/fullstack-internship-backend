import { ConfigService } from '@nestjs/config';

export function getGeminiConfig(configService: ConfigService) {
  return {
    apiKey: configService.get<string>('GEMINI_API_KEY'),
    dailyLimit: Number(configService.get('AI_QUIZ_DAILY_LIMIT', 5)),
    model: configService.get<string>('GEMINI_MODEL', 'gemini-2.0-flash'),
  };
}
