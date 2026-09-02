import { Match, TeamId, QualificationStatus, TeamStanding } from '../types';
import { TEAMS_LIST } from '../data/teams';
import { calculateStandings } from './standingsEngine';

export interface QualificationAnalysis {
  teamId: TeamId;
  currentPosition: number;
  currentMatchWins: number;
  currentMatchLosses: number;
  currentGameWins: number;
  currentGameLosses: number;
  currentGameDifference: number;
  remainingMatches: number;
  maxPossibleWins: number;
  minPossibleWins: number;
  bestPossibleRank: number;
  worstPossibleRank: number;
  clinchedPlayoff: boolean;
  clinchedUpperBracket: boolean;
  isEliminated: boolean;
  status: QualificationStatus;
  magicNumberPlayoff: number | null;
  magicNumberUpper: number | null;
  summaryText: string;
}

/**
 * Mathematical Qualification Engine
 * Strictly based on mathematical bounds and possibilities (NOT probability).
 * Evaluates whether a team is mathematically QUALIFIED, CLINCHED_UPPER, ALIVE, ON_THE_BUBBLE, MUST_WIN, or ELIMINATED.
 */
export function analyzeQualifications(matches: Match[]): Record<TeamId, QualificationAnalysis> {
  const currentStandings = calculateStandings(matches);
  const remainingMatches = matches.filter(
    (m) => m.homeScore === null || m.awayScore === null || (m.status !== 'completed' && m.homeScore === 0 && m.awayScore === 0)
  );

  const results: Record<TeamId, QualificationAnalysis> = {} as any;

  // Build mathematical potential bounds for all teams
  const potentialMap: Record<
    TeamId,
    {
      currentRank: number;
      standing: TeamStanding;
      minWins: number;
      maxWins: number;
      minGD: number;
      maxGD: number;
      remaining: number;
    }
  > = {} as any;

  currentStandings.forEach((st) => {
    const remaining = st.matchesRemaining;
    potentialMap[st.teamId] = {
      currentRank: st.rank,
      standing: st,
      minWins: st.matchWins,
      maxWins: st.matchWins + remaining,
      minGD: st.gameDifference - remaining * 2,
      maxGD: st.gameDifference + remaining * 2,
      remaining
    };
  });

  // Evaluate for each team
  TEAMS_LIST.forEach((team) => {
    const teamId = team.id;
    const myPot = potentialMap[teamId] || {
      currentRank: 9,
      standing: currentStandings.find((s) => s.teamId === teamId)!,
      minWins: 0,
      maxWins: 16,
      minGD: -32,
      maxGD: 32,
      remaining: 16
    };

    if (remainingMatches.length === 0) {
      // Season completely finished
      const currentRank = myPot.currentRank;
      const clinchedPlayoff = currentRank <= 6;
      const clinchedUpper = currentRank <= 2;
      const isElim = currentRank >= 7;

      results[teamId] = {
        teamId,
        currentPosition: currentRank,
        currentMatchWins: myPot.standing.matchWins,
        currentMatchLosses: myPot.standing.matchLosses,
        currentGameWins: myPot.standing.gamesWon,
        currentGameLosses: myPot.standing.gamesLost,
        currentGameDifference: myPot.standing.gameDifference,
        remainingMatches: 0,
        maxPossibleWins: myPot.standing.matchWins,
        minPossibleWins: myPot.standing.matchWins,
        bestPossibleRank: currentRank,
        worstPossibleRank: currentRank,
        clinchedPlayoff,
        clinchedUpperBracket: clinchedUpper,
        isEliminated: isElim,
        status: clinchedUpper ? 'CLINCHED_UPPER' : clinchedPlayoff ? 'QUALIFIED' : 'ELIMINATED',
        magicNumberPlayoff: clinchedPlayoff ? 0 : null,
        magicNumberUpper: clinchedUpper ? 0 : null,
        summaryText: clinchedUpper
          ? 'Mengunci Posisi Upper Bracket'
          : clinchedPlayoff
          ? 'Mengunci Tiket Playoff'
          : 'Tereliminasi dari Playoff'
      };
      return;
    }

    // Mathematical Best and Worst Rank Calculation:
    // Best Possible Rank: 1 + count of teams whose minimum guarantee exceeds my absolute maximum ceiling
    let guaranteedAheadCount = 0;
    // Worst Possible Rank: 1 + count of teams whose maximum ceiling can exceed or tie my minimum floor
    let potentialAheadCount = 0;

    TEAMS_LIST.forEach((otherTeam) => {
      if (otherTeam.id === teamId) return;
      const otherPot = potentialMap[otherTeam.id];
      if (!otherPot) return;

      // If other team's minimum wins strictly exceed my maximum wins, they CANNOT finish behind me
      if (
        otherPot.minWins > myPot.maxWins ||
        (otherPot.minWins === myPot.maxWins && otherPot.minGD > myPot.maxGD)
      ) {
        guaranteedAheadCount++;
      }

      // If other team's maximum wins can meet or exceed my minimum wins, they COULD finish ahead of me
      if (
        otherPot.maxWins > myPot.minWins ||
        (otherPot.maxWins === myPot.minWins && otherPot.maxGD >= myPot.minGD)
      ) {
        potentialAheadCount++;
      }
    });

    const bestPossibleRank = Math.max(1, guaranteedAheadCount + 1);
    const worstPossibleRank = Math.min(9, potentialAheadCount + 1);

    // Mathematical definition of Clinched and Eliminated:
    const isEliminated = bestPossibleRank >= 7; // Even in best case, cannot reach Top 6
    const clinchedPlayoff = worstPossibleRank <= 6; // Even in worst case, cannot fall to #7
    const clinchedUpperBracket = worstPossibleRank <= 2; // Even in worst case, cannot fall to #3

    // Magic number calculation for Playoff (Top 6)
    // Magic number = (Total Matches + 1) - (My Wins + 7th place team's losses)
    const sortedByMaxWins = [...TEAMS_LIST]
      .filter((t) => t.id !== teamId)
      .map((t) => potentialMap[t.id])
      .sort((a, b) => b.maxWins - a.maxWins);

    // 6th rival max wins (the threshold for 7th place cutoff)
    const seventhRivalMaxWins = sortedByMaxWins[5]?.maxWins ?? 0;
    const winsNeededToPassSeventh = Math.max(0, seventhRivalMaxWins + 1 - myPot.standing.matchWins);

    let magicNumberPlayoff: number | null = null;
    if (clinchedPlayoff) {
      magicNumberPlayoff = 0;
    } else if (!isEliminated) {
      magicNumberPlayoff = Math.min(myPot.remaining, Math.max(1, winsNeededToPassSeventh));
    }

    // Magic number for Upper Bracket (Top 2)
    const secondRivalMaxWins = sortedByMaxWins[1]?.maxWins ?? 0;
    const winsNeededForUpper = Math.max(0, secondRivalMaxWins + 1 - myPot.standing.matchWins);
    let magicNumberUpper: number | null = null;
    if (clinchedUpperBracket) {
      magicNumberUpper = 0;
    } else if (bestPossibleRank <= 2) {
      magicNumberUpper = Math.min(myPot.remaining, Math.max(1, winsNeededForUpper));
    }

    // Qualification Status Classification
    let status: QualificationStatus = 'ALIVE';
    if (clinchedUpperBracket) {
      status = 'CLINCHED_UPPER';
    } else if (clinchedPlayoff) {
      status = 'QUALIFIED';
    } else if (isEliminated) {
      status = 'ELIMINATED';
    } else if (
      bestPossibleRank === 6 ||
      (myPot.currentRank >= 7 && myPot.remaining <= 3 && myPot.maxWins <= 8)
    ) {
      status = 'MUST_WIN';
    } else if (myPot.currentRank >= 5 && myPot.currentRank <= 7) {
      status = 'ON_THE_BUBBLE';
    }

    // Contextual Summary
    let summaryText = '';
    if (clinchedUpperBracket) {
      summaryText = 'Sudah Pasti Lolos Upper Bracket (Top 2)';
    } else if (clinchedPlayoff) {
      summaryText = 'Sudah Pasti Lolos Playoff (Top 6)';
    } else if (isEliminated) {
      summaryText = 'Telah Tereliminasi dari Playoff';
    } else if (status === 'MUST_WIN') {
      summaryText = 'Zona Kritis: Wajib Menang di Laga Sisa';
    } else if (status === 'ON_THE_BUBBLE') {
      summaryText = 'Persaingan Ketat Zona Playoff (#5–#7)';
    } else {
      summaryText = `Peluang Terbuka (Potensi Rank #${bestPossibleRank} s/d #${worstPossibleRank})`;
    }

    results[teamId] = {
      teamId,
      currentPosition: myPot.currentRank,
      currentMatchWins: myPot.standing.matchWins,
      currentMatchLosses: myPot.standing.matchLosses,
      currentGameWins: myPot.standing.gamesWon,
      currentGameLosses: myPot.standing.gamesLost,
      currentGameDifference: myPot.standing.gameDifference,
      remainingMatches: myPot.remaining,
      maxPossibleWins: myPot.maxWins,
      minPossibleWins: myPot.minWins,
      bestPossibleRank,
      worstPossibleRank,
      clinchedPlayoff,
      clinchedUpperBracket,
      isEliminated,
      status,
      magicNumberPlayoff,
      magicNumberUpper,
      summaryText
    };
  });

  return results;
}
