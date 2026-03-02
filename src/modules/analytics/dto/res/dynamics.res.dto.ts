export class ScoreDynamicsItemDto {
  date: string;
  avgAccuracy: number;
  totalAttempts: number;
}

export class ScoreDynamicsResponseDto {
  dynamics: ScoreDynamicsItemDto[];
}

export class DurationDynamicsItemDto {
  attemptId: string;
  completedAt: string;
  durationSeconds: number;
  totalPoints: number;
  maxPossiblePoints: number;
}

export class DurationDynamicsResponseDto {
  dynamics: DurationDynamicsItemDto[];
}
