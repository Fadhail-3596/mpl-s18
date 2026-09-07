import React, { useState } from 'react';
import { TeamStanding, PlayoffProbabilities, TeamId, Match, SimulationConfig } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { 
  Trophy, 
  Zap, 
  BarChart3, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ProbabilityTable } from '../components/ProbabilityTable';
import { analyzeQualifications } from '../engine/qualificationEngine';
import { DEFAULT_SIMULATION_ITERATIONS } from '../data/rules';

interface PlayoffRacePageProps {
  standings: TeamStanding[];
  probabilities: PlayoffProbabilities[];
  allMatches?: Match[];
  onSelectTeam: (teamId: TeamId) => void;
  onRunSimulation?: (customConfig?: SimulationConfig) => void;
  isSimulating?: boolean;
  simConfig?: SimulationConfig;
  onUpdateSimConfig?: (config: SimulationConfig) => void;
  lastRunStats?: { iterations: number; timeTakenMs: number } | null;
  simProgress?: { current: number; total: number; percentage: number } | null;
}

export const PlayoffRacePage: React.FC<PlayoffRacePageProps> = ({
  standings,
  probabilities,
  allMatches = [],
  onSelectTeam,
  onRunSimulation,
  isSimulating = false,
  simConfig = { iterations: DEFAULT_SIMULATION_ITERATIONS, modelType: 'dynamic_strength', homeAdvantage: 0, variance: 0.15 },
  onUpdateSimConfig,
  lastRunStats,
  simProgress
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'table'>('board');
  const totalIterations = simConfig?.iterations || DEFAULT_SIMULATION_ITERATIONS;

  const upperBracket = standings.slice(0, 2);
  const playIn = standings.slice(2, 6);
  const eliminated = standings.slice(6, 9);
  const qualificationMap = analyzeQualifications(allMatches);

  const getStatusBadge = (prob?: PlayoffProbabilities, qual?: any) => {
    if (qual?.isEliminated) {
      return {
        label: 'Tereliminasi',
        color: 'text-slate-400',
        badge: 'bg-slate-800 border-slate-700',
        dot: 'bg-slate-500'
      };
    }
    if (qual?.clinchedUpperBracket) {
      return {
        label: 'Upper Bracket (Terkunci)',
        color: 'text-emerald-400',
        badge: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }
    if (qual?.clinchedPlayoff) {
      return {
        label: 'Lolos Playoff (Terkunci)',
        color: 'text-emerald-400',
        badge: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }

    const chance = prob ? prob.playoffChance : 0;
    if (chance >= 75) {
      return {
        label: 'Strong Position',
        color: 'text-emerald-400',
        badge: 'bg-emerald-500/15 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    }
    if (chance >= 35) {
      return {
        label: 'Contested',
        color: 'text-amber-400',
        badge: 'bg-amber-500/15 border-amber-500/30',
        dot: 'bg-amber-400'
      };
    }
    if (chance >= 10) {
      return {
        label: 'Danger',
        color: 'text-orange-400',
        badge: 'bg-orange-500/15 border-orange-500/30',
        dot: 'bg-orange-400'
      };
    }
    return {
      label: 'Almost Eliminated',
      color: 'text-red-400',
      badge: 'bg-red-500/15 border-red-500/30',
      dot: 'bg-red-500'
    };
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C5CFF]/15 text-[#00D4FF] border border-[#7C5CFF]/30 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>PERSAINGAN TIKET PLAYOFF</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Peta & Peluang Persaingan Playoff (Playoff Race)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top 6 Lolos ke Playoff • Rank #1–#2 Upper Bracket • Rank #7–#9 Tersingkir. Dihitung otomatis dari hasil klasemen dan jadwal pertandingan sisa.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {onRunSimulation && (
              <button
                onClick={() => onRunSimulation(simConfig)}
                disabled={isSimulating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] text-white shadow-lg shadow-[#7C5CFF]/25 hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? `Menghitung (${simProgress?.percentage || 0}%)...` : 'Hitung Ulang Peluang'}</span>
              </button>
            )}
            
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {lastRunStats
                  ? `Simulasi selesai: ${lastRunStats.iterations.toLocaleString('id-ID')} iterasi (${lastRunStats.timeTakenMs} ms)`
                  : `Estimasi berbasis ${totalIterations.toLocaleString('id-ID')} simulasi`}
              </span>
            </div>
          </div>
        </div>

        {/* Unobtrusive explanation banner */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Rank #1 - #2: <strong>Upper Bracket</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Rank #3 - #6: <strong>Play-in Playoff</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span>Rank #7 - #9: <strong>Gugur di Regular Season</strong></span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Peluang adalah estimasi probabilistik berdasarkan {totalIterations.toLocaleString('id-ID')} simulasi Monte Carlo.</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#11131A] rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'board'
              ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Papan Kualifikasi & Kartu Peluang</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Tabel Peluang Lengkap & Matriks</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'board' ? (
        <div className="space-y-6">
          {/* Visual Tier Classification */}
          <div className="bg-[#11131A] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#181B24] flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>Peta Kualifikasi Saat Ini</span>
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Klik tim untuk melihat detail peluang & analisis sisa musim
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              
              {/* Upper Bracket Tier (#1 - #2) */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/20 via-[#11131A] to-[#11131A]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-extrabold text-xs sm:text-sm text-emerald-400 uppercase tracking-wider">
                      Zona Upper Bracket (#1 - #2)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Lolos Semifinal Playoff
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upperBracket.map((st) => {
                    const prob = probabilities.find((p) => p.teamId === st.teamId);
                    return (
                      <div
                        key={st.teamId}
                        onClick={() => onSelectTeam(st.teamId)}
                        className="bg-[#181B24] hover:bg-slate-800/90 p-3.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer flex items-center justify-between group"
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
                            Playoff: {prob ? `${prob.playoffChance.toFixed(1)}%` : '-'}
                          </div>
                          <div className="text-[10px] text-sky-400 font-mono">
                            Upper: {prob ? `${prob.upperBracketChance.toFixed(1)}%` : '-'}
                          </div>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <span className="font-extrabold text-xs sm:text-sm text-sky-400 uppercase tracking-wider">
                      Zona Play-in Playoff (#3 - #6)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Lolos Babak Play-in
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playIn.map((st) => {
                    const prob = probabilities.find((p) => p.teamId === st.teamId);
                    return (
                      <div
                        key={st.teamId}
                        onClick={() => onSelectTeam(st.teamId)}
                        className="bg-[#181B24] hover:bg-slate-800/90 p-3.5 rounded-xl border border-sky-500/30 hover:border-sky-500/60 transition-all cursor-pointer flex items-center justify-between group"
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
                            Playoff: {prob ? `${prob.playoffChance.toFixed(1)}%` : '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Upper: {prob ? `${prob.upperBracketChance.toFixed(1)}%` : '-'}
                          </div>
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
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="font-extrabold text-xs sm:text-sm text-red-400 uppercase tracking-wider">
                      Zona Gugur (#7 - #9)
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
                        className="bg-[#181B24] hover:bg-slate-800/90 p-3.5 rounded-xl border border-red-900/30 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-between group"
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
                            Gugur: {prob ? `${prob.eliminationChance.toFixed(1)}%` : '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Playoff: {prob ? `${prob.playoffChance.toFixed(1)}%` : '-'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Detailed 9 Team Probability Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>Rincian Peluang Playoff, Upper & Gugur Per Tim</span>
              </h2>
              <span className="text-xs text-slate-500">
                Klik kartu untuk membuka profil & riwayat tim
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {standings.map((st) => {
                const prob = probabilities.find((p) => p.teamId === st.teamId);
                const chance = prob ? prob.playoffChance : 0;
                const upper = prob ? prob.upperBracketChance : 0;
                const elim = prob ? prob.eliminationChance : 0;
                const qAnalysis = qualificationMap[st.teamId];
                const badge = getStatusBadge(prob, qAnalysis);

                return (
                  <div
                    key={st.teamId}
                    onClick={() => onSelectTeam(st.teamId)}
                    className="bg-[#11131A] hover:bg-[#181B24] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Team Header */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <TeamLogo teamId={st.teamId} size="lg" />
                          <div className="min-w-0">
                            <div className="font-extrabold text-base text-white group-hover:text-[#00D4FF] transition-colors truncate">
                              {st.team.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              #{st.rank} • {st.matchWins}W - {st.matchLosses}L ({st.gameDifference > 0 ? `+${st.gameDifference}` : st.gameDifference})
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${badge.badge} ${badge.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* 3 Main Odds Boxes */}
                      <div className="grid grid-cols-3 gap-2 py-3.5 text-center">
                        <div className="bg-[#181B24]/90 p-2.5 rounded-xl border border-emerald-500/20">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Playoff</div>
                          <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                            {chance.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-[#181B24]/90 p-2.5 rounded-xl border border-sky-500/20">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Upper</div>
                          <div className="text-base font-black text-sky-400 font-mono mt-0.5">
                            {upper.toFixed(1)}%
                          </div>
                        </div>

                        <div className="bg-[#181B24]/90 p-2.5 rounded-xl border border-red-500/20">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Gugur</div>
                          <div className="text-base font-black text-red-400 font-mono mt-0.5">
                            {elim.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Mathematical Status Info */}
                      <div className="py-1.5 px-3 rounded-lg bg-[#181B24]/60 border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between mb-2">
                        <span>Status Matematis:</span>
                        <span className="font-bold text-slate-200">
                          {qAnalysis?.clinchedPlayoff ? (
                            <span className="text-emerald-400">Lolos Playoff</span>
                          ) : qAnalysis?.isEliminated ? (
                            <span className="text-red-400">Gugur Matematis</span>
                          ) : (
                            <span className="text-slate-300">Peluang Terbuka (ALIVE)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Rentang Posisi: #{st.bestPossibleRank} - #{st.worstPossibleRank}</span>
                      <span className="text-[#00D4FF] group-hover:translate-x-0.5 transition-transform flex items-center">
                        Lihat Profil <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Full Probability & Position Matrix Table */
        <ProbabilityTable
          probabilities={probabilities}
          standings={standings}
          allMatches={allMatches}
          onSelectTeam={onSelectTeam}
          iterations={100000}
        />
      )}

    </div>
  );
};
