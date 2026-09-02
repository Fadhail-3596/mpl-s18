import React, { useState } from 'react';
import { Match, TeamStanding, UserScenario, TeamId } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from '../components/TeamLogo';
import { Sliders, RotateCcw, ArrowUp, ArrowDown, Minus, Sparkles, CheckCircle2, Bookmark, Calendar, Clock } from 'lucide-react';
import { ScenarioStandingComparison } from '../engine/scenarioEngine';

interface WhatIfPanelProps {
  allMatches: Match[];
  realStandings: TeamStanding[];
  simulatedStandings: TeamStanding[];
  comparison: ScenarioStandingComparison[];
  scenarioOverrides: Record<string, [number, number]>;
  onSetScenarioScore: (matchId: string, homeScore: number, awayScore: number) => void;
  onClearScenarioScore: (matchId: string) => void;
  onResetAllOverrides: () => void;
  onSaveScenario: (name: string) => void;
  savedScenarios: UserScenario[];
  onLoadScenario: (scenario: UserScenario) => void;
  onDeleteScenario: (id: string) => void;
  onSelectTeam: (teamId: TeamId) => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  allMatches,
  realStandings,
  simulatedStandings,
  comparison,
  scenarioOverrides,
  onSetScenarioScore,
  onClearScenarioScore,
  onResetAllOverrides,
  onSaveScenario,
  savedScenarios,
  onLoadScenario,
  onDeleteScenario,
  onSelectTeam
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [scenarioName, setScenarioName] = useState('');
  const overridesCount = Object.keys(scenarioOverrides).length;

  // Filter unplayed matches for scenario testing
  const futureMatches = allMatches.filter(
    (m) => (m.homeScore === null || m.awayScore === null) || scenarioOverrides[m.id]
  );

  const displayedMatches = selectedWeek === 'all'
    ? futureMatches
    : futureMatches.filter((m) => m.week === selectedWeek);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (overridesCount === 0) return;
    onSaveScenario(scenarioName.trim() || `Skenario ${overridesCount} Pilihan`);
    setScenarioName('');
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-[#11131A] border border-[#7C5CFF]/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00D4FF] p-[2px] shadow-lg shadow-[#7C5CFF]/20 shrink-0">
              <div className="w-full h-full bg-[#11131A] rounded-[10px] flex items-center justify-center text-[#00D4FF]">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  What-If Mode (Simulasi Skenario)
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00D4FF] text-slate-950 uppercase">
                  Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulasikan hasil pertandingan masa depan untuk melihat pergeseran posisi klasemen secara live.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onResetAllOverrides}
              disabled={overridesCount === 0}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pilihan ({overridesCount})</span>
            </button>
          </div>
        </div>

        {/* What-If Explanation Box */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#181B24] via-[#141720] to-[#181B24] border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-[#00D4FF] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF]" />
            <span>Mengenai Fitur What-If (Simulasi Pengandaian):</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
            Fitur <strong>What-If</strong> memungkinkan Anda menguji berbagai skenario skor pertandingan sisa (*contoh: &quot;Bagaimana jika tim jagoan Anda menang 2-0 di semua sisa match?&quot;*). Hasil pilihan ini <strong>hanya bersifat simulasi sementara</strong> dan tidak mengubah data pertandingan asli Anda di LocalStorage.
          </p>
        </div>

        {/* Save Scenario Bar */}
        {overridesCount > 0 && (
          <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Beri nama skenario ini (misal: 'BTR Sapu Bersih')..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#181B24] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7C5CFF] hover:bg-[#6b47ff] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#7C5CFF]/20 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Simpan Skenario</span>
            </button>
          </form>
        )}
      </div>

      {/* 2. Live Scenario vs Real Standings Comparison */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#181B24] flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
              <span>Hasil Klasemen Skenario (Live Comparison)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Perubahan posisi berdasarkan {overridesCount} pertandingan yang disimulasikan.
            </p>
          </div>
          {overridesCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#7C5CFF]/20 text-[#00D4FF] border border-[#7C5CFF]/30">
              {overridesCount} Pick Aktif
            </span>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#181B24]/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3 text-center w-12">Skenario</th>
                <th className="py-3 px-3 text-center w-12">Perubahan</th>
                <th className="py-3 px-3 sm:px-4">Tim</th>
                <th className="py-3 px-3 text-center">Match (W-L)</th>
                <th className="py-3 px-3 text-center">Diff</th>
                <th className="py-3 px-3 text-center">Status Skenario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {comparison.map((comp) => {
                const team = getTeam(comp.teamId);
                const isRankUp = comp.rankDelta > 0;
                const isRankDown = comp.rankDelta < 0;

                return (
                  <tr
                    key={comp.teamId}
                    onClick={() => onSelectTeam(comp.teamId)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Simulated Rank */}
                    <td className="py-3 px-3 text-center font-bold">
                      <span className={`text-sm ${
                        comp.simulatedRank <= 2 ? 'text-emerald-400' : comp.simulatedRank <= 6 ? 'text-sky-400' : 'text-slate-400'
                      }`}>
                        #{comp.simulatedRank}
                      </span>
                    </td>

                    {/* Rank Delta */}
                    <td className="py-3 px-3 text-center font-bold">
                      {isRankUp && (
                        <span className="inline-flex items-center text-xs text-emerald-400 font-mono">
                          <ArrowUp className="w-3.5 h-3.5 mr-0.5" />+{comp.rankDelta}
                        </span>
                      )}
                      {isRankDown && (
                        <span className="inline-flex items-center text-xs text-red-400 font-mono">
                          <ArrowDown className="w-3.5 h-3.5 mr-0.5" />{comp.rankDelta}
                        </span>
                      )}
                      {!isRankUp && !isRankDown && (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo teamId={comp.teamId} size="sm" />
                        <span className="font-bold text-slate-100 group-hover:text-[#00D4FF] transition-colors">
                          {team.name}
                        </span>
                      </div>
                    </td>

                    {/* Simulated Match Record */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                      {comp.simulatedStanding.matchWins}-{comp.simulatedStanding.matchLosses}
                    </td>

                    {/* Simulated Diff */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={
                        comp.simulatedStanding.gameDifference > 0 ? 'text-emerald-400' :
                        comp.simulatedStanding.gameDifference === 0 ? 'text-slate-400' : 'text-red-400'
                      }>
                        {comp.simulatedStanding.gameDifference > 0 ? `+${comp.simulatedStanding.gameDifference}` : comp.simulatedStanding.gameDifference}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        comp.simulatedRank <= 2
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : comp.simulatedRank <= 6
                          ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {comp.simulatedRank <= 2 ? 'Upper Bracket' : comp.simulatedRank <= 6 ? 'Playoff' : 'Tersingkir'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Future Match Outcome Pickers */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Pilih Hasil Pertandingan Sisa
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik salah satu skor untuk langsung mensimulasikan hasil pertandingan.
            </p>
          </div>

          {/* Week Filter */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedWeek('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedWeek === 'all'
                  ? 'bg-[#7C5CFF] text-white'
                  : 'bg-[#181B24] text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedWeek === w
                    ? 'bg-[#7C5CFF] text-white'
                    : 'bg-[#181B24] text-slate-400 hover:text-white'
                }`}
              >
                W{w}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((m) => {
            const home = getTeam(m.homeTeam);
            const away = getTeam(m.awayTeam);
            const override = scenarioOverrides[m.id];
            const currentSelected = override ? `${override[0]}-${override[1]}` : null;

            return (
              <div
                key={m.id}
                className={`bg-[#11131A] border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 transition-all ${
                  override
                    ? 'border-[#7C5CFF] bg-gradient-to-b from-[#7C5CFF]/10 to-[#11131A] ring-1 ring-[#7C5CFF]/40'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Top Meta */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-[#7C5CFF]">Week {m.week} • Match {m.id.split('-m')[1]}</span>
                  <div className="flex items-center gap-2">
                    <span>{m.date}</span>
                    <span>•</span>
                    <span>{m.time} WIB</span>
                  </div>
                </div>

                {/* Matchup Teams Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <TeamLogo teamId={home.id} size="md" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{home.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{home.shortName}</div>
                    </div>
                  </div>

                  <span className="text-xs font-black text-slate-500 px-2">VS</span>

                  <div className="flex items-center gap-2.5 flex-1 justify-end text-right min-w-0">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{away.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{away.shortName}</div>
                    </div>
                    <TeamLogo teamId={away.id} size="md" />
                  </div>
                </div>

                {/* 4 BO3 Outcome Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { h: 2, a: 0, label: `${home.shortName} 2 - 0 ${away.shortName}` },
                    { h: 2, a: 1, label: `${home.shortName} 2 - 1 ${away.shortName}` },
                    { h: 1, a: 2, label: `${home.shortName} 1 - 2 ${away.shortName}` },
                    { h: 0, a: 2, label: `${home.shortName} 0 - 2 ${away.shortName}` }
                  ].map((opt) => {
                    const optKey = `${opt.h}-${opt.a}`;
                    const isSelected = currentSelected === optKey;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            onClearScenarioScore(m.id);
                          } else {
                            onSetScenarioScore(m.id, opt.h, opt.a);
                          }
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                          isSelected
                            ? 'bg-[#7C5CFF] text-white border-[#7C5CFF] shadow-md shadow-[#7C5CFF]/30 ring-1 ring-white/20'
                            : 'bg-[#181B24] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Reset button if overridden */}
                {override && (
                  <div className="text-right pt-0.5">
                    <button
                      type="button"
                      onClick={() => onClearScenarioScore(m.id)}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Hapus Pilihan
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
