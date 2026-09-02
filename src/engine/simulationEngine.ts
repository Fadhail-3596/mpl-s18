import { Match, TeamId, PlayoffProbabilities, SimulationConfig, SimulationProgress, ValidScore } from '../types';
import { TEAMS_LIST, getTeam } from '../data/teams';
import { calculateStandings } from './standingsEngine';
import { calculateMatchProbability, sampleBO3Outcome } from './probabilityEngine';

export interface SimulationOutput {
  probabilities: Record<TeamId, PlayoffProbabilities>;
  probabilitiesList: PlayoffProbabilities[];
  iterations: number;
  timeTakenMs: number;
}

export async function runMonteCarloSimulation(
  matches: Match[],
  config: SimulationConfig,
  onProgress?: (progress: SimulationProgress) => void
): Promise<SimulationOutput> {
  const startTime = performance.now();
  const iterations = config.iterations || 100000;
  const currentStandings = calculateStandings(matches);

  // Identify completed matches and remaining matches
  const completedMatches: Match[] = [];
  const unplayedMatches: Match[] = [];

  matches.forEach((m) => {
    if (m.homeScore !== null && m.awayScore !== null && (m.status === 'completed' || m.homeScore > 0 || m.awayScore > 0)) {
      completedMatches.push(m);
    } else {
      unplayedMatches.push(m);
    }
  });

  // If all matches are finished, return deterministic 100% / 0%
  if (unplayedMatches.length === 0) {
    const finalStandings = calculateStandings(matches);
    const probs: Record<TeamId, PlayoffProbabilities> = {} as any;

    finalStandings.forEach((st) => {
      const posProbs = new Array(9).fill(0);
      posProbs[st.rank - 1] = 100;
      probs[st.teamId] = {
        teamId: st.teamId,
        team: st.team,
        positionProbabilities: posProbs,
        playoffChance: st.rank <= 6 ? 100 : 0,
        upperBracketChance: st.rank <= 2 ? 100 : 0,
        playInChance: st.rank >= 3 && st.rank <= 6 ? 100 : 0,
        eliminationChance: st.rank >= 7 ? 100 : 0
      };
    });

    const probabilitiesList = Object.values(probs).sort((a, b) => b.playoffChance - a.playoffChance || b.upperBracketChance - a.upperBracketChance);
    return {
      probabilities: probs,
      probabilitiesList,
      iterations: 1,
      timeTakenMs: Math.round(performance.now() - startTime)
    };
  }

  // Pre-calculate probability tables for unplayed matches
  const matchProbabilities = unplayedMatches.map((m) => ({
    match: m,
    probResult: calculateMatchProbability(m.homeTeam, m.awayTeam, currentStandings, config)
  }));

  // Track counts: positionCounts[teamId][0..8]
  const positionCounts: Record<TeamId, number[]> = {} as any;
  TEAMS_LIST.forEach((team) => {
    positionCounts[team.id] = new Array(9).fill(0);
  });

  // Chunk configuration for asynchronous non-blocking UI
  const chunkSize = iterations > 50000 ? 5000 : 2500;
  let completedIterations = 0;

  // Pre-allocate simulation array structure for performance
  const simMatches: Match[] = [...completedMatches, ...unplayedMatches];
  const unplayedStartIndex = completedMatches.length;

  return new Promise<SimulationOutput>((resolve) => {
    function processChunk() {
      const targetInThisChunk = Math.min(chunkSize, iterations - completedIterations);

      for (let i = 0; i < targetInThisChunk; i++) {
        // Simulate each unplayed match
        for (let j = 0; j < matchProbabilities.length; j++) {
          const { match, probResult } = matchProbabilities[j];
          const score: ValidScore = sampleBO3Outcome(probResult);
          simMatches[unplayedStartIndex + j] = {
            ...match,
            homeScore: score[0],
            awayScore: score[1],
            status: 'completed'
          };
        }

        // Fast rank computation
        const standings = calculateStandings(simMatches);
        standings.forEach((st) => {
          positionCounts[st.teamId][st.rank - 1]++;
        });
      }

      completedIterations += targetInThisChunk;

      if (onProgress) {
        onProgress({
          current: completedIterations,
          total: iterations,
          percentage: Math.round((completedIterations / iterations) * 100),
          isRunning: completedIterations < iterations
        });
      }

      if (completedIterations < iterations) {
        // Yield control to event loop so browser renders smoothly
        setTimeout(processChunk, 0);
      } else {
        // Compute final probabilities
        const probabilities: Record<TeamId, PlayoffProbabilities> = {} as any;

        TEAMS_LIST.forEach((team) => {
          const counts = positionCounts[team.id];
          const posProbs = counts.map((count) => Number(((count / iterations) * 100).toFixed(2)));

          // Derive chances
          const upperBracketChance = Number((posProbs[0] + posProbs[1]).toFixed(2));
          const playInChance = Number((posProbs[2] + posProbs[3] + posProbs[4] + posProbs[5]).toFixed(2));
          const playoffChance = Number((upperBracketChance + playInChance).toFixed(2));
          const eliminationChance = Number((posProbs[6] + posProbs[7] + posProbs[8]).toFixed(2));

          probabilities[team.id] = {
            teamId: team.id,
            team: getTeam(team.id),
            positionProbabilities: posProbs,
            playoffChance,
            upperBracketChance,
            playInChance,
            eliminationChance
          };
        });

        const probabilitiesList = Object.values(probabilities).sort(
          (a, b) => b.playoffChance - a.playoffChance || b.upperBracketChance - a.upperBracketChance
        );

        const timeTakenMs = Math.round(performance.now() - startTime);

        if (onProgress) {
          onProgress({
            current: iterations,
            total: iterations,
            percentage: 100,
            isRunning: false,
            timeTakenMs
          });
        }

        resolve({
          probabilities,
          probabilitiesList,
          iterations,
          timeTakenMs
        });
      }
    }

    // Start first chunk
    processChunk();
  });
}

export function runMonteCarloSimulationAsync(
  matches: Match[],
  scenarioOverrides: Record<string, [number, number]>,
  config: SimulationConfig,
  onProgress?: (progress: SimulationProgress) => void,
  onComplete?: (results: PlayoffProbabilities[]) => void
): void {
  const mergedMatches = matches.map((m) => {
    if (scenarioOverrides[m.id]) {
      const [h, a] = scenarioOverrides[m.id];
      return { ...m, homeScore: h, awayScore: a, status: 'completed' as const };
    }
    return m;
  });

  runMonteCarloSimulation(mergedMatches, config, onProgress).then((output) => {
    if (onComplete) {
      onComplete(output.probabilitiesList);
    }
  });
}
