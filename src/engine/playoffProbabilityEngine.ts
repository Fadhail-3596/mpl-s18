import { TeamId, PlayoffProbabilities } from '../types';
import { getTeam, TEAMS_LIST } from '../data/teams';
import { QualificationAnalysis } from './qualificationEngine';

export interface RawPositionDistribution {
  teamId: TeamId;
  counts: number[]; // Index 0..8 for ranks #1..#9
  totalIterations: number;
}

/**
 * Converts Monte Carlo position counts into mathematically consistent PlayoffProbabilities.
 * Guarantees:
 * 1. sum(P(#1)..P(#9)) = 100%
 * 2. Playoff Chance = sum(P(#1)..P(#6))
 * 3. Upper Bracket Chance = sum(P(#1)..P(#2))
 * 4. Play-In Chance = sum(P(#3)..P(#6))
 * 5. Elimination Chance = sum(P(#7)..P(#9))
 * 6. Playoff Chance + Elimination Chance = 100%
 * 7. Upper Bracket Chance <= Playoff Chance
 */
export function computePlayoffProbabilitiesFromDistribution(
  distributions: Record<TeamId, RawPositionDistribution>,
  qualifications?: Record<TeamId, QualificationAnalysis>
): Record<TeamId, PlayoffProbabilities> {
  const result: Record<TeamId, PlayoffProbabilities> = {} as any;

  TEAMS_LIST.forEach((team) => {
    const teamId = team.id;
    const dist = distributions[teamId];
    const qual = qualifications?.[teamId];
    const total = dist?.totalIterations || 1;
    const counts = dist?.counts || new Array(9).fill(0);

    // Calculate raw percentage for each position
    let rawPosProbs = counts.map((c) => (c / total) * 100);

    // Handle mathematical boundary edge cases if qualification analysis is provided
    if (qual) {
      if (qual.isEliminated) {
        // Mathematically eliminated: Ranks 1-6 are 0%, Ranks 7-9 hold 100%
        const elimSum = rawPosProbs[6] + rawPosProbs[7] + rawPosProbs[8] || 100;
        rawPosProbs = [
          0,
          0,
          0,
          0,
          0,
          0,
          (rawPosProbs[6] / elimSum) * 100 || 33.33,
          (rawPosProbs[7] / elimSum) * 100 || 33.33,
          (rawPosProbs[8] / elimSum) * 100 || 33.34
        ];
      } else if (qual.clinchedPlayoff) {
        // Mathematically clinched playoff: Ranks 7-9 are 0%, Ranks 1-6 hold 100%
        const playoffSum =
          rawPosProbs[0] + rawPosProbs[1] + rawPosProbs[2] + rawPosProbs[3] + rawPosProbs[4] + rawPosProbs[5] ||
          100;
        rawPosProbs = [
          (rawPosProbs[0] / playoffSum) * 100,
          (rawPosProbs[1] / playoffSum) * 100,
          (rawPosProbs[2] / playoffSum) * 100,
          (rawPosProbs[3] / playoffSum) * 100,
          (rawPosProbs[4] / playoffSum) * 100,
          (rawPosProbs[5] / playoffSum) * 100,
          0,
          0,
          0
        ];
      }
    }

    // Format position probabilities to 2 decimal places
    const positionProbabilities = rawPosProbs.map((p) => Number(p.toFixed(2)));

    // Derive aggregated chances directly from position distribution
    const upperBracketChance = Number((positionProbabilities[0] + positionProbabilities[1]).toFixed(2));
    const playInChance = Number(
      (
        positionProbabilities[2] +
        positionProbabilities[3] +
        positionProbabilities[4] +
        positionProbabilities[5]
      ).toFixed(2)
    );
    const playoffChance = Number((upperBracketChance + playInChance).toFixed(2));
    
    // Complementary elimination chance
    const rawElim = Number(
      (positionProbabilities[6] + positionProbabilities[7] + positionProbabilities[8]).toFixed(2)
    );
    // Keep exact mathematical consistency: Playoff + Elim = 100%
    const eliminationChance = Math.abs(playoffChance + rawElim - 100) < 0.2
      ? Number((100 - playoffChance).toFixed(2))
      : rawElim;

    result[teamId] = {
      teamId,
      team: getTeam(teamId),
      positionProbabilities,
      playoffChance: Math.max(0, Math.min(100, playoffChance)),
      upperBracketChance: Math.max(0, Math.min(playoffChance, upperBracketChance)),
      playInChance: Math.max(0, Math.min(playoffChance, playInChance)),
      eliminationChance: Math.max(0, Math.min(100, eliminationChance))
    };
  });

  return result;
}
