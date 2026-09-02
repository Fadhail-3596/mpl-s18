import React, { useState } from 'react';
import { PlayoffProbabilities, TeamId } from '../types';
import { TeamLogo } from './TeamLogo';
import { Sparkles, Grid, BarChart3, HelpCircle } from 'lucide-react';

interface ProbabilityTableProps {
  probabilities: PlayoffProbabilities[];
  onSelectTeam: (teamId: TeamId) => void;
  iterations: number;
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({
  probabilities,
  onSelectTeam,
  iterations
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'matrix'>('summary');

  return (
    <div className="bg-[#0e1424] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#0e1424] to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Playoff Probability Engine</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {iterations.toLocaleString()} Runs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monte Carlo simulated distributions across all remaining regular season matches.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'summary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'matrix'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>#1-#9 Matrix</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-thin">
        {viewMode === 'summary' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4 text-center">Playoff Chance (Top 6)</th>
                <th className="py-3 px-4 text-center text-emerald-400">Upper Bracket (#1-#2)</th>
                <th className="py-3 px-4 text-center text-blue-400">Play-in (#3-#6)</th>
                <th className="py-3 px-4 text-center text-rose-400">Eliminated (#7-#9)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {probabilities.map((item) => {
                const playoffPct = item.playoffChance;
                const upperPct = item.upperBracketChance;
                const playInPct = item.playInChance;
                const elimPct = item.eliminationChance;

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
                          <div className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {item.team.shortName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.team.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Playoff Chance Bar + % */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center gap-3 justify-center max-w-xs mx-auto">
                        <div className="w-24 sm:w-36 h-2.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              playoffPct >= 90
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : playoffPct >= 50
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                : playoffPct >= 20
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-gradient-to-r from-rose-500 to-orange-400'
                            }`}
                            style={{ width: `${playoffPct}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-sm text-slate-100 w-16 text-right">
                          {playoffPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Upper Bracket % */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-400">
                      {upperPct > 0 ? `${upperPct.toFixed(2)}%` : '<0.01%'}
                    </td>

                    {/* Play-in % */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-blue-400">
                      {playInPct > 0 ? `${playInPct.toFixed(2)}%` : '<0.01%'}
                    </td>

                    {/* Eliminated % */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-rose-400">
                      {elimPct > 0 ? `${elimPct.toFixed(2)}%` : '<0.01%'}
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
              <tr className="bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3">Team</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
                  <th
                    key={pos}
                    className={`py-3 px-2 text-center ${
                      pos <= 2 ? 'text-emerald-400' : pos <= 6 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    #{pos}
                  </th>
                ))}
                <th className="py-3 px-3 text-center text-amber-400">Playoff %</th>
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
                    // Heatmap alpha based on prob
                    const intensity = Math.min(1, prob / 40);
                    let bgStyle = 'transparent';
                    let textStyle = 'text-slate-500';

                    if (prob > 0.005) {
                      if (idx < 2) {
                        bgStyle = `rgba(16, 185, 129, ${0.15 + intensity * 0.35})`;
                        textStyle = 'text-emerald-300 font-bold';
                      } else if (idx < 6) {
                        bgStyle = `rgba(59, 130, 246, ${0.15 + intensity * 0.35})`;
                        textStyle = 'text-blue-300 font-bold';
                      } else {
                        bgStyle = `rgba(239, 68, 68, ${0.15 + intensity * 0.35})`;
                        textStyle = 'text-rose-300 font-bold';
                      }
                    }

                    return (
                      <td key={idx} className="py-2.5 px-1.5 text-center font-mono">
                        <div
                          className={`py-1 px-1 rounded transition-all text-[11px] ${textStyle}`}
                          style={{ backgroundColor: bgStyle }}
                        >
                          {prob > 0 ? `${prob.toFixed(2)}%` : '-'}
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400 text-sm">
                    {item.playoffChance.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Probabilities derived from Monte Carlo simulations using deterministic team strength + dynamic season form.
        </span>
        <span className="text-slate-500">
          Sum Axiom: Playoff + Eliminated = 100%
        </span>
      </div>
    </div>
  );
};
