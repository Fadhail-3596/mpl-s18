import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from './TeamLogo';
import { X, CheckCircle2, RotateCcw, Calendar, Clock, Trophy } from 'lucide-react';

interface ResultModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (matchId: string, homeScore: number, awayScore: number) => void;
  onDeleteResult: (matchId: string) => void;
}

type BO3Option = {
  homeScore: number;
  awayScore: number;
  label: string;
  winner: 'home' | 'away';
  subtitle: string;
};

export const ResultModal: React.FC<ResultModalProps> = ({
  match,
  isOpen,
  onClose,
  onSaveResult,
  onDeleteResult
}) => {
  const [selectedScore, setSelectedScore] = useState<string>('2-0');

  useEffect(() => {
    if (match && match.homeScore !== null && match.awayScore !== null) {
      setSelectedScore(`${match.homeScore}-${match.awayScore}`);
    } else {
      setSelectedScore('2-0');
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const homeTeam = getTeam(match.homeTeam);
  const awayTeam = getTeam(match.awayTeam);

  const options: BO3Option[] = [
    {
      homeScore: 2,
      awayScore: 0,
      label: `${homeTeam.shortName} 2 - 0 ${awayTeam.shortName}`,
      winner: 'home',
      subtitle: `${homeTeam.name} Clean Sweep`
    },
    {
      homeScore: 2,
      awayScore: 1,
      label: `${homeTeam.shortName} 2 - 1 ${awayTeam.shortName}`,
      winner: 'home',
      subtitle: `${homeTeam.name} Menang 2-1`
    },
    {
      homeScore: 1,
      awayScore: 2,
      label: `${homeTeam.shortName} 1 - 2 ${awayTeam.shortName}`,
      winner: 'away',
      subtitle: `${awayTeam.name} Menang 2-1`
    },
    {
      homeScore: 0,
      awayScore: 2,
      label: `${homeTeam.shortName} 0 - 2 ${awayTeam.shortName}`,
      winner: 'away',
      subtitle: `${awayTeam.name} Clean Sweep`
    }
  ];

  const currentOption = options.find(
    (o) => `${o.homeScore}-${o.awayScore}` === selectedScore
  ) || options[0];

  const handleSave = () => {
    const [h, a] = selectedScore.split('-').map(Number);
    onSaveResult(match.id, h, a);
    onClose();
  };

  const handleReset = () => {
    onDeleteResult(match.id);
    onClose();
  };

  const isCompleted = match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-[#11131A] border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#181B24]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
              Week {match.week}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {match.date}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {match.time} WIB
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Matchup Header Display */}
          <div className="bg-[#181B24]/90 rounded-2xl p-4 border border-slate-800/90 text-center relative overflow-hidden">
            <div className="flex items-center justify-around gap-2">
              
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <TeamLogo teamId={homeTeam.id} size="lg" />
                <div className="font-extrabold text-sm sm:text-base text-slate-100 truncate max-w-full">
                  {homeTeam.shortName}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-full">
                  {homeTeam.name}
                </div>
              </div>

              {/* Big Score Board */}
              <div className="flex flex-col items-center px-4">
                <div className="flex items-center gap-2 sm:gap-3 bg-[#08090D] px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    currentOption.homeScore > currentOption.awayScore
                      ? 'text-[#22C55E]'
                      : 'text-slate-400'
                  }`}>
                    {currentOption.homeScore}
                  </span>
                  <span className="text-slate-600 font-bold text-lg">:</span>
                  <span className={`text-2xl sm:text-3xl font-black ${
                    currentOption.awayScore > currentOption.homeScore
                      ? 'text-[#22C55E]'
                      : 'text-slate-400'
                  }`}>
                    {currentOption.awayScore}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-1.5">
                  Best of 3
                </span>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <TeamLogo teamId={awayTeam.id} size="lg" />
                <div className="font-extrabold text-sm sm:text-base text-slate-100 truncate max-w-full">
                  {awayTeam.shortName}
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-full">
                  {awayTeam.name}
                </div>
              </div>

            </div>
          </div>

          {/* 4 Large Selectable BO3 Buttons */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pilih Hasil Pertandingan (BO3)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const key = `${opt.homeScore}-${opt.awayScore}`;
                const isSelected = selectedScore === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedScore(key)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-[#7C5CFF]/15 border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/20 ring-1 ring-[#7C5CFF]'
                        : 'bg-[#181B24] border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className={`font-black text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {opt.subtitle}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#7C5CFF] border-[#7C5CFF] text-white'
                        : 'border-slate-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#181B24] flex items-center justify-between gap-3">
          {isCompleted ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus Hasil</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] hover:brightness-110 shadow-lg shadow-[#7C5CFF]/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Simpan Hasil</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
