import React from 'react';
import { TeamStanding, TeamId } from '../types';
import { getZoneByRank } from '../data/rules';
import { TeamLogo } from './TeamLogo';
import { Info, Sparkles, ChevronRight } from 'lucide-react';

interface StandingsTableProps {
  standings: TeamStanding[];
  onSelectTeam: (teamId: TeamId) => void;
  compact?: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  onSelectTeam,
  compact = false
}) => {
  const getStatusBadge = (status: TeamStanding['qualificationStatus']) => {
    switch (status) {
      case 'CLINCHED_UPPER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
            UPPER BRACKET
          </span>
        );
      case 'QUALIFIED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
            QUALIFIED
          </span>
        );
      case 'ON_THE_BUBBLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
            ON BUBBLE
          </span>
        );
      case 'MUST_WIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/40 tracking-wider">
            MUST WIN
          </span>
        );
      case 'ELIMINATED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 tracking-wider">
            ELIMINATED
          </span>
        );
      case 'ALIVE':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 tracking-wider">
            IN CONTENTION
          </span>
        );
    }
  };

  return (
    <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header with Title and Zone Legend */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-[#181B24] via-[#11131A] to-[#181B24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>Klasemen MPL ID S18 Regular Season</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Urutan: 1. Match Wins • 2. Game Difference (Net Game Win) • 3. Head-to-Head • 4. Game Win
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span>Upper Bracket (#1 - #2)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
            <span>Playoff (#3 - #6)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            <span>Eliminasi (#7 - #9)</span>
          </div>
        </div>
      </div>

      {/* Simplified Standings Table Format */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0D0F14] text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4 min-w-[180px]">Team</th>
              <th className="py-3 px-3 text-center font-bold text-white">W - L</th>
              <th className="py-3 px-3 text-center font-bold text-[#00D4FF]">Game Diff</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">Form (Last 5)</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-2 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
            {standings.map((row) => {
              const isUpper = row.rank <= 2;
              const isPlayoff = row.rank > 2 && row.rank <= 6;
              const isDiffPositive = row.gameDifference > 0;
              const isDiffZero = row.gameDifference === 0;

              return (
                <tr
                  key={row.teamId}
                  onClick={() => onSelectTeam(row.teamId)}
                  className={`hover:bg-[#181B24]/90 transition-all cursor-pointer group relative ${
                    row.rank === 2 ? 'border-b-2 border-b-emerald-500/40' : ''
                  } ${row.rank === 6 ? 'border-b-2 border-b-cyan-500/40' : ''}`}
                >
                  {/* Rank with colored edge indicator */}
                  <td className="py-3.5 px-3 text-center font-black relative">
                    <div className="flex items-center justify-center">
                      <span className={`text-sm sm:text-base font-black ${
                        isUpper ? 'text-emerald-400' : isPlayoff ? 'text-cyan-400' : 'text-slate-400'
                      }`}>
                        {row.rank}
                      </span>
                    </div>
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isUpper ? 'bg-emerald-500' : isPlayoff ? 'bg-cyan-500' : 'bg-rose-500/60'
                      }`}
                    />
                  </td>

                  {/* Team (Logo + Short Name + Official Name) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <TeamLogo teamId={row.teamId} size="md" />
                      <div className="min-w-0">
                        <div className="font-black text-white text-sm sm:text-base flex items-center gap-1.5 group-hover:text-[#00D4FF] transition-colors">
                          <span>{row.team.shortName}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 tracking-wider truncate uppercase">
                          {row.team.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Match W - L */}
                  <td className="py-3.5 px-3 text-center font-mono font-black text-sm sm:text-base text-slate-100">
                    <span className="text-emerald-400">{row.matchWins}</span>
                    <span className="text-slate-600 mx-1.5">-</span>
                    <span className="text-rose-400">{row.matchLosses}</span>
                  </td>

                  {/* Game Difference */}
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-black text-xs sm:text-sm ${
                        isDiffPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                          : isDiffZero
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                      }`}
                    >
                      {isDiffPositive ? `+${row.gameDifference}` : row.gameDifference}
                    </span>
                  </td>

                  {/* Form (Last 5) */}
                  <td className="py-3.5 px-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.length === 0 ? (
                        <span className="text-slate-600 text-xs font-mono">-</span>
                      ) : (
                        row.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                              res === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {res}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Playoff Status */}
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(row.qualificationStatus)}
                  </td>

                  {/* Detail link arrow */}
                  <td className="py-3.5 px-2 text-center text-slate-600 group-hover:text-slate-300 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#0D0F14] border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Klik baris tim untuk melihat riwayat Head-to-Head, jadwal sisa, dan simulasi skenario lolos playoff.
        </span>
        <span className="text-slate-500 font-mono">
          Total: 72 Match Regular Season (16 Match / Tim)
        </span>
      </div>

    </div>
  );
};
