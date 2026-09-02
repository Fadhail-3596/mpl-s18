import { Match, TeamId, TeamStanding } from '../types';
import { calculateStandings } from './standingsEngine';
import { analyzeQualifications } from './qualificationEngine';

export interface ScenarioStandingComparison {
  teamId: TeamId;
  realRank: number;
  simulatedRank: number;
  rankDelta: number; // Positive = climbed up (e.g. 3 -> 1 is +2)
  realMatchWins: number;
  simulatedMatchWins: number;
  realGameDiff: number;
  simulatedGameDiff: number;
  realStatus: string;
  simulatedStatus: string;
  standing: TeamStanding;
}

export function buildScenarioMatches(
  baseSchedule: Match[],
  realResults: Record<string, { homeScore: number; awayScore: number }>,
  scenarioOverrides: Record<string, [number, number]>
): Match[] {
  return baseSchedule.map((m) => {
    // 1. Scenario override takes highest priority for what-if
    if (scenarioOverrides[m.id]) {
      const [h, a] = scenarioOverrides[m.id];
      return {
        ...m,
        homeScore: h,
        awayScore: a,
        status: 'completed'
      };
    }

    // 2. Real stored completed results
    if (realResults[m.id]) {
      const { homeScore, awayScore } = realResults[m.id];
      return {
        ...m,
        homeScore,
        awayScore,
        status: 'completed'
      };
    }

    // 3. Fallback to base match
    return m;
  });
}

export function evaluateScenario(
  baseSchedule: Match[],
  realResults: Record<string, { homeScore: number; awayScore: number }>,
  scenarioOverrides: Record<string, [number, number]>
): {
  realStandings: TeamStanding[];
  simulatedStandings: TeamStanding[];
  comparison: ScenarioStandingComparison[];
  overridesCount: number;
} {
  // 1. Real Matches
  const realMatches = baseSchedule.map((m) => {
    if (realResults[m.id]) {
      return {
        ...m,
        homeScore: realResults[m.id].homeScore,
        awayScore: realResults[m.id].awayScore,
        status: 'completed' as const
      };
    }
    return m;
  });

  const realQualifications = analyzeQualifications(realMatches);
  const realStandings = calculateStandings(realMatches, realQualifications);

  // 2. Simulated Matches
  const simulatedMatches = buildScenarioMatches(baseSchedule, realResults, scenarioOverrides);
  const simulatedQualifications = analyzeQualifications(simulatedMatches);
  const simulatedStandings = calculateStandings(simulatedMatches, simulatedQualifications);

  // 3. Compare standings
  const realRankMap = new Map<TeamId, TeamStanding>();
  realStandings.forEach((st) => realRankMap.set(st.teamId, st));

  const comparison: ScenarioStandingComparison[] = simulatedStandings.map((simSt) => {
    const realSt = realRankMap.get(simSt.teamId)!;
    const rankDelta = realSt.rank - simSt.rank; // e.g. realRank = 4, simRank = 2 -> +2

    return {
      teamId: simSt.teamId,
      realRank: realSt.rank,
      simulatedRank: simSt.rank,
      rankDelta,
      realMatchWins: realSt.matchWins,
      simulatedMatchWins: simSt.matchWins,
      realGameDiff: realSt.gameDifference,
      simulatedGameDiff: simSt.gameDifference,
      realStatus: realSt.qualificationStatus,
      simulatedStatus: simSt.qualificationStatus,
      standing: simSt
    };
  });

  return {
    realStandings,
    simulatedStandings,
    comparison,
    overridesCount: Object.keys(scenarioOverrides).length
  };
}

export function evaluateWhatIfScenario(
  currentMatches: Match[],
  scenarioOverrides: Record<string, [number, number]>
): {
  realStandings: TeamStanding[];
  simulatedStandings: TeamStanding[];
  comparison: ScenarioStandingComparison[];
} {
  const realQualifications = analyzeQualifications(currentMatches);
  const realStandings = calculateStandings(currentMatches, realQualifications);

  const simulatedMatches = currentMatches.map((m) => {
    if (scenarioOverrides[m.id]) {
      const [h, a] = scenarioOverrides[m.id];
      return {
        ...m,
        homeScore: h,
        awayScore: a,
        status: 'completed' as const
      };
    }
    return m;
  });

  const simulatedQualifications = analyzeQualifications(simulatedMatches);
  const simulatedStandings = calculateStandings(simulatedMatches, simulatedQualifications);

  const realRankMap = new Map<TeamId, TeamStanding>();
  realStandings.forEach((st) => realRankMap.set(st.teamId, st));

  const comparison: ScenarioStandingComparison[] = simulatedStandings.map((simSt) => {
    const realSt = realRankMap.get(simSt.teamId) || simSt;
    const rankDelta = realSt.rank - simSt.rank;

    return {
      teamId: simSt.teamId,
      realRank: realSt.rank,
      simulatedRank: simSt.rank,
      rankDelta,
      realMatchWins: realSt.matchWins,
      simulatedMatchWins: simSt.matchWins,
      realGameDiff: realSt.gameDifference,
      simulatedGameDiff: simSt.gameDifference,
      realStatus: realSt.qualificationStatus,
      simulatedStatus: simSt.qualificationStatus,
      standing: simSt
    };
  });

  return {
    realStandings,
    simulatedStandings,
    comparison
  };
}
