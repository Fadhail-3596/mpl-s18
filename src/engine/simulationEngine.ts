import { Match, TeamId, PlayoffProbabilities, SimulationConfig, SimulationProgress, ValidScore } from '../types';
import { TEAMS_LIST, getTeam } from '../data/teams';
import { calculateStandings } from './standingsEngine';
import { calculateBO3MatchProbability, sampleBO3Outcome, MatchProbabilityResult } from './matchProbabilityEngine';
import { calculateTeamStrengths } from './teamStrengthEngine';
import { analyzeQualifications } from './qualificationEngine';
import { computePlayoffProbabilitiesFromDistribution, RawPositionDistribution } from './playoffProbabilityEngine';
import { DEFAULT_SIMULATION_ITERATIONS } from '../data/rules';
import { isCompletedMatch } from './scoreValidator';

export interface SimulationOutput {
  probabilities: Record<TeamId, PlayoffProbabilities>;
  probabilitiesList: PlayoffProbabilities[];
  iterations: number;
  timeTakenMs: number;
}

// Simple deterministic fast PRNG (Mulberry32)
function createMulberry32PRNG(seed: number) {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generates a 32-bit hash integer from string state
function hashStateString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Global in-memory cache for simulation results
const simulationCache = new Map<string, SimulationOutput>();

export function clearSimulationCache(): void {
  simulationCache.clear();
}

/**
 * High-Performance Monte Carlo Simulation Engine
 * Runs 100,000 (default) iterations of the remaining MPL ID Season 18 schedule.
 * Uses typed arrays, seeded PRNG for stability, and state-based caching.
 */
export async function runMonteCarloSimulation(
  matches: Match[],
  config: SimulationConfig,
  onProgress?: (progress: SimulationProgress) => void
): Promise<SimulationOutput> {
  const startTime = performance.now();
  const iterations = config.iterations || DEFAULT_SIMULATION_ITERATIONS;
  const currentStandings = calculateStandings(matches);
  const qualifications = analyzeQualifications(matches);

  // Identify completed and unplayed matches
  const completedMatches: Match[] = [];
  const unplayedMatches: Match[] = [];

  matches.forEach((m) => {
    if (isCompletedMatch(m) && m.homeScore !== null && m.awayScore !== null) {
      completedMatches.push(m);
    } else {
      unplayedMatches.push(m);
    }
  });

  // State Hash for Caching & PRNG Seeding
  const completedStateStr = completedMatches
    .map((m) => `${m.id}:${m.homeScore}-${m.awayScore}`)
    .sort()
    .join('|');
  const cacheKey = `${completedStateStr}__iter:${iterations}__model:${config.modelType || 'dynamic'}__adv:${config.homeAdvantage ?? 0}__var:${config.variance ?? 0}`;

  if (simulationCache.has(cacheKey) && !onProgress) {
    const cached = simulationCache.get(cacheKey)!;
    return {
      ...cached,
      timeTakenMs: Math.round(performance.now() - startTime)
    };
  }

  // Edge case: If all matches are finished, return deterministic 100% / 0%
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

    const probabilitiesList = Object.values(probs).sort(
      (a, b) => b.playoffChance - a.playoffChance || b.upperBracketChance - a.upperBracketChance
    );

    const out: SimulationOutput = {
      probabilities: probs,
      probabilitiesList,
      iterations: 1,
      timeTakenMs: Math.round(performance.now() - startTime)
    };
    simulationCache.set(cacheKey, out);
    return out;
  }

  // Pre-calculate team strengths and match probability models
  const teamStrengths = calculateTeamStrengths(matches, currentStandings);
  const teamRatingsMap: Record<TeamId, number> = {} as any;
  TEAMS_LIST.forEach((t) => {
    teamRatingsMap[t.id] = teamStrengths[t.id]?.effectiveRating || t.rating || 1500;
  });

  // Map team IDs to integer indices 0..8 for fast array access
  const teamIdToIndex: Record<TeamId, number> = {} as any;
  const indexToTeamId: TeamId[] = [];
  TEAMS_LIST.forEach((team, idx) => {
    teamIdToIndex[team.id] = idx;
    indexToTeamId.push(team.id);
  });

  // Pre-calculate unplayed match probabilities
  const unplayedMatchConfigs = unplayedMatches.map((m) => {
    const homeIdx = teamIdToIndex[m.homeTeam];
    const awayIdx = teamIdToIndex[m.awayTeam];
    const probResult = calculateBO3MatchProbability(m.homeTeam, m.awayTeam, teamRatingsMap, config);
    return {
      homeIdx,
      awayIdx,
      probResult,
      c0: probResult.cumulativeProbabilities[0], // P(2-0)
      c1: probResult.cumulativeProbabilities[1], // P(2-0) + P(2-1)
      c2: probResult.cumulativeProbabilities[2]  // P(2-0) + P(2-1) + P(1-2)
    };
  });

  // Base state from completed matches (integer arrays)
  const baseMatchWins = new Int32Array(9);
  const baseMatchLosses = new Int32Array(9);
  const baseGamesWon = new Int32Array(9);
  const baseGamesLost = new Int32Array(9);
  const baseH2HWins = new Int32Array(81); // 9x9 matrix: h2h[a*9 + b]
  const baseH2HGames = new Int32Array(81);

  completedMatches.forEach((m) => {
    const hIdx = teamIdToIndex[m.homeTeam];
    const aIdx = teamIdToIndex[m.awayTeam];
    const hScore = m.homeScore!;
    const aScore = m.awayScore!;

    baseGamesWon[hIdx] += hScore;
    baseGamesLost[hIdx] += aScore;
    baseGamesWon[aIdx] += aScore;
    baseGamesLost[aIdx] += hScore;

    baseH2HGames[hIdx * 9 + aIdx] += hScore;
    baseH2HGames[aIdx * 9 + hIdx] += aScore;

    if (hScore > aScore) {
      baseMatchWins[hIdx]++;
      baseMatchLosses[aIdx]++;
      baseH2HWins[hIdx * 9 + aIdx]++;
    } else {
      baseMatchLosses[hIdx]++;
      baseMatchWins[aIdx]++;
      baseH2HWins[aIdx * 9 + hIdx]++;
    }
  });

  // Position frequency counters: positionCounts[teamIdx * 9 + (rank - 1)]
  const positionCounts = new Int32Array(81);

  // Initialize seeded PRNG
  const seed = hashStateString(completedStateStr || 'mpl_s18_initial') ^ iterations;
  const prng = createMulberry32PRNG(seed);

  // Simulation execution in chunks for non-blocking UI responsiveness
  const chunkSize = iterations > 50000 ? 10000 : 5000;
  let completedIterations = 0;

  // Working scratch arrays per iteration (allocated once for performance)
  const curMatchWins = new Int32Array(9);
  const curGameDiff = new Int32Array(9);
  const curGamesWon = new Int32Array(9);
  const curH2HWins = new Int32Array(81);
  const curH2HGames = new Int32Array(81);
  const rankedIndices = new Int32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);

  return new Promise<SimulationOutput>((resolve) => {
    function processChunk() {
      const targetInChunk = Math.min(chunkSize, iterations - completedIterations);

      for (let iter = 0; iter < targetInChunk; iter++) {
        // Reset working state to base completed matches
        for (let t = 0; t < 9; t++) {
          curMatchWins[t] = baseMatchWins[t];
          curGamesWon[t] = baseGamesWon[t];
          curGameDiff[t] = baseGamesWon[t] - baseGamesLost[t];
        }
        for (let k = 0; k < 81; k++) {
          curH2HWins[k] = baseH2HWins[k];
          curH2HGames[k] = baseH2HGames[k];
        }

        // Simulate each unplayed match using PRNG
        for (let j = 0; j < unplayedMatchConfigs.length; j++) {
          const cfg = unplayedMatchConfigs[j];
          const r = prng();
          let hScore = 0;
          let aScore = 0;

          if (r < cfg.c0) {
            // 2-0
            hScore = 2;
            aScore = 0;
          } else if (r < cfg.c1) {
            // 2-1
            hScore = 2;
            aScore = 1;
          } else if (r < cfg.c2) {
            // 1-2
            hScore = 1;
            aScore = 2;
          } else {
            // 0-2
            hScore = 0;
            aScore = 2;
          }

          const h = cfg.homeIdx;
          const a = cfg.awayIdx;

          curGamesWon[h] += hScore;
          curGamesWon[a] += aScore;
          curGameDiff[h] += hScore - aScore;
          curGameDiff[a] += aScore - hScore;

          curH2HGames[h * 9 + a] += hScore;
          curH2HGames[a * 9 + h] += aScore;

          if (hScore > aScore) {
            curMatchWins[h]++;
            curH2HWins[h * 9 + a]++;
          } else {
            curMatchWins[a]++;
            curH2HWins[a * 9 + h]++;
          }
        }

        // Reset rank indices
        for (let t = 0; t < 9; t++) rankedIndices[t] = t;

        // Sort 9 teams using official tiebreaker rules (fast insertion sort for 9 items)
        for (let i = 1; i < 9; i++) {
          const key = rankedIndices[i];
          let j = i - 1;

          while (j >= 0) {
            const other = rankedIndices[j];

            // 1. Match Wins (Desc)
            let cmp = curMatchWins[key] - curMatchWins[other];
            if (cmp === 0) {
              // 2. Game Difference (Desc)
              cmp = curGameDiff[key] - curGameDiff[other];
              if (cmp === 0) {
                // 3. Head-to-Head series wins
                const h2hWinDiff = curH2HWins[key * 9 + other] - curH2HWins[other * 9 + key];
                if (h2hWinDiff !== 0) {
                  cmp = h2hWinDiff;
                } else {
                  // H2H game difference
                  const h2hGameDiff = curH2HGames[key * 9 + other] - curH2HGames[other * 9 + key];
                  if (h2hGameDiff !== 0) {
                    cmp = h2hGameDiff;
                  } else {
                    // 4. Total Games Won (Desc)
                    cmp = curGamesWon[key] - curGamesWon[other];
                    if (cmp === 0) {
                      // 5. Tiebreaker fallback (consistent index)
                      cmp = other - key;
                    }
                  }
                }
              }
            }

            // If key is better than other (cmp > 0), key moves ahead of other
            if (cmp > 0) {
              rankedIndices[j + 1] = rankedIndices[j];
              j--;
            } else {
              break;
            }
          }
          rankedIndices[j + 1] = key;
        }

        // Record final positions (rank 1 to 9)
        for (let rank = 0; rank < 9; rank++) {
          const teamIdx = rankedIndices[rank];
          positionCounts[teamIdx * 9 + rank]++;
        }
      }

      completedIterations += targetInChunk;

      if (onProgress) {
        onProgress({
          current: completedIterations,
          total: iterations,
          percentage: Math.round((completedIterations / iterations) * 100),
          isRunning: completedIterations < iterations
        });
      }

      if (completedIterations < iterations) {
        // Yield to event loop
        setTimeout(processChunk, 0);
      } else {
        // Convert position counts into final RawPositionDistribution objects
        const rawDistributions: Record<TeamId, RawPositionDistribution> = {} as any;
        TEAMS_LIST.forEach((team, idx) => {
          const counts: number[] = [];
          for (let rank = 0; rank < 9; rank++) {
            counts.push(positionCounts[idx * 9 + rank]);
          }
          rawDistributions[team.id] = {
            teamId: team.id,
            counts,
            totalIterations: iterations
          };
        });

        // Compute mathematically consistent PlayoffProbabilities
        const probabilities = computePlayoffProbabilitiesFromDistribution(
          rawDistributions,
          qualifications
        );

        const probabilitiesList = Object.values(probabilities).sort(
          (a, b) => b.playoffChance - a.playoffChance || b.upperBracketChance - a.upperBracketChance
        );

        const timeTakenMs = Math.round(performance.now() - startTime);

        const output: SimulationOutput = {
          probabilities,
          probabilitiesList,
          iterations,
          timeTakenMs
        };

        simulationCache.set(cacheKey, output);

        if (onProgress) {
          onProgress({
            current: iterations,
            total: iterations,
            percentage: 100,
            isRunning: false,
            timeTakenMs
          });
        }

        resolve(output);
      }
    }

    processChunk();
  });
}

export function runMonteCarloSimulationAsync(
  matches: Match[],
  scenarioOverrides: Record<string, [number, number]>,
  config: SimulationConfig,
  onProgress?: (progress: SimulationProgress) => void,
  onComplete?: (
    results: PlayoffProbabilities[],
    stats?: { iterations: number; timeTakenMs: number }
  ) => void
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
      onComplete(output.probabilitiesList, {
        iterations: output.iterations,
        timeTakenMs: output.timeTakenMs
      });
    }
  });
}
