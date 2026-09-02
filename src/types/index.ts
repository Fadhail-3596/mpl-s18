export type TeamId = 'ae' | 'btr' | 'dewa' | 'evos' | 'geek' | 'navi' | 'onic' | 'rrq' | 'tlid';

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  rating?: number; // Base strength rating (e.g. 1500)
}

export type MatchStatus = 'scheduled' | 'completed';

export interface Match {
  id: string;
  season: string;
  week: number;
  date: string;
  time: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  bestOf: 3;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export type ValidScore = [2, 0] | [2, 1] | [1, 2] | [0, 2];

export interface TeamStanding {
  rank: number;
  teamId: TeamId;
  team: Team;
  matchesPlayed: number;
  matchesRemaining: number;
  matchWins: number;
  matchLosses: number;
  matchWinRate: number; // 0 to 1
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
  gameWinRate: number; // 0 to 1
  headToHeadRecords: Record<string, { wins: number; losses: number; gamesWon: number; gamesLost: number }>;
  form: ('W' | 'L')[];
  streak: { type: 'W' | 'L'; count: number };
  qualificationStatus: QualificationStatus;
  bestPossibleRank: number;
  worstPossibleRank: number;
}

export type QualificationStatus = 
  | 'QUALIFIED'       // Clinched Playoff (Top 6 guaranteed)
  | 'CLINCHED_UPPER'  // Clinched Top 2 (Upper Bracket)
  | 'ALIVE'           // Still fighting, viable
  | 'ON_THE_BUBBLE'   // In danger (around 5-7 border)
  | 'MUST_WIN'        // On the brink of elimination
  | 'ELIMINATED';     // Mathematically cannot reach top 6

export interface H2HRecord {
  teamA: TeamId;
  teamB: TeamId;
  matchesPlayed: number;
  teamAWins: number;
  teamBWins: number;
  teamAGames: number;
  teamBGames: number;
}

export interface PlayoffProbabilities {
  teamId: TeamId;
  team: Team;
  positionProbabilities: number[]; // Index 0 to 8 corresponding to Rank 1 to 9 (sum approx 100%)
  playoffChance: number;          // Ranks 1-6 sum
  upperBracketChance: number;     // Ranks 1-2 sum
  playInChance: number;           // Ranks 3-6 sum
  eliminationChance: number;      // Ranks 7-9 sum
}

export interface SimulationConfig {
  iterations: number; // 10000, 50000, 100000, 500000
  modelType: 'dynamic_strength' | 'equal_50_50' | 'recent_form_weighted';
  homeAdvantage: number; // usually 0 in studio LAN
  variance: number;
}

export interface SimulationProgress {
  current: number;
  total: number;
  percentage: number;
  isRunning: boolean;
  timeTakenMs?: number;
}

export interface WhatIfScenarioMatch {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface UserScenario {
  id: string;
  name: string;
  updatedAt: string;
  overrides: Record<string, [number, number]>; // matchId -> [homeScore, awayScore]
}

export interface BackupData {
  version: string;
  exportedAt: string;
  results: Record<string, { homeScore: number; awayScore: number }>;
  scenarios: UserScenario[];
  activeScenarioId?: string | null;
  settings: {
    simIterations: number;
    modelType: string;
  };
}

export interface MatchImpactAnalysis {
  match: Match;
  homeWinPlayoffDelta: number; // impact on team playoff %
  awayWinPlayoffDelta: number;
  urgencyScore: number; // 0 to 100
}
