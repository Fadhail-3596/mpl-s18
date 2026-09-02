import { TeamId } from '../types';
import { H2HMatrix } from './h2hEngine';

export interface StandingsRecordForRanking {
  teamId: TeamId;
  teamName?: string;
  matchWins: number;
  matchLosses: number;
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
}

/**
 * Official MPL ID Season 18 Tiebreaker Hierarchy:
 * 1. Match Wins (Desc)
 * 2. Game Difference (Desc)
 * 3. Head-to-Head (Direct matchup victories, then direct matchup game difference)
 * 4. Total Games Won (Desc)
 * 5. Name Alphabetical Fallback
 */
export function compareTeamsForOfficialRanking(
  a: StandingsRecordForRanking,
  b: StandingsRecordForRanking,
  h2hMatrix?: H2HMatrix
): number {
  // 1. Match Wins (Desc)
  if (a.matchWins !== b.matchWins) {
    return b.matchWins - a.matchWins;
  }

  // 2. Net Game Difference (Desc)
  if (a.gameDifference !== b.gameDifference) {
    return b.gameDifference - a.gameDifference;
  }

  // 3. Head-to-Head Direct Matchup
  if (h2hMatrix) {
    const h2hCompare = h2hMatrix.compareTeams(a.teamId, b.teamId);
    if (h2hCompare !== 0) {
      // compareTeams returns > 0 if A beats B, so return -h2hCompare for descending sort
      return -h2hCompare;
    }
  }

  // 4. Total Games Won (Desc)
  if (a.gamesWon !== b.gamesWon) {
    return b.gamesWon - a.gamesWon;
  }

  // 5. Fallback Alphabetical
  const nameA = a.teamName || a.teamId;
  const nameB = b.teamName || b.teamId;
  return nameA.localeCompare(nameB);
}
