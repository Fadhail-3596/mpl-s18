import React from 'react';
import { TeamId, TeamStanding, PlayoffProbabilities, Match } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { X, Trophy, Swords, Zap, CheckCircle2, AlertTriangle, ShieldX, Calendar, Clock, Award, Compass } from 'lucide-react';
import { getZoneByRank } from '../data/rules';
import { analyzeQualifications, getTeamFactualInsight } from '../engine/qualificationEngine';
import { calculateStandings } from '../engine/standingsEngine';

interface TeamDetailModalProps {
  teamId: TeamId | null;
  onClose: () => void;
  standing?: TeamStanding;
  probabilities?: PlayoffProbabilities;
  allMatches: Match[];
  onQuickScoreMatch?: (matchId: string, homeScore: number, awayScore: number) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  teamId,
  onClose,
  standing,
  probabilities,
  allMatches
}) => {
  if (!teamId || !standing) return null;

  const team = getTeam(teamId);
  const zone = getZoneByRank(standing.rank);
  const qualificationMap = analyzeQualifications(allMatches);
  const qAnalysis = qualificationMap[teamId];
  const currentStandings = calculateStandings(allMatches);
  const factualInsight = qAnalysis ? getTeamFactualInsight(teamId, allMatches, currentStandings, qAnalysis) : null;

  const playoffChance = probabilities ? probabilities.playoffChance : 0;
  const upperChance = probabilities ? probabilities.upperBracketChance : 0;
  const elimChance = probabilities ? probabilities.eliminationChance : 0;

  // Filter team matches
  const teamMatches = allMatches.filter(
    (m) => m.homeTeam === teamId || m.awayTeam === teamId
  );
  const completedMatches = teamMatches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  );
  const remainingMatches = teamMatches.filter(
    (m) => m.homeScore === null || m.awayScore === null
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#11131A] border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto scrollbar-thin text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Team Brand */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#181B24] via-[#11131A] to-[#181B24] border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#11131A] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <TeamLogo teamId={team.id} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {team.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
                  {team.shortName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${zone.badgeClass}`}>
                  Peringkat #{standing.rank} ({zone.label})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700 font-mono">
                  Potensi Posisi: #{standing.bestPossibleRank} - #{standing.worstPossibleRank}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* PRIMARY: Data Peluang Playoff, Upper Bracket & Eliminasi */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Peluang & Skenario Kelolosan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Peluang Playoff */}
              <div className="bg-[#181B24] p-4 rounded-xl border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-emerald-400">Peluang Playoff</span>
                  <span className="text-[10px] text-slate-500 font-mono">Top 6</span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {playoffChance.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.max(playoffChance, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {qAnalysis?.clinchedPlayoff ? (
                    <span className="text-emerald-400 font-bold">✓ Sudah Pasti Lolos Playoff</span>
                  ) : qAnalysis?.isEliminated ? (
                    <span className="text-red-400 font-bold">✗ Dipastikan Gugur</span>
                  ) : qAnalysis?.winsNeededToGuaranteePlayoff !== null && qAnalysis?.winsNeededToGuaranteePlayoff !== undefined ? (
                    `Butuh ${qAnalysis.winsNeededToGuaranteePlayoff} kemenangan untuk mengunci`
                  ) : (
                    <span className="text-slate-400">Belum dapat dikunci sendiri</span>
                  )}
                </div>
              </div>

              {/* 2. Peluang Upper Bracket */}
              <div className="bg-[#181B24] p-4 rounded-xl border border-sky-500/30">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-sky-400">Peluang Upper</span>
                  <span className="text-[10px] text-slate-500 font-mono">Rank #1 - #2</span>
                </div>
                <div className="text-2xl font-black font-mono text-sky-400">
                  {upperChance.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${Math.max(upperChance, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {qAnalysis?.clinchedUpperBracket ? (
                    <span className="text-sky-400 font-bold">✓ Lolos Upper Bracket</span>
                  ) : qAnalysis?.winsNeededToGuaranteeUpper !== null && qAnalysis?.winsNeededToGuaranteeUpper !== undefined ? (
                    `Butuh ${qAnalysis.winsNeededToGuaranteeUpper} kemenangan untuk mengunci`
                  ) : (
                    <span className="text-slate-400">Belum dapat dikunci sendiri</span>
                  )}
                </div>
              </div>

              {/* 3. Peluang Eliminasi / Gugur */}
              <div className="bg-[#181B24] p-4 rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-red-400">Peluang Gugur</span>
                  <span className="text-[10px] text-slate-500 font-mono">Rank #7 - #9</span>
                </div>
                <div className="text-2xl font-black font-mono text-red-400">
                  {elimChance.toFixed(1)}%
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${Math.max(elimChance, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {qAnalysis?.isEliminated ? (
                    <span className="text-red-400 font-bold">✗ Telah Tereliminasi</span>
                  ) : (
                    `Potensi posisi terburuk: #${standing.worstPossibleRank}`
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Match Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#181B24] p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Rekor Match</div>
              <div className="text-base font-black font-mono text-slate-100 mt-1">
                <span className="text-emerald-400">{standing.matchWins}W</span> - <span className="text-red-400">{standing.matchLosses}L</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {(standing.matchWinRate * 100).toFixed(1)}% Win Rate
              </div>
            </div>

            <div className="bg-[#181B24] p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Rekor Game</div>
              <div className="text-base font-black font-mono text-slate-100 mt-1">
                {standing.gamesWon}W - {standing.gamesLost}L
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Diff: {standing.gameDifference > 0 ? `+${standing.gameDifference}` : standing.gameDifference}
              </div>
            </div>

            <div className="bg-[#181B24] p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Match Selesai</div>
              <div className="text-base font-black font-mono text-slate-100 mt-1">
                {completedMatches.length} / 16
              </div>
              <div className="text-[10px] text-slate-500">
                Dimainkan
              </div>
            </div>

            <div className="bg-[#181B24] p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sisa Laga</div>
              <div className="text-base font-black font-mono text-slate-100 mt-1">
                {remainingMatches.length} Laga
              </div>
              <div className="text-[10px] text-slate-500">
                Regular Season
              </div>
            </div>
          </div>

          {/* 4 Mathematical Qualification Bounds */}
          <div className="bg-[#181B24] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Award className="w-4 h-4 text-[#00D4FF]" />
                <span>Kalkulasi Matematika Kelolosan</span>
              </div>
              {factualInsight && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  factualInsight.scheduleDifficultyLabel === 'Tinggi'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : factualInsight.scheduleDifficultyLabel === 'Sedang'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  Tingkat Kesulitan Jadwal: {factualInsight.scheduleDifficultyLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Maksimum Match Wins</div>
                <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                  {qAnalysis?.maxPossibleWins ?? standing.matchWins + remainingMatches.length} W
                </div>
                <div className="text-[10px] text-slate-500">Plafon kemenangan</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Min. Wins Tetap Hidup</div>
                <div className="text-base font-black font-mono text-amber-400 mt-0.5">
                  {qAnalysis?.minWinsToStayAlive ?? 0} W
                </div>
                <div className="text-[10px] text-slate-500">Hindari eliminasi dini</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Kunci Tiket Playoff</div>
                <div className="text-base font-black font-mono text-[#00D4FF] mt-0.5">
                  {qAnalysis?.clinchedPlayoff ? (
                    'Terkunci'
                  ) : qAnalysis?.winsNeededToGuaranteePlayoff !== null ? (
                    `${qAnalysis?.winsNeededToGuaranteePlayoff} W`
                  ) : (
                    'Belum bisa'
                  )}
                </div>
                <div className="text-[10px] text-slate-500">Secara mandiri (Top 6)</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Kunci Upper Bracket</div>
                <div className="text-base font-black font-mono text-purple-400 mt-0.5">
                  {qAnalysis?.clinchedUpperBracket ? (
                    'Terkunci'
                  ) : qAnalysis?.winsNeededToGuaranteeUpper !== null ? (
                    `${qAnalysis?.winsNeededToGuaranteeUpper} W`
                  ) : (
                    'Belum bisa'
                  )}
                </div>
                <div className="text-[10px] text-slate-500">Secara mandiri (Top 2)</div>
              </div>
            </div>

            {/* Factual, calculation-driven insight */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {factualInsight?.summaryInsight}
              </p>
            </div>
          </div>

          {/* Schedule / Match List */}
          <div className="space-y-4">
            {/* Remaining Matches */}
            {remainingMatches.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Jadwal Sisa Pertandingan ({remainingMatches.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {remainingMatches.map((m) => {
                    const isHome = m.homeTeam === teamId;
                    const opponentId = isHome ? m.awayTeam : m.homeTeam;
                    const opponent = getTeam(opponentId);

                    return (
                      <div
                        key={m.id}
                        className="bg-[#181B24] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TeamLogo teamId={opponent.id} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white truncate">
                              vs {opponent.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Week {m.week} • {m.day}, {m.date}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          {m.time} WIB
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Matches */}
            {completedMatches.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Riwayat Pertandingan Selesai ({completedMatches.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {completedMatches.map((m) => {
                    const isHome = m.homeTeam === teamId;
                    const opponentId = isHome ? m.awayTeam : m.homeTeam;
                    const opponent = getTeam(opponentId);
                    const myScore = isHome ? m.homeScore : m.awayScore;
                    const oppScore = isHome ? m.awayScore : m.homeScore;
                    const isWin = (myScore ?? 0) > (oppScore ?? 0);

                    return (
                      <div
                        key={m.id}
                        className="bg-[#181B24] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TeamLogo teamId={opponent.id} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white truncate">
                              vs {opponent.shortName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Week {m.week}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isWin
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {isWin ? 'MENANG' : 'KALAH'} {myScore} - {oppScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
