import React from 'react';
import { TeamId, TeamStanding, PlayoffProbabilities, Match } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { X, Trophy, Swords, Zap, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { getZoneByRank } from '../data/rules';

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
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#11131A] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all"
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
                  Rank #{standing.rank} ({zone.label})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/90 text-slate-300 border border-slate-700">
                  Range: #{standing.bestPossibleRank} - #{standing.worstPossibleRank}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#181B24] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Match Record</div>
              <div className="text-lg font-black font-mono text-slate-100 mt-1">
                <span className="text-emerald-400">{standing.matchWins}W</span> - <span className="text-red-400">{standing.matchLosses}L</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {(standing.matchWinRate * 100).toFixed(2)}% Win Rate
              </div>
            </div>

            <div className="bg-[#181B24] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Game Record</div>
              <div className="text-lg font-black font-mono text-slate-100 mt-1">
                {standing.gamesWon}W - {standing.gamesLost}L
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Diff: {standing.gameDifference > 0 ? `+${standing.gameDifference}` : standing.gameDifference}
              </div>
            </div>

            <div className="bg-[#181B24] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Playoff Chance</div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                {probabilities ? `${probabilities.playoffChance.toFixed(2)}%` : '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Top 6 Qualification
              </div>
            </div>

            <div className="bg-[#181B24] p-3.5 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Upper Bracket</div>
              <div className="text-lg font-black font-mono text-sky-400 mt-1">
                {probabilities ? `${probabilities.upperBracketChance.toFixed(2)}%` : '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Seed 1-2 Chance
              </div>
            </div>
          </div>

          {/* Schedule / Match List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#7C5CFF]" />
              <span>Daftar Pertandingan (16 Match)</span>
            </h3>

            {/* Remaining Matches */}
            {remainingMatches.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400">
                  Sisa Pertandingan ({remainingMatches.length})
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
                              Week {m.week} • {m.date}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
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
                <div className="text-xs font-semibold text-slate-400">
                  Pertandingan Selesai ({completedMatches.length})
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
                            {isWin ? 'WIN' : 'LOSE'} {myScore} - {oppScore}
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
