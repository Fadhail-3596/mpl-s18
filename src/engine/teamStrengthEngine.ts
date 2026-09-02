import { Match, TeamId, TeamStanding } from '../types';
import { TEAMS, TEAMS_LIST } from '../data/teams';

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
 * Team Strength Engine
 * Computes calibrated, dynamic Elo ratings derived from actual competition results.
 * Blends pre-season baseline with in-season results (Bayesian shrinkage) based on sample size.
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

  // Calculate base baseline ratings
  const baseRatings: Record<TeamId, number> = {} as any;
  TEAMS_LIST.forEach((team) => {
    baseRatings[team.id] = TEAMS[team.id]?.rating || 1500;
  });

  // Compute strengths for each team
  TEAMS_LIST.forEach((team) => {
    const teamId = team.id;
    const base = baseRatings[teamId];
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

    // Weight factor scales with season progression (from 0 to 1 as matches progress to 16)
    // Shrinkage factor prevents 1-2 early matches from dominating ratings
    const seasonWeight = Math.min(1.0, standing.matchesPlayed / 16);

    // Match Win-Loss Impact (+/- 10 per net match win scaled by season progression)
    const netMatchWins = standing.matchWins - standing.matchLosses;
    const matchPerformanceRating = netMatchWins * 9.0 * seasonWeight;

    // Game Difference Impact (+/- 3.5 per net game diff scaled by season progression)
    const gameDiffModifier = standing.gameDifference * 3.5 * seasonWeight;

    // Recent Form Impact (from last 3 matches)
    let formModifier = 0;
    if (standing.form.length > 0) {
      const recent = standing.form.slice(-3);
      const recentWins = recent.filter((r) => r === 'W').length;
      const expectedWins = recent.length * 0.5;
      formModifier = (recentWins - expectedWins) * 8.0 * seasonWeight;
    }

    // Opponent Strength of Schedule (SoS)
    let opponentStrengthModifier = 0;
    const opps = teamOpponents[teamId];
    if (opps.length > 0) {
      const avgOppRating = opps.reduce((sum, oppId) => sum + (baseRatings[oppId] || 1500), 0) / opps.length;
      const leagueAvg = 1520;
      opponentStrengthModifier = (avgOppRating - leagueAvg) * 0.15 * seasonWeight;
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
