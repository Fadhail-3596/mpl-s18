import { Match, TeamId, ValidScore, SimulationConfig } from '../types';
import { TEAMS } from '../data/teams';
import { TeamStanding } from '../types';

export interface MatchProbabilityResult {
  matchId: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  homeWinProbability: number; // 0.0 to 1.0
  awayWinProbability: number; // 0.0 to 1.0
  scoreProbabilities: {
    '2-0': number;
    '2-1': number;
    '1-2': number;
    '0-2': number;
  };
}

export function calculateMatchProbability(
  homeTeamId: TeamId,
  awayTeamId: TeamId,
  currentStandings?: TeamStanding[],
  config?: Partial<SimulationConfig>
): MatchProbabilityResult {
  const modelType = config?.modelType || 'dynamic_strength';

  let homeRating = TEAMS[homeTeamId]?.rating || 1500;
  let awayRating = TEAMS[awayTeamId]?.rating || 1500;

  if (modelType === 'equal_50_50') {
    // Pure 50-50 model
    const homeP = 0.5;
    const awayP = 0.5;
    return {
      matchId: '',
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      homeWinProbability: homeP,
      awayWinProbability: awayP,
      scoreProbabilities: {
        '2-0': 0.25,
        '2-1': 0.25,
        '1-2': 0.25,
        '0-2': 0.25
      }
    };
  }

  // If we have current season standings, blend baseline rating with in-season performance
  if (currentStandings && (modelType === 'dynamic_strength' || modelType === 'recent_form_weighted')) {
    const homeStanding = currentStandings.find((s) => s.teamId === homeTeamId);
    const awayStanding = currentStandings.find((s) => s.teamId === awayTeamId);

    if (homeStanding && homeStanding.matchesPlayed > 0) {
      const matchDiff = (homeStanding.matchWins - homeStanding.matchLosses) * 20;
      const gameDiffMod = homeStanding.gameDifference * 8;
      let formBonus = 0;
      if (modelType === 'recent_form_weighted' && homeStanding.form.length > 0) {
        const last3Wins = homeStanding.form.slice(-3).filter((r) => r === 'W').length;
        formBonus = (last3Wins - 1.5) * 25;
      }
      homeRating += matchDiff + gameDiffMod + formBonus;
    }

    if (awayStanding && awayStanding.matchesPlayed > 0) {
      const matchDiff = (awayStanding.matchWins - awayStanding.matchLosses) * 20;
      const gameDiffMod = awayStanding.gameDifference * 8;
      let formBonus = 0;
      if (modelType === 'recent_form_weighted' && awayStanding.form.length > 0) {
        const last3Wins = awayStanding.form.slice(-3).filter((r) => r === 'W').length;
        formBonus = (last3Wins - 1.5) * 25;
      }
      awayRating += matchDiff + gameDiffMod + formBonus;
    }
  }

  // Standard Elo logistic formula for individual single game win probability
  const ratingDiff = homeRating - awayRating;
  const pSingleGameHome = 1 / (1 + Math.pow(10, -ratingDiff / 400));
  const pSingleGameAway = 1 - pSingleGameHome;

  // In BO3 series:
  // P(2-0) = p^2
  // P(2-1) = 2 * p^2 * (1-p)
  // P(1-2) = 2 * (1-p)^2 * p
  // P(0-2) = (1-p)^2
  const p2_0 = Math.pow(pSingleGameHome, 2);
  const p2_1 = 2 * Math.pow(pSingleGameHome, 2) * pSingleGameAway;
  const p1_2 = 2 * Math.pow(pSingleGameAway, 2) * pSingleGameHome;
  const p0_2 = Math.pow(pSingleGameAway, 2);

  const homeWinProb = p2_0 + p2_1;
  const awayWinProb = p1_2 + p0_2;

  return {
    matchId: '',
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    homeWinProbability: Number(homeWinProb.toFixed(4)),
    awayWinProbability: Number(awayWinProb.toFixed(4)),
    scoreProbabilities: {
      '2-0': Number(p2_0.toFixed(4)),
      '2-1': Number(p2_1.toFixed(4)),
      '1-2': Number(p1_2.toFixed(4)),
      '0-2': Number(p0_2.toFixed(4))
    }
  };
}

export function sampleBO3Outcome(probResult: MatchProbabilityResult): ValidScore {
  const rand = Math.random();
  const { '2-0': p20, '2-1': p21, '1-2': p12 } = probResult.scoreProbabilities;

  if (rand < p20) {
    return [2, 0];
  } else if (rand < p20 + p21) {
    return [2, 1];
  } else if (rand < p20 + p21 + p12) {
    return [1, 2];
  } else {
    return [0, 2];
  }
}
