import { Match, TeamId, ValidScore, SimulationConfig, TeamStanding } from '../types';
import { calculateBO3MatchProbability, sampleBO3Outcome, MatchProbabilityResult } from './matchProbabilityEngine';

export {
  calculateBO3MatchProbability,
  sampleBO3Outcome,
  type MatchProbabilityResult
};

// Backward-compatibility wrapper for legacy imports
export function calculateMatchProbability(
  homeTeamId: TeamId,
  awayTeamId: TeamId,
  currentStandings?: TeamStanding[],
  config?: Partial<SimulationConfig>
): MatchProbabilityResult {
  return calculateBO3MatchProbability(homeTeamId, awayTeamId, currentStandings, config);
}
