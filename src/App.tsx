import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Match, TeamStanding, PlayoffProbabilities, SimulationConfig, SimulationProgress, TeamId } from './types';
import { INITIAL_SCHEDULE } from './data/schedule';
import { getTeam } from './data/teams';
import { calculateStandings } from './engine/standingsEngine';
import { runMonteCarloSimulationAsync } from './engine/simulationEngine';
import { LocalStorageService } from './storage/localStorageService';
import { SAMPLE_MID_SEASON_RESULTS } from './data/demoPresets';
import { DEFAULT_SIMULATION_ITERATIONS } from './data/rules';
import { isValidBO3Score, isCompletedMatch } from './engine/scoreValidator';

import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { MatchesPage } from './pages/MatchesPage';
import { PlayoffRacePage } from './pages/PlayoffRacePage';
import { TeamDetailModal } from './components/TeamDetailModal';
import { BackupModal } from './components/BackupModal';
import { InitialStateLanding } from './components/InitialStateLanding';
import { CheckCircle2, X } from 'lucide-react';

interface ToastState {
  id: string;
  title: string;
  subtitle: string;
  type: 'success' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<ToastState | null>(null);

  // App initialization state
  const [isStarted, setIsStarted] = useState<boolean>(() => {
    return LocalStorageService.isAppStarted();
  });

  // Scroll to top whenever route/tab or start state changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab, isStarted]);

  // Tab navigation handler ensuring scroll to top on every navigation click
  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // State: Matches with persistent saved results
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = LocalStorageService.loadSavedResults();
    return INITIAL_SCHEDULE.map((m) => {
      const matchResult = saved[m.id];
      if (matchResult && isValidBO3Score(matchResult.homeScore, matchResult.awayScore)) {
        return {
          ...m,
          homeScore: matchResult.homeScore,
          awayScore: matchResult.awayScore,
          status: 'completed' as const
        };
      }
      return m;
    });
  });

  // Simulation State: aligned with DEFAULT_SIMULATION_ITERATIONS and saved settings
  const [simConfig, setSimConfig] = useState<SimulationConfig>(() => {
    const saved = LocalStorageService.getSettings();
    return {
      iterations: saved.simIterations || DEFAULT_SIMULATION_ITERATIONS,
      modelType: saved.modelType || 'dynamic_strength',
      homeAdvantage: 0,
      variance: 0.15
    };
  });
  const [probabilities, setProbabilities] = useState<PlayoffProbabilities[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<SimulationProgress | null>(null);
  const [lastRunStats, setLastRunStats] = useState<{ iterations: number; timeTakenMs: number } | null>(null);

  // Modals
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // Calculate Real Standings
  const realStandings = useMemo(() => {
    return calculateStandings(matches);
  }, [matches]);

  const completedCount = useMemo(() => {
    return matches.filter((m) => isCompletedMatch(m)).length;
  }, [matches]);

  // Execute Monte Carlo Simulation with full progress tracking
  const handleRunSimulation = useCallback((configToUse = simConfig, matchesToUse = matches) => {
    const numCompleted = matchesToUse.filter((m) => isCompletedMatch(m)).length;
    if (numCompleted === 0) {
      setProbabilities([]);
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setSimProgress({ current: 0, total: configToUse.iterations, percentage: 0, isRunning: true });

    runMonteCarloSimulationAsync(
      matchesToUse,
      {},
      configToUse,
      (progress) => {
        setSimProgress(progress);
      },
      (results, stats) => {
        setProbabilities(results);
        setIsSimulating(false);
        setSimProgress(null);
        if (stats) {
          setLastRunStats(stats);
        }
      }
    );
  }, [simConfig, matches]);

  // Run simulation when matches change and at least 1 match is completed
  useEffect(() => {
    if (completedCount === 0) {
      setProbabilities([]);
      setIsSimulating(false);
      return;
    }
    handleRunSimulation(simConfig, matches);
  }, [matches, completedCount]);

  // Show Toast Feedback
  const showToast = (title: string, subtitle: string, type: 'success' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      title,
      subtitle,
      type
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initial screen selection handlers
  const handleSelectManual = () => {
    LocalStorageService.setAppStarted(true);
    setIsStarted(true);
    setActiveTab('dashboard');
    showToast('Mode Manual Aktif', 'Mulai dari data kosong. Masukkan hasil pertandingan di tab Matches.', 'info');
  };

  const handleSelectTemplate = () => {
    LocalStorageService.setAppStarted(true);
    Object.entries(SAMPLE_MID_SEASON_RESULTS).forEach(([matchId, res]) => {
      LocalStorageService.saveMatchResult(matchId, res.homeScore, res.awayScore);
    });
    setMatches(
      INITIAL_SCHEDULE.map((m) => {
        const matchResult = SAMPLE_MID_SEASON_RESULTS[m.id];
        if (matchResult) {
          return {
            ...m,
            homeScore: matchResult.homeScore,
            awayScore: matchResult.awayScore,
            status: 'completed' as const
          };
        }
        return m;
      })
    );
    setIsStarted(true);
    setActiveTab('dashboard');
    showToast('Template Week 1–4 Dimuat', '32 hasil aktual resmi Pekan 1–4 berhasil dimuat');
  };

  // Result Management Handlers
  const handleSaveResult = (matchId: string, homeScore: number, awayScore: number) => {
    if (!isValidBO3Score(homeScore, awayScore)) {
      showToast('Skor Tidak Valid', 'Format BO3 hanya mengizinkan skor 2-0, 2-1, 1-2, atau 0-2.', 'info');
      return;
    }

    const match = matches.find((m) => m.id === matchId);
    if (match) {
      const home = getTeam(match.homeTeam);
      const away = getTeam(match.awayTeam);
      showToast(
        'Hasil Disimpan',
        `${home.shortName} ${homeScore} - ${awayScore} ${away.shortName}`
      );
    }

    LocalStorageService.saveMatchResult(matchId, homeScore, awayScore);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, homeScore, awayScore, status: 'completed' as const }
          : m
      )
    );
  };

  const handleDeleteResult = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      const home = getTeam(match.homeTeam);
      const away = getTeam(match.awayTeam);
      showToast('Hasil Dihapus', `${home.shortName} vs ${away.shortName} dikembalikan ke Terjadwal`, 'info');
    }

    LocalStorageService.deleteMatchResult(matchId);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, homeScore: null, awayScore: null, status: 'scheduled' as const }
          : m
      )
    );
  };

  // Sample and Reset handlers
  const handleLoadSample = () => {
    handleSelectTemplate();
  };

  const handleResetAll = () => {
    LocalStorageService.resetAllData();
    setMatches(INITIAL_SCHEDULE);
    setProbabilities([]);
    setIsStarted(false);
    showToast('Data Direset', 'Semua data telah dihapus. Kembali ke tampilan awal.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col font-sans selection:bg-[#7C5CFF] selection:text-white">
      
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-[#181B24] border border-emerald-500/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 pr-8 relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white">{toast.title}</div>
              <div className="text-xs text-emerald-400 font-bold font-mono">{toast.subtitle}</div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Conditional Rendering: Initial State Landing vs Active App */}
      {!isStarted ? (
        <InitialStateLanding
          onSelectManual={handleSelectManual}
          onSelectTemplate={handleSelectTemplate}
        />
      ) : (
        <>
          {/* Navigation Header */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            completedMatchesCount={completedCount}
            totalMatches={72}
            onOpenBackup={() => setIsBackupOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6">
            
            {/* Tab 1: Dashboard (Home) */}
            {activeTab === 'dashboard' && (
              <DashboardPage
                standings={realStandings}
                probabilities={probabilities}
                allMatches={matches}
                onSaveResult={handleSaveResult}
                onDeleteResult={handleDeleteResult}
                onSelectTeam={(tId) => setSelectedTeamId(tId)}
                setActiveTab={handleTabChange}
                onLoadSample={handleLoadSample}
                onOpenSettings={() => setIsBackupOpen(true)}
              />
            )}

            {/* Tab 2: Matches (Match Center) */}
            {activeTab === 'matches' && (
              <MatchesPage
                allMatches={matches}
                onSaveResult={handleSaveResult}
                onDeleteResult={handleDeleteResult}
              />
            )}

            {/* Tab 3: Playoff Race (Qualification Board) */}
            {activeTab === 'playoff' && (
              <PlayoffRacePage
                standings={realStandings}
                probabilities={probabilities}
                allMatches={matches}
                onSelectTeam={(tId) => setSelectedTeamId(tId)}
                onRunSimulation={(customCfg) => handleRunSimulation(customCfg || simConfig)}
                isSimulating={isSimulating}
                simConfig={simConfig}
                onUpdateSimConfig={(newCfg) => setSimConfig(newCfg)}
                lastRunStats={lastRunStats}
                simProgress={simProgress}
              />
            )}

          </main>

          {/* Footer: Hak Cipta & Karya Moh. Fadhailurrahman */}
          <footer className="border-t border-slate-800/80 bg-[#0A0C12] py-6 px-4 text-xs text-slate-400 mb-14 md:mb-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-slate-200">MPL ID S18 Playoff Predictor</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400">Regular Season 9 Weeks (72 BO3)</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400">9 Teams</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-semibold">Top 6 Qualify</span>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-center">
                <span className="text-slate-400 font-medium">Karya:</span>
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#7C5CFF]/15 to-[#00D4FF]/15 border border-[#7C5CFF]/30 font-bold text-slate-200">
                  Kingdom Baik
                </span>
              </div>

            </div>
          </footer>

          {/* Team Detail Modal */}
          {selectedTeamId && (
            <TeamDetailModal
              teamId={selectedTeamId}
              onClose={() => setSelectedTeamId(null)}
              standing={realStandings.find((s) => s.teamId === selectedTeamId)}
              probabilities={probabilities.find((p) => p.teamId === selectedTeamId)}
              allMatches={matches}
            />
          )}

          {/* Backup / Export / Import / Reset Modal */}
          <BackupModal
            isOpen={isBackupOpen}
            onClose={() => setIsBackupOpen(false)}
            onDataImported={() => {
              const saved = LocalStorageService.loadSavedResults();
              setMatches(INITIAL_SCHEDULE.map((m) => {
                const matchResult = saved[m.id];
                if (matchResult && matchResult.homeScore !== null && matchResult.awayScore !== null) {
                  return { ...m, homeScore: matchResult.homeScore, awayScore: matchResult.awayScore, status: 'completed' as const };
                }
                return m;
              }));
              setIsStarted(true);
            }}
            onLoadSample={handleLoadSample}
            onResetAll={handleResetAll}
            completedCount={completedCount}
          />
        </>
      )}

    </div>
  );
}

