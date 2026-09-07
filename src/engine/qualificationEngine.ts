import { Match, TeamId, QualificationStatus, TeamStanding } from '../types';
import { TEAMS_LIST } from '../data/teams';
import { calculateStandings } from './standingsEngine';
import { isCompletedMatch } from './scoreValidator';

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
  minWinsToStayAlive: number;
  bestPossibleRank: number;
  worstPossibleRank: number;
  clinchedPlayoff: boolean;
  clinchedUpperBracket: boolean;
  isEliminated: boolean;
  status: QualificationStatus;
  winsNeededToGuaranteePlayoff: number | null;
  winsNeededToGuaranteeUpper: number | null;
  magicNumberPlayoff: number | null; // Alias for backwards-compatibility
  magicNumberUpper: number | null;   // Alias for backwards-compatibility
  summaryText: string;
}

/**
 * Generates all combinations of size k from an array
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const head = arr[0];
  const tail = arr.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

/**
 * Calculates the exact minimum wins from remaining matches required to mathematically GUARANTEE Top 6 (Playoff).
 * Returns number of wins (0..remaining), or null if even winning all remaining matches cannot guarantee Top 6 alone
 * (i.e. "Belum dapat dikunci" / "Tidak dapat dijamin hanya berdasarkan jumlah kemenangan").
 */
function calculateWinsToGuaranteePlayoff(
  teamId: TeamId,
  currentStandings: TeamStanding[],
  remainingMatches: Match[]
): number | null {
  const myStanding = currentStandings.find((s) => s.teamId === teamId);
  if (!myStanding) return null;

  const myRemainingMatches = remainingMatches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );
  const rT = myRemainingMatches.length;
  const currentWinsT = myStanding.matchWins;

  const otherTeams = TEAMS_LIST.filter((t) => t.id !== teamId).map((t) => {
    const st = currentStandings.find((s) => s.teamId === t.id);
    const rem = remainingMatches.filter((m) => m.homeTeam === t.id || m.awayTeam === t.id).length;
    return {
      teamId: t.id,
      currentWins: st?.matchWins || 0,
      remaining: rem
    };
  });

  // Pre-generate all 28 combinations of 6 teams from the 8 other teams
  const sixTeamCombos = getCombinations(otherTeams, 6);

  // Test w = 0..rT to find the minimum wins needed to guarantee Top 6
  for (let w = 0; w <= rT; w++) {
    const targetWins = currentWinsT + w;
    const lossesOfT = rT - w;

    // Check if there is ANY combination of 6 teams where all 6 could reach >= targetWins
    let canSixTeamsPass = false;

    for (const combo of sixTeamCombos) {
      const comboIds = new Set(combo.map((c) => c.teamId));

      // 1. Can each individual team in the combo reach targetWins?
      let individualPossible = true;
      let totalNeededWins = 0;

      for (const member of combo) {
        const needed = Math.max(0, targetWins - member.currentWins);
        if (needed > member.remaining) {
          individualPossible = false;
          break;
        }
        totalNeededWins += needed;
      }

      if (!individualPossible) {
        continue;
      }

      // 2. Can the combo collectively get enough wins from remaining matches?
      let matchesBetweenCombo = 0;
      let matchesComboVsOutsiders = 0;
      let matchesComboVsT = 0;

      for (const m of remainingMatches) {
        const homeInCombo = comboIds.has(m.homeTeam);
        const awayInCombo = comboIds.has(m.awayTeam);

        if (homeInCombo && awayInCombo) {
          matchesBetweenCombo++;
        } else if (homeInCombo || awayInCombo) {
          if (m.homeTeam === teamId || m.awayTeam === teamId) {
            matchesComboVsT++;
          } else {
            matchesComboVsOutsiders++;
          }
        }
      }

      // Max wins teams in combo can get from T is bounded by T's losses
      const winsFromT = Math.min(matchesComboVsT, lossesOfT);
      const maxAvailableWins = matchesBetweenCombo + matchesComboVsOutsiders + winsFromT;

      if (totalNeededWins <= maxAvailableWins) {
        canSixTeamsPass = true;
        break;
      }
    }

    // If NO combination of 6 teams can reach targetWins, then Top 6 is mathematically guaranteed!
    if (!canSixTeamsPass) {
      return w;
    }
  }

  // Even winning all remaining matches cannot guarantee Top 6 solely by win count
  return null;
}

/**
 * Calculates the exact minimum wins from remaining matches required to mathematically GUARANTEE Top 2 (Upper Bracket).
 */
function calculateWinsToGuaranteeUpper(
  teamId: TeamId,
  currentStandings: TeamStanding[],
  remainingMatches: Match[]
): number | null {
  const myStanding = currentStandings.find((s) => s.teamId === teamId);
  if (!myStanding) return null;

  const myRemainingMatches = remainingMatches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );
  const rT = myRemainingMatches.length;
  const currentWinsT = myStanding.matchWins;

  const otherTeams = TEAMS_LIST.filter((t) => t.id !== teamId).map((t) => {
    const st = currentStandings.find((s) => s.teamId === t.id);
    const rem = remainingMatches.filter((m) => m.homeTeam === t.id || m.awayTeam === t.id).length;
    return {
      teamId: t.id,
      currentWins: st?.matchWins || 0,
      remaining: rem
    };
  });

  // Pre-generate all 28 pairs of 2 teams from the 8 other teams
  const twoTeamCombos = getCombinations(otherTeams, 2);

  for (let w = 0; w <= rT; w++) {
    const targetWins = currentWinsT + w;
    const lossesOfT = rT - w;

    let canTwoTeamsPass = false;

    for (const combo of twoTeamCombos) {
      const comboIds = new Set(combo.map((c) => c.teamId));

      let individualPossible = true;
      let totalNeededWins = 0;

      for (const member of combo) {
        const needed = Math.max(0, targetWins - member.currentWins);
        if (needed > member.remaining) {
          individualPossible = false;
          break;
        }
        totalNeededWins += needed;
      }

      if (!individualPossible) continue;

      let matchesBetweenCombo = 0;
      let matchesComboVsOutsiders = 0;
      let matchesComboVsT = 0;

      for (const m of remainingMatches) {
        const homeInCombo = comboIds.has(m.homeTeam);
        const awayInCombo = comboIds.has(m.awayTeam);

        if (homeInCombo && awayInCombo) {
          matchesBetweenCombo++;
        } else if (homeInCombo || awayInCombo) {
          if (m.homeTeam === teamId || m.awayTeam === teamId) {
            matchesComboVsT++;
          } else {
            matchesComboVsOutsiders++;
          }
        }
      }

      const winsFromT = Math.min(matchesComboVsT, lossesOfT);
      const maxAvailableWins = matchesBetweenCombo + matchesComboVsOutsiders + winsFromT;

      if (totalNeededWins <= maxAvailableWins) {
        canTwoTeamsPass = true;
        break;
      }
    }

    if (!canTwoTeamsPass) {
      return w;
    }
  }

  return null;
}

/**
 * Mathematical Qualification Engine
 * Strictly based on mathematical bounds and possibilities (NOT probability).
 * Evaluates whether a team is mathematically QUALIFIED, CLINCHED_UPPER, ALIVE, ON_THE_BUBBLE, MUST_WIN, or ELIMINATED.
 */
export function analyzeQualifications(matches: Match[]): Record<TeamId, QualificationAnalysis> {
  const currentStandings = calculateStandings(matches);
  const remainingMatches = matches.filter((m) => !isCompletedMatch(m));

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
        minWinsToStayAlive: 0,
        bestPossibleRank: currentRank,
        worstPossibleRank: currentRank,
        clinchedPlayoff,
        clinchedUpperBracket: clinchedUpper,
        isEliminated: isElim,
        status: clinchedUpper ? 'CLINCHED_UPPER' : clinchedPlayoff ? 'QUALIFIED' : 'ELIMINATED',
        winsNeededToGuaranteePlayoff: clinchedPlayoff ? 0 : null,
        winsNeededToGuaranteeUpper: clinchedUpper ? 0 : null,
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
    let guaranteedAheadCount = 0;
    let potentialAheadCount = 0;

    TEAMS_LIST.forEach((otherTeam) => {
      if (otherTeam.id === teamId) return;
      const otherPot = potentialMap[otherTeam.id];
      if (!otherPot) return;

      // Other team guaranteed ahead if its minimum floor strictly exceeds my maximum ceiling
      if (
        otherPot.minWins > myPot.maxWins ||
        (otherPot.minWins === myPot.maxWins && otherPot.minGD > myPot.maxGD)
      ) {
        guaranteedAheadCount++;
      }

      // Other team can finish ahead if its ceiling can reach my floor
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
    const isEliminated = bestPossibleRank >= 7; // Cannot reach Top 6 even in best case
    const clinchedPlayoff = worstPossibleRank <= 6; // Cannot fall out of Top 6 even in worst case
    const clinchedUpperBracket = worstPossibleRank <= 2; // Cannot fall out of Top 2 even in worst case

    // Exact Mathematical Wins to Guarantee Top 6 and Top 2
    let winsNeededToGuaranteePlayoff: number | null = null;
    let winsNeededToGuaranteeUpper: number | null = null;

    if (clinchedPlayoff) {
      winsNeededToGuaranteePlayoff = 0;
    } else if (!isEliminated) {
      winsNeededToGuaranteePlayoff = calculateWinsToGuaranteePlayoff(
        teamId,
        currentStandings,
        remainingMatches
      );
    }

    if (clinchedUpperBracket) {
      winsNeededToGuaranteeUpper = 0;
    } else if (bestPossibleRank <= 2) {
      winsNeededToGuaranteeUpper = calculateWinsToGuaranteeUpper(
        teamId,
        currentStandings,
        remainingMatches
      );
    }

    // Minimum wins from remaining matches required to avoid mathematical elimination (stay alive)
    let minWinsToStayAlive = 0;
    if (isEliminated) {
      minWinsToStayAlive = 0;
    } else {
      for (let w = 0; w <= myPot.remaining; w++) {
        const potentialWinsWithW = myPot.minWins + w;
        const potentialMaxGDWithW = myPot.standing.gameDifference + w * 2;
        let guaranteedAhead = 0;
        TEAMS_LIST.forEach((otherTeam) => {
          if (otherTeam.id === teamId) return;
          const otherPot = potentialMap[otherTeam.id];
          if (!otherPot) return;
          if (
            otherPot.minWins > potentialWinsWithW ||
            (otherPot.minWins === potentialWinsWithW && otherPot.minGD > potentialMaxGDWithW)
          ) {
            guaranteedAhead++;
          }
        });
        if (guaranteedAhead < 6) {
          minWinsToStayAlive = w;
          break;
        }
      }
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

    // Factual, Non-generic Summary
    let summaryText = '';
    if (clinchedUpperBracket) {
      summaryText = 'Sudah Pasti Lolos Upper Bracket (Top 2)';
    } else if (clinchedPlayoff) {
      summaryText = 'Sudah Pasti Lolos Playoff (Top 6)';
    } else if (isEliminated) {
      summaryText = 'Telah Tereliminasi dari Playoff';
    } else if (winsNeededToGuaranteePlayoff !== null) {
      summaryText = `Butuh ${winsNeededToGuaranteePlayoff} kemenangan untuk mengunci Playoff`;
    } else {
      summaryText = `Belum dapat mengunci Playoff hanya dari jumlah kemenangan (Sisa ${myPot.remaining} match)`;
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
      minWinsToStayAlive,
      bestPossibleRank,
      worstPossibleRank,
      clinchedPlayoff,
      clinchedUpperBracket,
      isEliminated,
      status,
      winsNeededToGuaranteePlayoff,
      winsNeededToGuaranteeUpper,
      magicNumberPlayoff: winsNeededToGuaranteePlayoff,
      magicNumberUpper: winsNeededToGuaranteeUpper,
      summaryText
    };
  });

  return results;
}

export interface TeamFactualInsight {
  teamId: TeamId;
  remainingOpponents: { shortName: string; name: string }[];
  avgOpponentRank: number;
  scheduleDifficultyLabel: 'Tinggi' | 'Sedang' | 'Relatif Ringan';
  summaryInsight: string;
}

/**
 * Generates transparent, calculation-driven factual insights for a team.
 * Free from generic boilerplate, grounded directly in upcoming opponents and mathematical bounds.
 */
export function getTeamFactualInsight(
  teamId: TeamId,
  matches: Match[],
  standings: TeamStanding[],
  qAnalysis: QualificationAnalysis
): TeamFactualInsight {
  const team = TEAMS_LIST.find((t) => t.id === teamId);
  const remaining = matches.filter(
    (m) =>
      (m.homeTeam === teamId || m.awayTeam === teamId) &&
      (m.homeScore === null || m.awayScore === null)
  );

  const opponentIds = remaining.map((m) =>
    m.homeTeam === teamId ? m.awayTeam : m.homeTeam
  );

  const uniqueOpponents: { shortName: string; name: string }[] = [];
  const seen = new Set<string>();
  opponentIds.forEach((oppId) => {
    if (!seen.has(oppId)) {
      seen.add(oppId);
      const oppTeam = TEAMS_LIST.find((t) => t.id === oppId);
      if (oppTeam) {
        uniqueOpponents.push({ shortName: oppTeam.shortName, name: oppTeam.name });
      }
    }
  });

  const oppRanks = opponentIds.map((oppId) => {
    const st = standings.find((s) => s.teamId === oppId);
    return st?.rank ?? 5;
  });

  const avgRank = oppRanks.length > 0 ? oppRanks.reduce((a, b) => a + b, 0) / oppRanks.length : 5;

  let difficultyLabel: 'Tinggi' | 'Sedang' | 'Relatif Ringan' = 'Sedang';
  if (avgRank <= 3.8) {
    difficultyLabel = 'Tinggi';
  } else if (avgRank >= 5.5) {
    difficultyLabel = 'Relatif Ringan';
  }

  const oppNamesList = uniqueOpponents.map((o) => o.shortName).join(', ');

  let summaryInsight = '';
  if (qAnalysis.clinchedUpperBracket) {
    summaryInsight = `${team?.shortName || teamId.toUpperCase()} telah mengunci posisi Upper Bracket (Top 2) untuk babak Playoff.`;
  } else if (qAnalysis.clinchedPlayoff) {
    summaryInsight = `${team?.shortName || teamId.toUpperCase()} telah mengunci tiket Playoff (Top 6). Fokus sisa ${remaining.length} pertandingan adalah memperebutkan posisi Upper Bracket.`;
  } else if (qAnalysis.isEliminated) {
    summaryInsight = `${team?.shortName || teamId.toUpperCase()} telah dipastikan tidak dapat lolos ke babak Playoff secara matematis (posisi terbaik maksimal: #${qAnalysis.bestPossibleRank}).`;
  } else if (remaining.length === 0) {
    summaryInsight = `Seluruh pertandingan Regular Season telah selesai. ${team?.shortName || teamId.toUpperCase()} finis di peringkat #${qAnalysis.currentPosition}.`;
  } else {
    const winsNeeded = qAnalysis.winsNeededToGuaranteePlayoff;
    const winsText = winsNeeded !== null
      ? `Membutuhkan ${winsNeeded} kemenangan lagi dari sisa ${remaining.length} laga untuk mengunci Playoff secara mandiri.`
      : `Peluang kelolosan terbuka (potensi finis: #${qAnalysis.bestPossibleRank} - #${qAnalysis.worstPossibleRank}), namun kelolosan juga bergantung pada hasil pertandingan tim lain.`;

    summaryInsight = `${team?.shortName || teamId.toUpperCase()} masih memiliki ${remaining.length} pertandingan dan akan menghadapi ${oppNamesList}. ${winsText}`;
  }

  return {
    teamId,
    remainingOpponents: uniqueOpponents,
    avgOpponentRank: Number(avgRank.toFixed(1)),
    scheduleDifficultyLabel: difficultyLabel,
    summaryInsight
  };
}
