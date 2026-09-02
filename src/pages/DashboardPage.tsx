import React, { useState } from 'react';
import { Match, TeamStanding, PlayoffProbabilities, TeamId } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { StandingsTable } from '../components/StandingsTable';
import { ResultModal } from '../components/ResultModal';
import { ActiveTab } from '../components/Navbar';
import { formatIndonesianDate } from './MatchesPage';
import { Trophy, Swords, Zap, Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

interface DashboardPageProps {
  standings: TeamStanding[];
  probabilities: PlayoffProbabilities[];
  allMatches: Match[];
  onSaveResult: (matchId: string, homeScore: number, awayScore: number) => void;
  onDeleteResult: (matchId: string) => void;
  onSelectTeam: (teamId: TeamId) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onLoadSample?: () => void;
  onOpenSettings?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  standings,
  probabilities,
  allMatches,
  onSaveResult,
  onDeleteResult,
  onSelectTeam,
  setActiveTab,
  onLoadSample,
  onOpenSettings
}) => {
  const [activeModalMatch, setActiveModalMatch] = useState<Match | null>(null);

  const completedMatches = allMatches.filter((m) => m.homeScore !== null && m.awayScore !== null);
  const completedCount = completedMatches.length;

  // Find next scheduled upcoming matches
  const upcomingMatches = allMatches
    .filter((m) => m.homeScore === null || m.awayScore === null)
    .slice(0, 4);

  // Helper for human-friendly probability status label & color
  const getPlayoffStatusMeta = (chance: number) => {
    if (chance >= 95) {
      return { label: 'Aman', color: 'text-emerald-400', bg: 'bg-emerald-500', barBg: 'from-emerald-500 to-teal-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
    }
    if (chance >= 70) {
      return { label: 'Peluang Kuat', color: 'text-emerald-400', bg: 'bg-emerald-500', barBg: 'from-emerald-500 to-teal-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
    }
    if (chance >= 40) {
      return { label: 'Masih Terbuka', color: 'text-amber-400', bg: 'bg-amber-500', barBg: 'from-amber-500 to-yellow-400', badgeBg: 'bg-amber-500/15 border-amber-500/30' };
    }
    if (chance >= 15) {
      return { label: 'Zona Bahaya', color: 'text-orange-400', bg: 'bg-orange-500', barBg: 'from-orange-500 to-amber-500', badgeBg: 'bg-orange-500/15 border-orange-500/30' };
    }
    if (chance > 0) {
      return { label: 'Hampir Tersingkir', color: 'text-red-400', bg: 'bg-red-500', barBg: 'from-red-500 to-rose-600', badgeBg: 'bg-red-500/15 border-red-500/30' };
    }
    return { label: 'Tersingkir', color: 'text-slate-500', bg: 'bg-slate-600', barBg: 'from-slate-600 to-slate-700', badgeBg: 'bg-slate-800 border-slate-700' };
  };

  // Sort probabilities to match standings or playoff chance
  const sortedProbabilities = [...probabilities].sort((a, b) => b.playoffChance - a.playoffChance);

  return (
    <div className="space-y-6 pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7C5CFF]/10 via-[#00D4FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#7C5CFF]/15 text-[#00D4FF] border border-[#7C5CFF]/30 mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>MPL INDONESIA SEASON 18</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Playoff Predictor & Standings Tracker
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
            Update hasil pertandingan dan lihat peluang playoff secara real-time.
          </p>
        </div>
      </div>

      {/* Quick Starter Banner if 0 matches completed */}
      {completedCount === 0 && (
        <div className="bg-gradient-to-r from-[#181B24] via-[#141720] to-[#181B24] border border-[#7C5CFF]/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="text-sm font-bold text-white">Musim Baru Dimulai (0 Pertandingan Selesai)</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Klasemen saat ini dalam kondisi awal bersih (default). Anda bisa mulai menginput skor manual di tab <strong>Matches</strong> atau gunakan template hasil Week 1–3 untuk melihat simulasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onLoadSample && (
              <button
                onClick={onLoadSample}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] hover:brightness-110 shadow-md shadow-[#7C5CFF]/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Gunakan Template Week 1–3</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('matches')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-[#181B24] hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Input Hasil Pertandingan</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Official MPL ID Standings Table */}
      <StandingsTable standings={standings} onSelectTeam={onSelectTeam} />

      {/* 3. Playoff Chance Section (Immediately below Standings) */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00D4FF]" />
              <span>Peluang Playoff (Estimated Playoff Chance)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedCount > 0
                ? `Dihitung otomatis berdasarkan ${completedCount} laga selesai, selisih game, dan jadwal sisa Regular Season.`
                : 'Dihitung otomatis berdasarkan format BO3 dan sisa 72 laga Regular Season.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('playoff')}
            className="text-xs font-bold text-[#00D4FF] hover:underline flex items-center gap-1 cursor-pointer bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 px-3 py-1.5 rounded-lg border border-[#7C5CFF]/30 transition-all"
          >
            <span>Buka Analisis Persaingan Playoff</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Probability Bars */}
        <div className="space-y-3.5">
          {sortedProbabilities.map((prob) => {
            const chance = prob.playoffChance;
            const upper = prob.upperBracketChance;
            const elim = prob.eliminationChance;
            const meta = getPlayoffStatusMeta(chance);

            return (
              <div
                key={prob.teamId}
                onClick={() => onSelectTeam(prob.teamId)}
                className="bg-[#181B24] hover:bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamLogo teamId={prob.teamId} size="sm" />
                    <span className="font-bold text-sm text-slate-100 group-hover:text-[#00D4FF] transition-colors truncate">
                      {prob.team.shortName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate hidden sm:inline uppercase">
                      — {prob.team.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Upper: {upper.toFixed(1)}%
                      </span>
                      <span className="text-red-400/90 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        Gugur: {elim.toFixed(1)}%
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeBg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className={`font-mono font-black text-sm sm:text-base ${meta.color} min-w-[64px] text-right`}>
                      {chance.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${meta.barBg} transition-all duration-500`}
                    style={{ width: `${Math.max(chance, 1.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Next Match Section */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Pertandingan Berikutnya (Next Matches)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik [ Input Hasil ] untuk memasukkan skor dan perbarui klasemen secara instan.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="text-xs font-bold text-[#00D4FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Jadwal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((m) => {
              const home = standings.find((s) => s.teamId === m.homeTeam)?.team;
              const away = standings.find((s) => s.teamId === m.awayTeam)?.team;
              if (!home || !away) return null;

              return (
                <div
                  key={m.id}
                  className="bg-[#181B24] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  {/* Top Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2.5">
                    <span className="font-bold text-[#7C5CFF]">Week {m.week}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatIndonesianDate(m.date)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {m.time} WIB
                      </span>
                    </div>
                  </div>

                  {/* Matchup Face-off */}
                  <div className="flex items-center justify-between gap-3 py-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <TeamLogo teamId={home.id} size="md" />
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-100 truncate">
                          {home.shortName}
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider truncate">
                          {home.name}
                        </div>
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="px-2.5 py-1 rounded-lg bg-[#08090D] border border-slate-800 text-[11px] font-black text-slate-400">
                      VS
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end text-right min-w-0">
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-100 truncate">
                          {away.shortName}
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider truncate">
                          {away.name}
                        </div>
                      </div>
                      <TeamLogo teamId={away.id} size="md" />
                    </div>
                  </div>

                  {/* Input Result Action Button */}
                  <button
                    onClick={() => setActiveModalMatch(m)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] hover:brightness-110 shadow-md shadow-[#7C5CFF]/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Input Hasil Pertandingan</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#181B24] rounded-xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="font-bold text-slate-200">Semua Pertandingan Selesai!</div>
            <div className="text-xs text-slate-400 mt-1">72 pertandingan Regular Season telah tercatat.</div>
          </div>
        )}
      </div>

      {/* Result Input Modal */}
      <ResultModal
        match={activeModalMatch}
        isOpen={Boolean(activeModalMatch)}
        onClose={() => setActiveModalMatch(null)}
        onSaveResult={onSaveResult}
        onDeleteResult={onDeleteResult}
      />

    </div>
  );
};
