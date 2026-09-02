import { Match, TeamId, H2HRecord } from '../types';

export interface H2HMatrix {
  getRecord: (teamA: TeamId, teamB: TeamId) => H2HRecord;
  compareTeams: (teamA: TeamId, teamB: TeamId) => number; // >0 if A beats B in H2H, <0 if B beats A, 0 if tied
  getMiniStandings: (tiedTeamIds: TeamId[]) => Record<TeamId, { matchWins: number; gameDiff: number; gamesWon: number }>;
}

export function buildH2HMatrix(matches: Match[]): H2HMatrix {
  const records = new Map<string, H2HRecord>();

  const getPairKey = (t1: TeamId, t2: TeamId) => {
    return [t1, t2].sort().join('_vs_');
  };

  const getOrCreateRecord = (teamA: TeamId, teamB: TeamId): H2HRecord => {
    const key = getPairKey(teamA, teamB);
    if (!records.has(key)) {
      records.set(key, {
        teamA: teamA < teamB ? teamA : teamB,
        teamB: teamA < teamB ? teamB : teamA,
        matchesPlayed: 0,
        teamAWins: 0,
        teamBWins: 0,
        teamAGames: 0,
        teamBGames: 0
      });
    }
    return records.get(key)!;
  };

  // Populate from completed matches
  matches.forEach((m) => {
    if (m.homeScore !== null && m.awayScore !== null && (m.status === 'completed' || m.homeScore > 0 || m.awayScore > 0)) {
      const rec = getOrCreateRecord(m.homeTeam, m.awayTeam);
      const isHomeTeamA = rec.teamA === m.homeTeam;

      rec.matchesPlayed += 1;
      if (m.homeScore > m.awayScore) {
        if (isHomeTeamA) {
          rec.teamAWins += 1;
        } else {
          rec.teamBWins += 1;
        }
      } else if (m.awayScore > m.homeScore) {
        if (isHomeTeamA) {
          rec.teamBWins += 1;
        } else {
          rec.teamAWins += 1;
        }
      }

      if (isHomeTeamA) {
        rec.teamAGames += m.homeScore;
        rec.teamBGames += m.awayScore;
      } else {
        rec.teamAGames += m.awayScore;
        rec.teamBGames += m.homeScore;
      }
    }
  });

  return {
    getRecord: (teamA: TeamId, teamB: TeamId): H2HRecord => {
      const rec = getOrCreateRecord(teamA, teamB);
      if (rec.teamA === teamA) {
        return { ...rec };
      }
      return {
        teamA: teamB,
        teamB: teamA,
        matchesPlayed: rec.matchesPlayed,
        teamAWins: rec.teamBWins,
        teamBWins: rec.teamAWins,
        teamAGames: rec.teamBGames,
        teamBGames: rec.teamAGames
      };
    },

    compareTeams: (teamA: TeamId, teamB: TeamId): number => {
      const rec = getOrCreateRecord(teamA, teamB);
      const isTeamAFirst = rec.teamA === teamA;
      const winsA = isTeamAFirst ? rec.teamAWins : rec.teamBWins;
      const winsB = isTeamAFirst ? rec.teamBWins : rec.teamAWins;

      if (winsA !== winsB) {
        return winsA - winsB; // Positive if A won more series
      }

      // If series tied (e.g. 1-1), check game difference
      const gamesA = isTeamAFirst ? rec.teamAGames : rec.teamBGames;
      const gamesB = isTeamAFirst ? rec.teamBGames : rec.teamAGames;
      const gameDiffA = gamesA - gamesB;

      if (gameDiffA !== 0) {
        return gameDiffA;
      }

      return gamesA - gamesB;
    },

    getMiniStandings: (tiedTeamIds: TeamId[]) => {
      const mini: Record<TeamId, { matchWins: number; gameDiff: number; gamesWon: number }> = {} as any;
      tiedTeamIds.forEach((id) => {
        mini[id] = { matchWins: 0, gameDiff: 0, gamesWon: 0 };
      });

      // Filter matches only between tied teams
      matches.forEach((m) => {
        if (
          m.homeScore !== null &&
          m.awayScore !== null &&
          tiedTeamIds.includes(m.homeTeam) &&
          tiedTeamIds.includes(m.awayTeam)
        ) {
          if (m.homeScore > m.awayScore) {
            mini[m.homeTeam].matchWins += 1;
          } else if (m.awayScore > m.homeScore) {
            mini[m.awayTeam].matchWins += 1;
          }
          mini[m.homeTeam].gameDiff += m.homeScore - m.awayScore;
          mini[m.awayTeam].gameDiff += m.awayScore - m.homeScore;
          mini[m.homeTeam].gamesWon += m.homeScore;
          mini[m.awayTeam].gamesWon += m.awayScore;
        }
      });

      return mini;
    }
  };
}
