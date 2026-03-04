import { IsInt, Max, Min } from 'class-validator';

export class QuizBaseDto {
  @IsInt({ message: 'Frequency must be a number' })
  @Min(1, { message: 'Frequency must be at least 1 day' })
  @Max(365, { message: 'Frequency must not exceed 365 days' })
  frequencyInDays: number;

  @IsInt({ message: 'Time limit must be a number' })
  @Min(20, { message: 'Time limit must be at least 20 minutes' })
  @Max(120, { message: 'Time limit must not exceed 120 minutes' })
  timeLimitMinutes: number;
}
