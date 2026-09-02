import React from 'react';
import { TeamStanding, PlayoffProbabilities, TeamId } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { Trophy, Zap, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ChevronRight } from 'lucide-react';
import { getZoneByRank } from '../data/rules';

interface PlayoffRacePageProps {
  standings: TeamStanding[];
  probabilities: PlayoffProbabilities[];
  onSelectTeam: (teamId: TeamId) => void;
}

export const PlayoffRacePage: React.FC<PlayoffRacePageProps> = ({
  standings,
  probabilities,
  onSelectTeam
}) => {
  const isSeasonStarted = standings.some((s) => s.played > 0);
  const upperBracket = standings.slice(0, 2);
  const playIn = standings.slice(2, 6);
  const eliminated = standings.slice(6, 9);

  const getStatusLabel = (chance: number) => {
    if (!isSeasonStarted) {
      return { label: 'Belum Dimulai', color: 'text-slate-400', badge: 'bg-slate-800 border-slate-700' };
    }
    if (chance >= 95) return { label: 'Aman', color: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30' };
    if (chance >= 70) return { label: 'Peluang Kuat', color: 'text-emerald-400', badge: 'bg-emerald-500/15 border-emerald-500/30' };
    if (chance >= 40) return { label: 'Masih Terbuka', color: 'text-amber-400', badge: 'bg-amber-500/15 border-amber-500/30' };
    if (chance >= 15) return { label: 'Zona Bahaya', color: 'text-orange-400', badge: 'bg-orange-500/15 border-orange-500/30' };
    if (chance > 0) return { label: 'Hampir Tersingkir', color: 'text-red-400', badge: 'bg-red-500/15 border-red-500/30' };
    return { label: 'Tersingkir', color: 'text-slate-500', badge: 'bg-slate-800 border-slate-700' };
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#7C5CFF]/15 text-[#00D4FF] border border-[#7C5CFF]/30 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>PLAYOFF QUALIFICATION RACE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Peta Persaingan Playoff (Playoff Race)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Top 6 Lolos ke Playoff • Rank #1–#2 Upper Bracket • Rank #7–#9 Tersingkir
          </p>
        </div>
      </div>

      {/* 2. Visual Qualification Board */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#181B24] flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Papan Kualifikasi (Qualification Board)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Berdasarkan Posisi Klasemen Terkini
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          
          {/* Upper Bracket Tier (#1 - #2) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/20 via-[#11131A] to-[#11131A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider">
                  Upper Bracket (#1 - #2)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Langsung Lolos Semifinal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upperBracket.map((st) => {
                const prob = probabilities.find((p) => p.teamId === st.teamId);
                return (
                  <div
                    key={st.teamId}
                    onClick={() => onSelectTeam(st.teamId)}
                    className="bg-[#181B24] hover:bg-slate-800 p-3.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-emerald-400 text-sm">#{st.rank}</span>
                      <TeamLogo teamId={st.teamId} size="md" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {st.team.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {st.matchWins}W - {st.matchLosses}L (Diff {st.gameDifference > 0 ? `+${st.gameDifference}` : st.gameDifference})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {isSeasonStarted && prob ? `${prob.upperBracketChance.toFixed(2)}%` : '- %'}
                      </div>
                      <div className="text-[10px] text-slate-500">Upper Chance</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playoff / Play-in Tier (#3 - #6) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/20 via-[#11131A] to-[#11131A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="font-extrabold text-sm text-sky-400 uppercase tracking-wider">
                  Playoff / Play-in (#3 - #6)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Lolos Playoff
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playIn.map((st) => {
                const prob = probabilities.find((p) => p.teamId === st.teamId);
                return (
                  <div
                    key={st.teamId}
                    onClick={() => onSelectTeam(st.teamId)}
                    className="bg-[#181B24] hover:bg-slate-800 p-3.5 rounded-xl border border-sky-500/30 hover:border-sky-500/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sky-400 text-sm">#{st.rank}</span>
                      <TeamLogo teamId={st.teamId} size="md" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                          {st.team.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {st.matchWins}W - {st.matchLosses}L (Diff {st.gameDifference > 0 ? `+${st.gameDifference}` : st.gameDifference})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-sky-400 font-mono">
                        {isSeasonStarted && prob ? `${prob.playoffChance.toFixed(2)}%` : '- %'}
                      </div>
                      <div className="text-[10px] text-slate-500">Playoff Chance</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eliminated Tier (#7 - #9) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/20 via-[#11131A] to-[#11131A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="font-extrabold text-sm text-red-400 uppercase tracking-wider">
                  Zona Tereliminasi (#7 - #9)
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-300 border border-red-500/30">
                Gugur di Regular Season
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {eliminated.map((st) => {
                const prob = probabilities.find((p) => p.teamId === st.teamId);
                return (
                  <div
                    key={st.teamId}
                    onClick={() => onSelectTeam(st.teamId)}
                    className="bg-[#181B24] hover:bg-slate-800 p-3.5 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-red-400 text-sm">#{st.rank}</span>
                      <TeamLogo teamId={st.teamId} size="md" />
                      <div>
                        <div className="font-bold text-sm text-slate-300 group-hover:text-red-400 transition-colors">
                          {st.team.shortName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {st.matchWins}W - {st.matchLosses}L
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-red-400 font-mono">
                        {isSeasonStarted && prob ? `${prob.eliminationChance.toFixed(2)}%` : '- %'}
                      </div>
                      <div className="text-[10px] text-slate-500">Elim Chance</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Team Playoff Cards Grid (Section 13) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Kartu Peluang Setiap Tim (Team Playoff Cards)
          </h2>
          <span className="text-xs text-slate-500">
            Klik tim untuk melihat detail & sisa pertandingan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standings.map((st) => {
            const prob = probabilities.find((p) => p.teamId === st.teamId);
            const chance = prob ? prob.playoffChance : 0;
            const upper = prob ? prob.upperBracketChance : 0;
            const elim = prob ? prob.eliminationChance : 0;
            const meta = getStatusLabel(chance);

            return (
              <div
                key={st.teamId}
                onClick={() => onSelectTeam(st.teamId)}
                className="bg-[#11131A] hover:bg-[#181B24] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Team Bar */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <TeamLogo teamId={st.teamId} size="lg" />
                      <div>
                        <div className="font-extrabold text-base text-white group-hover:text-[#00D4FF] transition-colors">
                          {st.team.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Rank #{st.rank} • {st.matchWins}W - {st.matchLosses}L
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badge} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* 3 Main Odds Stats */}
                  <div className="grid grid-cols-3 gap-2 py-4 text-center">
                    <div className="bg-[#181B24]/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Playoff</div>
                      <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                        {isSeasonStarted ? `${chance.toFixed(2)}%` : '- %'}
                      </div>
                    </div>

                    <div className="bg-[#181B24]/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Upper</div>
                      <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                        {isSeasonStarted ? `${upper.toFixed(2)}%` : '- %'}
                      </div>
                    </div>

                    <div className="bg-[#181B24]/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Eliminasi</div>
                      <div className="text-base font-black text-red-400 font-mono mt-0.5">
                        {isSeasonStarted ? `${elim.toFixed(2)}%` : '- %'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Best #{st.bestPossibleRank} • Worst #{st.worstPossibleRank}</span>
                  <span className="text-[#00D4FF] group-hover:translate-x-0.5 transition-transform flex items-center">
                    Detail <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
