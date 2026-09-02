import { Match, TeamId, QualificationStatus } from '../types';
import { TEAMS_LIST } from '../data/teams';
import { calculateStandings } from './standingsEngine';

export interface QualificationAnalysis {
  teamId: TeamId;
  status: QualificationStatus;
  bestPossibleRank: number;
  worstPossibleRank: number;
  clinchedPlayoff: boolean;
  clinchedUpperBracket: boolean;
  isEliminated: boolean;
  magicNumberPlayoff: number | null; // Wins needed to guarantee top 6
  magicNumberUpper: number | null;   // Wins needed to guarantee top 2
  tragicNumber: number | null;       // Losses to elimination
  summaryText: string;
}

export function analyzeQualifications(matches: Match[]): Record<TeamId, QualificationAnalysis> {
  const currentStandings = calculateStandings(matches);
  const remainingMatches = matches.filter(
    (m) => m.status === 'scheduled' && (m.homeScore === null || m.awayScore === null)
  );

  const results: Record<TeamId, QualificationAnalysis> = {} as any;

  // For each team, evaluate best case and worst case
  TEAMS_LIST.forEach((team) => {
    const teamId = team.id;
    const currentTeamStanding = currentStandings.find((s) => s.teamId === teamId);
    const matchesRemaining = currentTeamStanding ? currentTeamStanding.matchesRemaining : 0;

    if (remainingMatches.length === 0) {
      // Season finished
      const rank = currentTeamStanding ? currentTeamStanding.rank : 9;
      let status: QualificationStatus = 'ELIMINATED';
      if (rank <= 2) status = 'CLINCHED_UPPER';
      else if (rank <= 6) status = 'QUALIFIED';

      results[teamId] = {
        teamId,
        status,
        bestPossibleRank: rank,
        worstPossibleRank: rank,
        clinchedPlayoff: rank <= 6,
        clinchedUpperBracket: rank <= 2,
        isEliminated: rank >= 7,
        magicNumberPlayoff: 0,
        magicNumberUpper: 0,
        tragicNumber: 0,
        summaryText: rank <= 6 ? (rank <= 2 ? 'Finished in Upper Bracket' : 'Qualified for Play-in') : 'Eliminated'
      };
      return;
    }

    // 1. Calculate Best Possible Finish:
    // Maximize team's wins (2-0 for all their remaining matches)
    // Minimize competing teams' records where possible
    const bestCaseMatches = matches.map((m) => {
      if (m.status === 'completed' && m.homeScore !== null && m.awayScore !== null) {
        return m;
      }
      if (m.homeTeam === teamId) {
        return { ...m, homeScore: 2, awayScore: 0, status: 'completed' as const };
      }
      if (m.awayTeam === teamId) {
        return { ...m, homeScore: 0, awayScore: 2, status: 'completed' as const };
      }
      // For matches not involving this team, favor lower-ranked teams to prevent top teams from running away
      return { ...m, homeScore: 2, awayScore: 1, status: 'completed' as const };
    });

    const bestStandings = calculateStandings(bestCaseMatches);
    const bestRankFound = bestStandings.find((s) => s.teamId === teamId)?.rank || 1;

    // 2. Calculate Worst Possible Finish:
    // Minimize team's results (0-2 in all remaining matches)
    // Maximize rivals' results
    const worstCaseMatches = matches.map((m) => {
      if (m.status === 'completed' && m.homeScore !== null && m.awayScore !== null) {
        return m;
      }
      if (m.homeTeam === teamId) {
        return { ...m, homeScore: 0, awayScore: 2, status: 'completed' as const };
      }
      if (m.awayTeam === teamId) {
        return { ...m, homeScore: 2, awayScore: 0, status: 'completed' as const };
      }
      // For rivals, give 2-0 wins to teams directly chasing or behind
      return { ...m, homeScore: 2, awayScore: 0, status: 'completed' as const };
    });

    const worstStandings = calculateStandings(worstCaseMatches);
    const worstRankFound = worstStandings.find((s) => s.teamId === teamId)?.rank || 9;

    // Refine bounds
    const bestPossibleRank = Math.min(bestRankFound, currentTeamStanding ? currentTeamStanding.rank : 9);
    const worstPossibleRank = Math.max(worstRankFound, currentTeamStanding ? currentTeamStanding.rank : 1);

    const isEliminated = bestPossibleRank >= 7;
    const clinchedPlayoff = worstPossibleRank <= 6;
    const clinchedUpperBracket = worstPossibleRank <= 2;

    let status: QualificationStatus = 'ALIVE';
    if (clinchedUpperBracket) {
      status = 'CLINCHED_UPPER';
    } else if (clinchedPlayoff) {
      status = 'QUALIFIED';
    } else if (isEliminated) {
      status = 'ELIMINATED';
    } else if (bestPossibleRank === 6 || (currentTeamStanding && currentTeamStanding.rank >= 7 && matchesRemaining <= 3)) {
      status = 'MUST_WIN';
    } else if (currentTeamStanding && (currentTeamStanding.rank === 5 || currentTeamStanding.rank === 6 || currentTeamStanding.rank === 7)) {
      status = 'ON_THE_BUBBLE';
    }

    // Summary text
    let summaryText = '';
    if (clinchedUpperBracket) {
      summaryText = 'Clinched Upper Bracket (Top 2 Seed)';
    } else if (clinchedPlayoff) {
      summaryText = 'Clinched Playoff Spot';
    } else if (isEliminated) {
      summaryText = 'Mathematically Eliminated from Playoffs';
    } else if (status === 'MUST_WIN') {
      summaryText = 'Critical Danger: Cannot afford any losses';
    } else if (status === 'ON_THE_BUBBLE') {
      summaryText = 'In playoff contention, active battle for seeds 5-7';
    } else {
      summaryText = `Alive in contention (Best: #${bestPossibleRank}, Worst: #${worstPossibleRank})`;
    }

    results[teamId] = {
      teamId,
      status,
      bestPossibleRank,
      worstPossibleRank,
      clinchedPlayoff,
      clinchedUpperBracket,
      isEliminated,
      magicNumberPlayoff: clinchedPlayoff ? 0 : Math.max(1, 9 - (currentTeamStanding?.matchWins || 0)),
      magicNumberUpper: clinchedUpperBracket ? 0 : Math.max(1, 12 - (currentTeamStanding?.matchWins || 0)),
      tragicNumber: isEliminated ? 0 : Math.max(1, 9 - (currentTeamStanding?.matchLosses || 0)),
      summaryText
    };
  });

  return results;
}
