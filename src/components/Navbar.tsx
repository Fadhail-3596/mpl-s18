import React, { useState } from 'react';
import { Trophy, Swords, Zap, Sliders, Settings, ShieldCheck, Download, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'matches' | 'playoff' | 'whatif';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  completedMatchesCount: number;
  totalMatches: number;
  scenarioOverridesCount: number;
  onOpenBackup: () => void;
  onOpenValidator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedMatchesCount,
  totalMatches,
  scenarioOverridesCount,
  onOpenBackup,
  onOpenValidator
}) => {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const progressPercent = Math.round((completedMatchesCount / totalMatches) * 100);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#08090D]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo & Title */}
            <div 
              className="flex items-center gap-3 cursor-pointer group select-none" 
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] via-[#5b3adb] to-[#00D4FF] p-[2px] shadow-lg shadow-[#7C5CFF]/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#11131A] rounded-[10px] flex items-center justify-center font-black text-[#00D4FF] text-base tracking-tighter">
                  S18
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-base sm:text-lg tracking-tight">
                    MPL ID S18
                  </span>
                  <span className="text-[#00D4FF] font-black text-base sm:text-lg hidden sm:inline">
                    Playoff Predictor
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 uppercase tracking-wider">
                    Regular Season
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{completedMatchesCount}/{totalMatches} Pertandingan</span>
                  <span className="text-slate-600">•</span>
                  <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden inline-block align-middle">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[#11131A] p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'matches'
                    ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>Matches</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'matches' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {completedMatchesCount}/72
                </span>
              </button>

              <button
                onClick={() => setActiveTab('playoff')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'playoff'
                    ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Playoff Race</span>
              </button>

              <button
                onClick={() => setActiveTab('whatif')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'whatif'
                    ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>What If</span>
                {scenarioOverridesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#00D4FF] text-slate-950">
                    {scenarioOverridesCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Settings & Tools Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#181B24] hover:bg-slate-800 border border-slate-700/60 hover:text-white transition-all shadow-sm"
                title="Backup, Restore & Reset Results"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090D]/95 backdrop-blur-lg border-t border-slate-800/90 py-2 px-3">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-[#00D4FF] bg-[#7C5CFF]/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
              activeTab === 'matches'
                ? 'text-[#00D4FF] bg-[#7C5CFF]/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Matches</span>
            {completedMatchesCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00D4FF]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('playoff')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'playoff'
                ? 'text-[#00D4FF] bg-[#7C5CFF]/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Playoff</span>
          </button>

          <button
            onClick={() => setActiveTab('whatif')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
              activeTab === 'whatif'
                ? 'text-[#00D4FF] bg-[#7C5CFF]/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">What If</span>
            {scenarioOverridesCount > 0 && (
              <span className="absolute top-1 right-2 px-1 rounded-full text-[9px] font-bold bg-[#00D4FF] text-slate-950">
                {scenarioOverridesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
