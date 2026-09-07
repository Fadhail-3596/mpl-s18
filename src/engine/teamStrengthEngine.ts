import { Match, TeamId, TeamStanding } from '../types';
import { TEAMS_LIST } from '../data/teams';

export interface TeamStrengthProfile {
  teamId: TeamId;
  baseRating: number;
  matchPerformanceRating: number;
  gameDiffModifier: number;
  formModifier: number;
  opponentStrengthModifier: number;
  effectiveRating: number;
}

/**
 * Single transparent configuration for the Team Strength & Probability Model.
 * H2H is kept minimal to prevent skewing and avoid double-counting.
 * All 9 teams start on an equal baseline of 1500.
 */
export const PROBABILITY_MODEL_CONFIG = {
  baseRating: 1500,
  matchWinMultiplier: 8.0,      // Scaled by season progression
  gameDiffMultiplier: 3.0,       // Scaled by season progression
  recentFormMultiplier: 6.0,     // Bounded: last 3 matches max +/- 15 points
  opponentStrengthMultiplier: 0.10, // Slight adjustment for schedule strength faced
  h2hMaxEloImpact: 10            // Max H2H adjustment (negligible ~1-2% series win prob)
};

/**
 * Team Strength Engine
 * Computes calibrated, dynamic Elo ratings derived from actual competition results.
 * Neutral baseline (1500) for all teams prevents arbitrary pre-season bias.
 */
export function calculateTeamStrengths(
  matches: Match[],
  standings?: TeamStanding[]
): Record<TeamId, TeamStrengthProfile> {
  const result: Record<TeamId, TeamStrengthProfile> = {} as any;

  // 1. Calculate base ratings and basic stats
  const completedMatches = matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null && (m.status === 'completed' || m.homeScore > 0 || m.awayScore > 0)
  );

  const teamOpponents: Record<TeamId, TeamId[]> = {} as any;
  TEAMS_LIST.forEach((team) => {
    teamOpponents[team.id] = [];
  });

  completedMatches.forEach((m) => {
    teamOpponents[m.homeTeam].push(m.awayTeam);
    teamOpponents[m.awayTeam].push(m.homeTeam);
  });

  // Base baseline ratings are equal (1500) for all 9 teams
  const base = PROBABILITY_MODEL_CONFIG.baseRating;

  // Compute strengths for each team
  TEAMS_LIST.forEach((team) => {
    const teamId = team.id;
    const standing = standings?.find((s) => s.teamId === teamId);

    if (!standing || standing.matchesPlayed === 0) {
      result[teamId] = {
        teamId,
        baseRating: base,
        matchPerformanceRating: 0,
        gameDiffModifier: 0,
        formModifier: 0,
        opponentStrengthModifier: 0,
        effectiveRating: base
      };
      return;
    }

    // Weight factor scales smoothly with season progression (from 0 to 1 as matches progress to 16)
    const seasonWeight = Math.min(1.0, standing.matchesPlayed / 16);

    // Match Win-Loss Impact
    const netMatchWins = standing.matchWins - standing.matchLosses;
    const matchPerformanceRating = netMatchWins * PROBABILITY_MODEL_CONFIG.matchWinMultiplier * seasonWeight;

    // Game Difference Impact
    const gameDiffModifier = standing.gameDifference * PROBABILITY_MODEL_CONFIG.gameDiffMultiplier * seasonWeight;

    // Recent Form Impact (from last 3 matches, strictly capped)
    let formModifier = 0;
    if (standing.form.length > 0) {
      const recent = standing.form.slice(-3);
      const recentWins = recent.filter((r) => r === 'W').length;
      const expectedWins = recent.length * 0.5;
      formModifier = Math.max(-15, Math.min(15, (recentWins - expectedWins) * PROBABILITY_MODEL_CONFIG.recentFormMultiplier * seasonWeight));
    }

    // Opponent Strength of Schedule (SoS)
    let opponentStrengthModifier = 0;
    const opps = teamOpponents[teamId];
    if (opps.length > 0) {
      const avgOppRating = opps.reduce((sum, oppId) => {
        const oppStanding = standings?.find((s) => s.teamId === oppId);
        const oppNet = oppStanding ? (oppStanding.matchWins - oppStanding.matchLosses) * 8 : 0;
        return sum + (base + oppNet);
      }, 0) / opps.length;
      opponentStrengthModifier = (avgOppRating - base) * PROBABILITY_MODEL_CONFIG.opponentStrengthMultiplier * seasonWeight;
    }

    const effectiveRating = Math.round(
      base + matchPerformanceRating + gameDiffModifier + formModifier + opponentStrengthModifier
    );

    result[teamId] = {
      teamId,
      baseRating: base,
      matchPerformanceRating: Math.round(matchPerformanceRating),
      gameDiffModifier: Math.round(gameDiffModifier),
      formModifier: Math.round(formModifier),
      opponentStrengthModifier: Math.round(opponentStrengthModifier),
      effectiveRating
    };
  });

  return result;
}
