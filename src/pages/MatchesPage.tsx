import React, { useState, useMemo } from 'react';
import { Match } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { ResultModal } from '../components/ResultModal';
import { Swords, Calendar, Clock, CheckCircle2, Edit3, RotateCcw, Filter, CalendarDays } from 'lucide-react';

interface MatchesPageProps {
  allMatches: Match[];
  onSaveResult: (matchId: string, homeScore: number, awayScore: number) => void;
  onDeleteResult: (matchId: string) => void;
}

export function formatIndonesianDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()];
    const monthName = months[m - 1];
    return `${dayName}, ${d} ${monthName} ${y}`;
  } catch {
    return dateStr;
  }
}

export const MatchesPage: React.FC<MatchesPageProps> = ({
  allMatches,
  onSaveResult,
  onDeleteResult
}) => {
  // Determine initial active week (first week that has uncompleted matches, or week 1)
  const initialWeek = useMemo(() => {
    for (let w = 1; w <= 9; w++) {
      const weekMatches = allMatches.filter((m) => m.week === w);
      const hasUnfinished = weekMatches.some(
        (m) => m.homeScore === null || m.awayScore === null
      );
      if (hasUnfinished) return w;
    }
    return 1;
  }, [allMatches]);

  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [selectedDayFilter, setSelectedDayFilter] = useState<'all' | number>('all');
  const [activeModalMatch, setActiveModalMatch] = useState<Match | null>(null);

  const weekMatches = useMemo(() => {
    return allMatches.filter((m) => m.week === selectedWeek);
  }, [allMatches, selectedWeek]);

  // Group matches of the selected week by distinct dates (Days: Hari 1, Hari 2, Hari 3)
  const dayGroups = useMemo(() => {
    const dates = Array.from(new Set(weekMatches.map((m) => m.date))).sort() as string[];
    return dates.map((date, index) => {
      const matches = weekMatches.filter((m) => m.date === date);
      return {
        dayNumber: index + 1,
        date,
        formattedDate: formatIndonesianDate(date),
        matches
      };
    });
  }, [weekMatches]);

  const completedCount = allMatches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  ).length;

  const weekCompletedCount = weekMatches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  ).length;

  const filteredDayGroups = useMemo(() => {
    if (selectedDayFilter === 'all') return dayGroups;
    return dayGroups.filter((g) => g.dayNumber === selectedDayFilter);
  }, [dayGroups, selectedDayFilter]);

  return (
    <div className="space-y-6 pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 text-[#00D4FF] flex items-center justify-center border border-[#7C5CFF]/30">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Jadwal Pertandingan (Match Center)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Struktur Terorganisir: Week 1 - 9 ➔ Hari 1, 2, 3 ➔ Match 1, 2, 3 (Best of 3)
              </p>
            </div>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount} / 72 Total Selesai
            </span>
          </div>
        </div>

        {/* Week Selector Tabs (Week 1 to Week 9) */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih Pekan (Week 1 - 9)
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Pekan {selectedWeek}: <span className="text-emerald-400 font-bold">{weekCompletedCount}/8</span> Selesai
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => {
              const wMatches = allMatches.filter((m) => m.week === w);
              const wDone = wMatches.filter(
                (m) => m.homeScore !== null && m.awayScore !== null
              ).length;
              const isCurrent = selectedWeek === w;

              return (
                <button
                  key={w}
                  onClick={() => {
                    setSelectedWeek(w);
                    setSelectedDayFilter('all');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] text-white border-transparent shadow-lg shadow-[#7C5CFF]/25 scale-102'
                      : 'bg-[#181B24] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>WEEK {w}</span>
                  <span className={`text-[10px] font-mono font-normal ${
                    isCurrent ? 'text-white/90 font-bold' : 'text-slate-500'
                  }`}>
                    {wDone}/8
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Filter Chips for Selected Week (Hari 1, Hari 2, Hari 3) */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#00D4FF]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Filter Hari:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDayFilter === 'all'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                  : 'bg-[#181B24] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Semua Hari ({dayGroups.length} Hari)
            </button>
            {dayGroups.map((group) => {
              const isSelected = selectedDayFilter === group.dayNumber;
              const groupDone = group.matches.filter(
                (m) => m.homeScore !== null && m.awayScore !== null
              ).length;

              return (
                <button
                  key={group.dayNumber}
                  onClick={() => setSelectedDayFilter(group.dayNumber)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#7C5CFF] text-white border-[#7C5CFF] shadow-sm'
                      : 'bg-[#181B24] text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>Hari {group.dayNumber}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {groupDone}/{group.matches.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hierarchical Match Groups (Week -> Day -> Match 1, 2, 3...) */}
      <div className="space-y-6">
        {filteredDayGroups.map((group) => {
          const groupDone = group.matches.filter(
            (m) => m.homeScore !== null && m.awayScore !== null
          ).length;

          return (
            <div
              key={group.dayNumber}
              className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Day Header Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#181B24] via-[#141720] to-[#181B24] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] text-white font-black text-xs sm:text-sm tracking-wider shadow-md">
                    HARI {group.dayNumber}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>{group.formattedDate}</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Week {selectedWeek} • {group.matches.length} Pertandingan BO3
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono">
                  <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                    groupDone === group.matches.length
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {groupDone} / {group.matches.length} Selesai
                  </span>
                </div>
              </div>

              {/* Matches in this Day */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.matches.map((m, matchIndex) => {
                  const home = getTeam(m.homeTeam);
                  const away = getTeam(m.awayTeam);
                  const isDone = m.homeScore !== null && m.awayScore !== null;
                  const dayMatchNumber = matchIndex + 1;

                  return (
                    <div
                      key={m.id}
                      className={`bg-[#0D0F14] border rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between gap-4 transition-all ${
                        isDone
                          ? 'border-slate-800/90 bg-gradient-to-b from-[#141720]/80 to-[#0D0F14]'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Meta Bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-black text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded border border-[#00D4FF]/20">
                            Match {dayMatchNumber}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-slate-300">
                            <Clock className="w-3 h-3 text-[#7C5CFF]" />
                            {m.time} WIB
                          </span>
                        </div>

                        <div>
                          {isDone ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Selesai
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              Terjadwal
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams Face-off & Score Display */}
                      <div className="flex items-center justify-between gap-3 py-1">
                        
                        {/* Home Team */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <TeamLogo teamId={home.id} size="lg" />
                          <div className="min-w-0">
                            <div className={`font-black text-sm sm:text-base truncate ${
                              isDone && m.homeScore! > m.awayScore! ? 'text-white' : 'text-slate-300'
                            }`}>
                              {home.shortName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate uppercase">
                              {home.name}
                            </div>
                          </div>
                        </div>

                        {/* Score / VS Center Area */}
                        <div className="px-3 shrink-0 flex flex-col items-center">
                          {isDone ? (
                            <div className="flex items-center gap-2 bg-[#11131A] px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                              <span className={`text-xl font-black ${
                                m.homeScore! > m.awayScore! ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {m.homeScore}
                              </span>
                              <span className="text-slate-600 font-bold">:</span>
                              <span className={`text-xl font-black ${
                                m.awayScore! > m.homeScore! ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {m.awayScore}
                              </span>
                            </div>
                          ) : (
                            <div className="px-3.5 py-1 rounded-lg bg-[#11131A] border border-slate-800 text-xs font-black text-slate-400 tracking-wider">
                              VS
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3 flex-1 justify-end text-right min-w-0">
                          <div className="min-w-0">
                            <div className={`font-black text-sm sm:text-base truncate ${
                              isDone && m.awayScore! > m.homeScore! ? 'text-white' : 'text-slate-300'
                            }`}>
                              {away.shortName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate uppercase">
                              {away.name}
                            </div>
                          </div>
                          <TeamLogo teamId={away.id} size="lg" />
                        </div>

                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        {isDone ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveModalMatch(m)}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-300 bg-[#181B24] hover:bg-slate-800 border border-slate-700/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ubah Skor ({m.homeScore} - {m.awayScore})</span>
                            </button>
                            <button
                              onClick={() => onDeleteResult(m.id)}
                              className="p-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 transition-all cursor-pointer"
                              title="Hapus Hasil"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveModalMatch(m)}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] hover:brightness-110 shadow-md shadow-[#7C5CFF]/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Input Hasil Pertandingan</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
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
