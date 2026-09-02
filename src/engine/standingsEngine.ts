import { Match, TeamId, TeamStanding, QualificationStatus } from '../types';
import { TEAMS_LIST, getTeam } from '../data/teams';
import { buildH2HMatrix } from './h2hEngine';
import { compareTeamsForOfficialRanking } from './rankingEngine';
import { MPL_ID_S18_RULES } from '../data/rules';

export function calculateStandings(
  matches: Match[],
  qualificationOverrides?: Record<
    TeamId,
    { status: QualificationStatus; bestPossibleRank?: number; worstPossibleRank?: number; best?: number; worst?: number }
  >
): TeamStanding[] {
  const h2hMatrix = buildH2HMatrix(matches);

  // Initialize stats map for each team
  const statsMap: Record<
    TeamId,
    {
      teamId: TeamId;
      matchesPlayed: number;
      matchWins: number;
      matchLosses: number;
      gamesWon: number;
      gamesLost: number;
      form: ('W' | 'L')[];
      headToHeadRecords: Record<string, { wins: number; losses: number; gamesWon: number; gamesLost: number }>;
    }
  > = {} as any;

  TEAMS_LIST.forEach((team) => {
    statsMap[team.id] = {
      teamId: team.id,
      matchesPlayed: 0,
      matchWins: 0,
      matchLosses: 0,
      gamesWon: 0,
      gamesLost: 0,
      form: [],
      headToHeadRecords: {}
    };
  });

  // Sort matches chronologically for form & streak calculations
  const sortedMatches = [...matches].sort((a, b) => {
    const dA = `${a.date} ${a.time}`;
    const dB = `${b.date} ${b.time}`;
    return dA.localeCompare(dB);
  });

  sortedMatches.forEach((m) => {
    if (m.homeScore !== null && m.awayScore !== null && (m.status === 'completed' || m.homeScore > 0 || m.awayScore > 0)) {
      const homeStats = statsMap[m.homeTeam];
      const awayStats = statsMap[m.awayTeam];

      if (!homeStats || !awayStats) return;

      homeStats.matchesPlayed += 1;
      awayStats.matchesPlayed += 1;

      homeStats.gamesWon += m.homeScore;
      homeStats.gamesLost += m.awayScore;
      awayStats.gamesWon += m.awayScore;
      awayStats.gamesLost += m.homeScore;

      const homeWon = m.homeScore > m.awayScore;
      if (homeWon) {
        homeStats.matchWins += 1;
        awayStats.matchLosses += 1;
        homeStats.form.push('W');
        awayStats.form.push('L');
      } else {
        homeStats.matchLosses += 1;
        awayStats.matchWins += 1;
        homeStats.form.push('L');
        awayStats.form.push('W');
      }
    }
  });

  // Calculate H2H summaries for each team against all other teams
  TEAMS_LIST.forEach((teamA) => {
    TEAMS_LIST.forEach((teamB) => {
      if (teamA.id !== teamB.id) {
        const rec = h2hMatrix.getRecord(teamA.id, teamB.id);
        statsMap[teamA.id].headToHeadRecords[teamB.id] = {
          wins: rec.teamAWins,
          losses: rec.teamBWins,
          gamesWon: rec.teamAGames,
          gamesLost: rec.teamBGames
        };
      }
    });
  });

  // Convert to intermediate list
  const standingsList: TeamStanding[] = Object.values(statsMap).map((st) => {
    const gameDiff = st.gamesWon - st.gamesLost;
    const matchWinRate = st.matchesPlayed > 0 ? st.matchWins / st.matchesPlayed : 0;
    const totalGames = st.gamesWon + st.gamesLost;
    const gameWinRate = totalGames > 0 ? st.gamesWon / totalGames : 0;

    // Calculate streak
    let streakCount = 0;
    let streakType: 'W' | 'L' = 'W';
    if (st.form.length > 0) {
      streakType = st.form[st.form.length - 1];
      for (let i = st.form.length - 1; i >= 0; i--) {
        if (st.form[i] === streakType) {
          streakCount++;
        } else {
          break;
        }
      }
    }

    const team = getTeam(st.teamId);

    return {
      teamId: st.teamId,
      team,
      matchesPlayed: st.matchesPlayed,
      matchesRemaining: MPL_ID_S18_RULES.regularSeasonMatchesPerTeam - st.matchesPlayed,
      matchWins: st.matchWins,
      matchLosses: st.matchLosses,
      matchWinRate,
      gamesWon: st.gamesWon,
      gamesLost: st.gamesLost,
      gameDifference: gameDiff,
      gameWinRate,
      headToHeadRecords: st.headToHeadRecords,
      form: st.form.slice(-5), // Last 5 matches
      streak: { type: streakType, count: streakCount },
      rank: 1, // Will be set after sort
      qualificationStatus: (qualificationOverrides?.[st.teamId]?.status || 'ALIVE') as QualificationStatus,
      bestPossibleRank: qualificationOverrides?.[st.teamId]?.bestPossibleRank || qualificationOverrides?.[st.teamId]?.best || 1,
      worstPossibleRank: qualificationOverrides?.[st.teamId]?.worstPossibleRank || qualificationOverrides?.[st.teamId]?.worst || 9
    };
  });

  // Sort standings with official ranking tiebreaker hierarchy
  standingsList.sort((a, b) =>
    compareTeamsForOfficialRanking(
      {
        teamId: a.teamId,
        teamName: a.team.name,
        matchWins: a.matchWins,
        matchLosses: a.matchLosses,
        gamesWon: a.gamesWon,
        gamesLost: a.gamesLost,
        gameDifference: a.gameDifference
      },
      {
        teamId: b.teamId,
        teamName: b.team.name,
        matchWins: b.matchWins,
        matchLosses: b.matchLosses,
        gamesWon: b.gamesWon,
        gamesLost: b.gamesLost,
        gameDifference: b.gameDifference
      },
      h2hMatrix
    )
  );

  // Assign 1-indexed ranks
  standingsList.forEach((item, index) => {
    item.rank = index + 1;
  });

  return standingsList;
}
