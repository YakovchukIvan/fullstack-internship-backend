import { DurationDynamicsRaw, ScoreDynamicsRow } from '../interfaces/dynamics.interfaces';
import {
  DurationDynamicsItemDto,
  DurationDynamicsResponseDto,
  ScoreDynamicsItemDto,
  ScoreDynamicsResponseDto,
} from '../dto/res/dynamics.res.dto';

export function toScoreDynamicsItemDto(row: ScoreDynamicsRow): ScoreDynamicsItemDto {
  return {
    date: new Date(row.date).toISOString().slice(0, 10),
    avgAccuracy: Number(row.avgAccuracy),
    totalAttempts: Number(row.totalAttempts),
  };
}

export function toScoreDynamicsResponseDto(rows: ScoreDynamicsRow[]): ScoreDynamicsResponseDto {
  return { dynamics: rows.map(toScoreDynamicsItemDto) };
}

export function toDurationDynamicsItemDto(row: DurationDynamicsRaw): DurationDynamicsItemDto {
  return {
    attemptId: row.attemptId,
    completedAt: new Date(row.completedAt).toISOString(),
    durationSeconds: row.durationSeconds,
    totalPoints: Number(row.totalPoints),
    maxPossiblePoints: Number(row.maxPossiblePoints),
  };
}

export function toDurationDynamicsResponseDto(rows: DurationDynamicsRaw[]): DurationDynamicsResponseDto {
  return { dynamics: rows.map(toDurationDynamicsItemDto) };
}
