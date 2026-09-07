import { Match, ValidScore } from '../types';

/**
 * Standard BO3 valid final scores in MPL ID:
 * Only [2, 0], [2, 1], [1, 2], [0, 2] are valid completed scores.
 * 0-0, 1-1, 1-0, 0-1, negative values, values > 2, or half-null are strictly INVALID.
 */
export const VALID_BO3_SCORES: readonly ValidScore[] = [
  [2, 0],
  [2, 1],
  [1, 2],
  [0, 2]
] as const;

export function isValidBO3Score(homeScore: unknown, awayScore: unknown): boolean {
  if (typeof homeScore !== 'number' || typeof awayScore !== 'number') return false;
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) return false;
  return (
    (homeScore === 2 && awayScore === 0) ||
    (homeScore === 2 && awayScore === 1) ||
    (homeScore === 1 && awayScore === 2) ||
    (homeScore === 0 && awayScore === 2)
  );
}

export function isCompletedMatch(match: Match): boolean {
  if (match.status !== 'completed' && match.homeScore === null && match.awayScore === null) {
    return false;
  }
  return isValidBO3Score(match.homeScore, match.awayScore);
}

export function sanitizeBO3Score(home: unknown, away: unknown): [number, number] | null {
  const h = typeof home === 'string' ? parseInt(home, 10) : home;
  const a = typeof away === 'string' ? parseInt(away, 10) : away;
  if (isValidBO3Score(h, a)) {
    return [h as number, a as number];
  }
  return null;
}
