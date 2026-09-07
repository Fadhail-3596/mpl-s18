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

/**
 * Robust, deterministic multi-team tiebreaker resolution for standings.
 * Correctly handles 2-team, 3-team, and multi-team ties using mini-standings
 * so the outcome is independent of initial array ordering.
 */
export function sortTeamsOfficially<T extends StandingsRecordForRanking>(
  teams: T[],
  h2hMatrix?: H2HMatrix
): T[] {
  // First, group teams by Match Wins and Game Difference
  const groups = new Map<string, T[]>();
  teams.forEach((team) => {
    const key = `${team.matchWins}_${team.gameDifference}`;
    const list = groups.get(key) || [];
    list.push(team);
    groups.set(key, list);
  });

  // Sort group keys by Match Wins (descending), then Game Difference (descending)
  const sortedKeys = Array.from(groups.keys()).sort((kA, kB) => {
    const [wA, gdA] = kA.split('_').map(Number);
    const [wB, gdB] = kB.split('_').map(Number);
    if (wA !== wB) return wB - wA;
    return gdB - gdA;
  });

  const finalSorted: T[] = [];

  for (const key of sortedKeys) {
    const tiedGroup = groups.get(key)!;
    if (tiedGroup.length === 1) {
      finalSorted.push(tiedGroup[0]);
    } else if (tiedGroup.length === 2) {
      // Exactly 2 teams tied
      const [t1, t2] = tiedGroup;
      const cmp = compareTeamsForOfficialRanking(t1, t2, h2hMatrix);
      if (cmp <= 0) {
        finalSorted.push(t1, t2);
      } else {
        finalSorted.push(t2, t1);
      }
    } else {
      // 3 or more teams tied on Match Wins & Game Diff
      const resolvedTiedGroup = resolveMultiTeamTie(tiedGroup, h2hMatrix);
      finalSorted.push(...resolvedTiedGroup);
    }
  }

  return finalSorted;
}

function resolveMultiTeamTie<T extends StandingsRecordForRanking>(
  tiedGroup: T[],
  h2hMatrix?: H2HMatrix
): T[] {
  if (tiedGroup.length <= 2) {
    return [...tiedGroup].sort((a, b) => compareTeamsForOfficialRanking(a, b, h2hMatrix));
  }

  if (!h2hMatrix) {
    return [...tiedGroup].sort((a, b) => {
      if (a.gamesWon !== b.gamesWon) return b.gamesWon - a.gamesWon;
      return (a.teamName || a.teamId).localeCompare(b.teamName || b.teamId);
    });
  }

  const tiedIds = tiedGroup.map((t) => t.teamId);
  const mini = h2hMatrix.getMiniStandings(tiedIds);

  // Group by mini-standings performance: matchWins, then gameDiff, then gamesWon
  const miniScores = new Map<string, T[]>();
  tiedGroup.forEach((team) => {
    const stat = mini[team.teamId] || { matchWins: 0, gameDiff: 0, gamesWon: 0 };
    const miniKey = `${stat.matchWins}_${stat.gameDiff}_${stat.gamesWon}`;
    const list = miniScores.get(miniKey) || [];
    list.push(team);
    miniScores.set(miniKey, list);
  });

  // If mini-standings separated some teams, recursively sort subgroups
  if (miniScores.size > 1) {
    const sortedMiniKeys = Array.from(miniScores.keys()).sort((kA, kB) => {
      const [wA, gdA, gwA] = kA.split('_').map(Number);
      const [wB, gdB, gwB] = kB.split('_').map(Number);
      if (wA !== wB) return wB - wA;
      if (gdA !== gdB) return gdB - gdA;
      return gwB - gwA;
    });

    const result: T[] = [];
    for (const mKey of sortedMiniKeys) {
      const subGroup = miniScores.get(mKey)!;
      result.push(...resolveMultiTeamTie(subGroup, h2hMatrix));
    }
    return result;
  }

  // If all teams have identical mini-standings (e.g. perfect 1-1, 0 GD cycle),
  // fallback to overall season Games Won (descending), then Alphabetical
  return [...tiedGroup].sort((a, b) => {
    if (a.gamesWon !== b.gamesWon) return b.gamesWon - a.gamesWon;
    return (a.teamName || a.teamId).localeCompare(b.teamName || b.teamId);
  });
}
