import React, { useState } from 'react';
import { PlayoffProbabilities, TeamId, TeamStanding } from '../types';
import { TeamLogo } from './TeamLogo';
import { Sparkles, Grid, BarChart3, HelpCircle, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { analyzeQualifications } from '../engine/qualificationEngine';

interface ProbabilityTableProps {
  probabilities: PlayoffProbabilities[];
  standings: TeamStanding[];
  allMatches?: any[];
  onSelectTeam: (teamId: TeamId) => void;
  iterations?: number;
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({
  probabilities,
  standings,
  allMatches = [],
  onSelectTeam,
  iterations = 100000
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'matrix'>('summary');
  const qualificationMap = analyzeQualifications(allMatches);

  // Helper for simple status labels
  const getStatusBadge = (prob: PlayoffProbabilities, qual?: any) => {
    if (qual?.isEliminated) {
      return {
        label: 'Tereliminasi',
        color: 'text-slate-400',
        bg: 'bg-slate-800 border-slate-700',
        dot: 'bg-slate-500'
      };
    }
    if (qual?.clinchedUpperBracket) {
      return {
        label: 'Upper Bracket (Terkunci)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }
    if (qual?.clinchedPlayoff) {
      return {
        label: 'Lolos Playoff (Terkunci)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }

    const chance = prob.playoffChance;
    if (chance >= 75) {
      return {
        label: 'Strong Position',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }
    if (chance >= 35) {
      return {
        label: 'Contested',
        color: 'text-amber-400',
        bg: 'bg-amber-500/15 border-amber-500/30',
        dot: 'bg-amber-400'
      };
    }
    if (chance >= 10) {
      return {
        label: 'Danger',
        color: 'text-orange-400',
        bg: 'bg-orange-500/15 border-orange-500/30',
        dot: 'bg-orange-400'
      };
    }
    return {
      label: 'Almost Eliminated',
      color: 'text-red-400',
      bg: 'bg-red-500/15 border-red-500/30',
      dot: 'bg-red-500'
    };
  };

  return (
    <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#181B24]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
              <span>Tabel Peluang Playoff & Kualifikasi</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Peluang dihitung berdasarkan 100.000 simulasi sisa pertandingan Regular Season MPL ID.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-[#11131A] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'summary'
                ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Ringkasan Odds</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-[#7C5CFF]/25 text-[#00D4FF] border border-[#7C5CFF]/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Distribusi Posisi (#1-#9)</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-thin">
        {viewMode === 'summary' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141722] text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Tim</th>
                <th className="py-3 px-4 text-center">Playoff Chance (Top 6)</th>
                <th className="py-3 px-4 text-center text-emerald-400">Upper Bracket (#1-#2)</th>
                <th className="py-3 px-4 text-center text-sky-400">Play-in (#3-#6)</th>
                <th className="py-3 px-4 text-center text-red-400">Elimination (#7-#9)</th>
                <th className="py-3 px-4 text-center">Status Kompetisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {probabilities.map((item) => {
                const playoffPct = item.playoffChance;
                const upperPct = item.upperBracketChance;
                const playInPct = item.playInChance;
                const elimPct = item.eliminationChance;
                const qAnalysis = qualificationMap[item.teamId];
                const statusMeta = getStatusBadge(item, qAnalysis);

                return (
                  <tr
                    key={item.teamId}
                    onClick={() => onSelectTeam(item.teamId)}
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo teamId={item.teamId} size="md" />
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-[#00D4FF] transition-colors">
                            {item.team.shortName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
                            {item.team.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Playoff Chance Bar + % */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center gap-3 justify-center max-w-xs mx-auto">
                        <div className="w-20 sm:w-28 h-2.5 bg-slate-900 rounded-full overflow-hidden shrink-0 border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              playoffPct >= 75
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : playoffPct >= 35
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : playoffPct >= 10
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                : 'bg-gradient-to-r from-rose-600 to-red-500'
                            }`}
                            style={{ width: `${Math.max(playoffPct, 2)}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-sm text-white w-16 text-right">
                          {playoffPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Upper Bracket % */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {upperPct.toFixed(1)}%
                    </td>

                    {/* Play-in % */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sky-400">
                      {playInPct.toFixed(1)}%
                    </td>

                    {/* Eliminated % */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-red-400">
                      {elimPct.toFixed(1)}%
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.bg} ${statusMeta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        <span>{statusMeta.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Matrix View: P(#1) to P(#9) */
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141722] text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3">Tim</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
                  <th
                    key={pos}
                    className={`py-3 px-2 text-center font-black ${
                      pos <= 2 ? 'text-emerald-400' : pos <= 6 ? 'text-sky-400' : 'text-red-400'
                    }`}
                  >
                    #{pos}
                  </th>
                ))}
                <th className="py-3 px-3 text-center text-[#00D4FF]">Playoff %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {probabilities.map((item) => (
                <tr
                  key={item.teamId}
                  onClick={() => onSelectTeam(item.teamId)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-bold text-slate-100 flex items-center gap-2">
                    <TeamLogo teamId={item.teamId} size="sm" />
                    <span>{item.team.shortName}</span>
                  </td>

                  {item.positionProbabilities.map((prob, idx) => {
                    const intensity = Math.min(1, prob / 40);
                    let bgStyle = 'transparent';
                    let textStyle = 'text-slate-600';

                    if (prob > 0.005) {
                      if (idx < 2) {
                        bgStyle = `rgba(16, 185, 129, ${0.15 + intensity * 0.4})`;
                        textStyle = 'text-emerald-300 font-bold';
                      } else if (idx < 6) {
                        bgStyle = `rgba(14, 165, 233, ${0.15 + intensity * 0.4})`;
                        textStyle = 'text-sky-300 font-bold';
                      } else {
                        bgStyle = `rgba(239, 68, 68, ${0.15 + intensity * 0.4})`;
                        textStyle = 'text-red-300 font-bold';
                      }
                    }

                    return (
                      <td key={idx} className="py-2.5 px-1 text-center font-mono">
                        <div
                          className={`py-1 px-1 rounded transition-all text-[11px] ${textStyle}`}
                          style={{ backgroundColor: bgStyle }}
                        >
                          {prob > 0 ? `${prob.toFixed(1)}%` : '-'}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3 px-3 text-center font-mono font-black text-[#00D4FF] text-sm">
                    {item.playoffChance.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-[#141722] border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>Peluang adalah estimasi berdasarkan 100.000 simulasi seluruh sisa pertandingan MPL ID S18.</span>
        </span>
        <span className="text-slate-400 font-mono">
          Top 2: Upper Bracket • Top 6: Playoff • 7-9: Gugur
        </span>
      </div>
    </div>
  );
};
