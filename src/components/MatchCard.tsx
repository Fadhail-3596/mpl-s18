import React, { useState } from 'react';
import { Match, TeamId } from '../types';
import { getTeam } from '../data/teams';
import { TeamLogo } from './TeamLogo';
import { Check, Edit2, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';
import { calculateMatchProbability } from '../engine/probabilityEngine';
import { isValidBO3Score } from '../engine/scoreValidator';

interface MatchCardProps {
  match: Match;
  onSaveResult: (matchId: string, homeScore: number, awayScore: number) => void;
  onDeleteResult: (matchId: string) => void;
  scenarioScore?: [number, number] | null;
  onSetScenarioScore?: (matchId: string, homeScore: number, awayScore: number) => void;
  onClearScenarioScore?: (matchId: string) => void;
  isScenarioMode?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onSaveResult,
  onDeleteResult,
  scenarioScore,
  onSetScenarioScore,
  onClearScenarioScore,
  isScenarioMode = false
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customHome, setCustomHome] = useState<number>(2);
  const [customAway, setCustomAway] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const homeTeam = getTeam(match.homeTeam);
  const awayTeam = getTeam(match.awayTeam);

  // Match probability preview
  const odds = calculateMatchProbability(match.homeTeam, match.awayTeam);

  const hasRealResult = match.homeScore !== null && match.awayScore !== null;
  const hasScenarioOverride = scenarioScore !== undefined && scenarioScore !== null;

  const currentHomeScore = hasScenarioOverride ? scenarioScore[0] : match.homeScore;
  const currentAwayScore = hasScenarioOverride ? scenarioScore[1] : match.awayScore;
  const isCompletedOrOverridden = currentHomeScore !== null && currentAwayScore !== null;

  const handleQuickScore = (h: number, a: number) => {
    if (isScenarioMode && onSetScenarioScore) {
      onSetScenarioScore(match.id, h, a);
    } else {
      onSaveResult(match.id, h, a);
    }
    setIsEditingCustom(false);
    setErrorMsg(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate BO3 score
    if (!isValidBO3Score(customHome, customAway)) {
      setErrorMsg('Skor BO3 tidak valid. Harus 2-0, 2-1, 1-2, atau 0-2.');
      return;
    }

    if (isScenarioMode && onSetScenarioScore) {
      onSetScenarioScore(match.id, customHome, customAway);
    } else {
      onSaveResult(match.id, customHome, customAway);
    }
    setIsEditingCustom(false);
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (hasScenarioOverride && onClearScenarioScore) {
      onClearScenarioScore(match.id);
    } else if (hasRealResult) {
      onDeleteResult(match.id);
    }
    setIsEditingCustom(false);
  };

  return (
    <div
      className={`bg-[#0d1322] border rounded-xl overflow-hidden transition-all duration-200 shadow-md ${
        hasScenarioOverride
          ? 'border-amber-500/60 ring-1 ring-amber-500/30 bg-gradient-to-b from-[#161a29] to-[#0d1322]'
          : hasRealResult
          ? 'border-slate-700/80'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">W{match.week} • M{match.id.split('-m')[1]}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {match.date}
          </span>
          <span className="flex items-center gap-1 hidden sm:inline-flex">
            <Clock className="w-3 h-3 text-slate-500" />
            {match.time} WIB
          </span>
        </div>

        <div>
          {hasScenarioOverride ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              What-If Pick
            </span>
          ) : hasRealResult ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Completed
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              BO3 Scheduled
            </span>
          )}
        </div>
      </div>

      {/* Main Teams & Score Area */}
      <div className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <TeamLogo teamId={homeTeam.id} size="match" />
            <div className="min-w-0">
              <div className={`font-bold text-sm truncate ${
                isCompletedOrOverridden && currentHomeScore! > currentAwayScore!
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-100'
              }`}>
                {homeTeam.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Est: {(odds.homeWinProbability * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Score Box */}
          <div className="shrink-0 flex items-center justify-center px-2">
            {isCompletedOrOverridden && !isEditingCustom ? (
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 font-mono font-black text-base sm:text-lg shadow-inner">
                <span className={currentHomeScore! > currentAwayScore! ? 'text-amber-400' : 'text-slate-300'}>
                  {currentHomeScore}
                </span>
                <span className="text-slate-600">-</span>
                <span className={currentAwayScore! > currentHomeScore! ? 'text-amber-400' : 'text-slate-300'}>
                  {currentAwayScore}
                </span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 bg-slate-900/50 rounded border border-slate-800">
                VS
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center justify-end gap-2.5 min-w-0 text-right">
            <div className="min-w-0">
              <div className={`font-bold text-sm truncate ${
                isCompletedOrOverridden && currentAwayScore! > currentHomeScore!
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-100'
              }`}>
                {awayTeam.name}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Est: {(odds.awayWinProbability * 100).toFixed(0)}%
              </div>
            </div>
            <TeamLogo teamId={awayTeam.id} size="match" />
          </div>
        </div>

        {/* Custom Input Form (if toggled) */}
        {isEditingCustom ? (
          <form onSubmit={handleCustomSubmit} className="mt-3.5 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold">{homeTeam.shortName}</span>
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={customHome}
                  onChange={(e) => setCustomHome(parseInt(e.target.value) || 0)}
                  className="w-12 text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-slate-500">-</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="2"
                  value={customAway}
                  onChange={(e) => setCustomAway(parseInt(e.target.value) || 0)}
                  className="w-12 text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400 font-bold">{awayTeam.shortName}</span>
              </div>
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCustom(false)}
                className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>
            {errorMsg && (
              <p className="text-[11px] text-rose-400 text-center mt-1">{errorMsg}</p>
            )}
          </form>
        ) : (
          /* Quick Score Action Buttons */
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            
            {/* Quick 1-click BO3 Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Set:</span>
              <button
                onClick={() => handleQuickScore(2, 0)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  currentHomeScore === 2 && currentAwayScore === 0
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`${homeTeam.shortName} 2-0 ${awayTeam.shortName}`}
              >
                2 - 0
              </button>
              <button
                onClick={() => handleQuickScore(2, 1)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  currentHomeScore === 2 && currentAwayScore === 1
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`${homeTeam.shortName} 2-1 ${awayTeam.shortName}`}
              >
                2 - 1
              </button>
              <button
                onClick={() => handleQuickScore(1, 2)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  currentHomeScore === 1 && currentAwayScore === 2
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`${homeTeam.shortName} 1-2 ${awayTeam.shortName}`}
              >
                1 - 2
              </button>
              <button
                onClick={() => handleQuickScore(0, 2)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                  currentHomeScore === 0 && currentAwayScore === 2
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={`${homeTeam.shortName} 0-2 ${awayTeam.shortName}`}
              >
                0 - 2
              </button>
            </div>

            {/* Edit / Clear Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setIsEditingCustom(true)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Edit score manually"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {isCompletedOrOverridden && (
                <button
                  onClick={handleClear}
                  className="p-1 rounded text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                  title="Clear match score"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
