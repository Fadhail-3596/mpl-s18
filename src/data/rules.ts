export interface CompetitionRules {
  seasonName: string;
  totalTeams: number;
  playoffCutoff: number; // 6
  upperBracketCutoff: number; // 2
  playInCutoff: number; // 6
  eliminatedFrom: number; // 7
  regularSeasonMatchesPerTeam: number; // 16
  seriesFormat: 'BO3';
  tiebreakerHierarchy: TiebreakerCriterion[];
}

export type TiebreakerCriterion = 
  | 'MATCH_WINS'
  | 'GAME_DIFF'
  | 'HEAD_TO_HEAD_SERIES'
  | 'HEAD_TO_HEAD_GAME_DIFF'
  | 'TOTAL_GAMES_WON';

export const TOTAL_TEAMS = 9;
export const PLAYOFF_SPOTS = 6;
export const UPPER_BRACKET_SPOTS = 2;
export const PLAY_IN_SPOTS = 4; // Seeds 3 to 6
export const ELIMINATED_SPOTS = 3; // Seeds 7 to 9
export const TOTAL_MATCHES = 72;
export const MATCHES_PER_TEAM = 16;
export const DEFAULT_SIMULATION_ITERATIONS = 50000;
export const SIMULATION_ITERATION_OPTIONS = [10000, 50000, 100000, 500000] as const;

export const MPL_ID_S18_RULES: CompetitionRules = {
  seasonName: 'MPL Indonesia Season 18',
  totalTeams: TOTAL_TEAMS,
  playoffCutoff: PLAYOFF_SPOTS,
  upperBracketCutoff: UPPER_BRACKET_SPOTS,
  playInCutoff: PLAYOFF_SPOTS,
  eliminatedFrom: PLAYOFF_SPOTS + 1,
  regularSeasonMatchesPerTeam: MATCHES_PER_TEAM,
  seriesFormat: 'BO3',
  tiebreakerHierarchy: [
    'MATCH_WINS',
    'GAME_DIFF',
    'HEAD_TO_HEAD_SERIES',
    'HEAD_TO_HEAD_GAME_DIFF',
    'TOTAL_GAMES_WON'
  ]
};

export const PLAYOFF_ZONES = {
  UPPER_BRACKET: { min: 1, max: 2, label: 'Upper Bracket', color: 'emerald', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  PLAY_IN: { min: 3, max: 6, label: 'Play-in (Lower Playoff)', color: 'blue', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  ELIMINATED: { min: 7, max: 9, label: 'Eliminated', color: 'rose', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

export function getZoneByRank(rank: number): {
  type: 'UPPER' | 'PLAY_IN' | 'ELIMINATED';
  label: string;
  color: string;
  badgeClass: string;
  borderClass: string;
} {
  if (rank <= 2) {
    return {
      type: 'UPPER',
      label: 'Upper Bracket (Seed 1-2)',
      color: '#10b981',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      borderClass: 'border-l-4 border-l-emerald-500'
    };
  }
  if (rank <= 6) {
    return {
      type: 'PLAY_IN',
      label: 'Play-in (Seed 3-6)',
      color: '#3b82f6',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      borderClass: 'border-l-4 border-l-blue-500'
    };
  }
  return {
    type: 'ELIMINATED',
    label: 'Eliminated (Seed 7-9)',
    color: '#ef4444',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderClass: 'border-l-4 border-l-rose-500/60'
  };
}
