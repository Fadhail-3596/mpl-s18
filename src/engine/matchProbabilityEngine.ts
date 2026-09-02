import { TeamId, ValidScore, SimulationConfig } from '../types';
import { TeamStanding } from '../types';
import { calculateTeamStrengths } from './teamStrengthEngine';

export interface BO3OutcomeProbabilities {
  '2-0': number;
  '2-1': number;
  '1-2': number;
  '0-2': number;
}

export interface MatchProbabilityResult {
  homeTeam: TeamId;
  awayTeam: TeamId;
  homeWinProbability: number;
  awayWinProbability: number;
  scoreProbabilities: BO3OutcomeProbabilities;
  cumulativeProbabilities: [number, number, number, number]; // for ultra-fast sampling
}

/**
 * Calculates exact BO3 series outcome probability distribution
 * P(2-0) = p^2
 * P(2-1) = 2 * p^2 * (1-p)
 * P(1-2) = 2 * (1-p)^2 * p
 * P(0-2) = (1-p)^2
 * Sum equals exactly 1.0 (100%).
 */
export function calculateBO3MatchProbability(
  homeTeamId: TeamId,
  awayTeamId: TeamId,
  teamRatings?: Record<TeamId, number> | TeamStanding[],
  config?: Partial<SimulationConfig>
): MatchProbabilityResult {
  const modelType = config?.modelType || 'dynamic_strength';

  if (modelType === 'equal_50_50') {
    const p = 0.5;
    const p20 = 0.25;
    const p21 = 0.25;
    const p12 = 0.25;
    const p02 = 0.25;
    return {
      homeTeam: homeTeamId,
      awayTeam: awayTeamId,
      homeWinProbability: 0.5,
      awayWinProbability: 0.5,
      scoreProbabilities: { '2-0': p20, '2-1': p21, '1-2': p12, '0-2': p02 },
      cumulativeProbabilities: [p20, p20 + p21, p20 + p21 + p12, 1.0]
    };
  }

  let ratingHome = 1500;
  let ratingAway = 1500;

  if (teamRatings) {
    if (Array.isArray(teamRatings)) {
      // It's TeamStanding[]
      const strengths = calculateTeamStrengths([], teamRatings);
      ratingHome = strengths[homeTeamId]?.effectiveRating || 1500;
      ratingAway = strengths[awayTeamId]?.effectiveRating || 1500;
    } else {
      ratingHome = teamRatings[homeTeamId] || 1500;
      ratingAway = teamRatings[awayTeamId] || 1500;
    }
  }

  // Logistic Elo formula for single-game win probability
  const ratingDiff = ratingHome - ratingAway;
  const rawP = 1 / (1 + Math.pow(10, -ratingDiff / 400));

  // Esports competitive parity bounds: cap single-game win probability between 28% and 72%
  const pSingleGameHome = Math.max(0.28, Math.min(0.72, rawP));
  const pSingleGameAway = 1.0 - pSingleGameHome;

  // BO3 series outcome probability derivation:
  // P(2-0) = p^2
  // P(2-1) = 2 * p^2 * (1-p)
  // P(1-2) = 2 * (1-p)^2 * p
  // P(0-2) = (1-p)^2
  const p2_0 = pSingleGameHome * pSingleGameHome;
  const p2_1 = 2 * (pSingleGameHome * pSingleGameHome) * pSingleGameAway;
  const p1_2 = 2 * (pSingleGameAway * pSingleGameAway) * pSingleGameHome;
  const p0_2 = pSingleGameAway * pSingleGameAway;

  // Normalize so sum is exactly 1.0
  const total = p2_0 + p2_1 + p1_2 + p0_2;
  const n20 = p2_0 / total;
  const n21 = p2_1 / total;
  const n12 = p1_2 / total;
  const n02 = p0_2 / total;

  const homeWinProb = n20 + n21;
  const awayWinProb = n12 + n02;

  return {
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    homeWinProbability: Number(homeWinProb.toFixed(4)),
    awayWinProbability: Number(awayWinProb.toFixed(4)),
    scoreProbabilities: {
      '2-0': Number(n20.toFixed(4)),
      '2-1': Number(n21.toFixed(4)),
      '1-2': Number(n12.toFixed(4)),
      '0-2': Number(n02.toFixed(4))
    },
    cumulativeProbabilities: [n20, n20 + n21, n20 + n21 + n12, 1.0]
  };
}

/**
 * Fast BO3 Outcome sampler using a provided PRNG random function (0 to 1)
 */
export function sampleBO3Outcome(
  probResult: MatchProbabilityResult,
  randomFn: () => number = Math.random
): ValidScore {
  const r = randomFn();
  const [c0, c1, c2] = probResult.cumulativeProbabilities;

  if (r < c0) return [2, 0];
  if (r < c1) return [2, 1];
  if (r < c2) return [1, 2];
  return [0, 2];
}
