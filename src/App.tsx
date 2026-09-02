import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Match, TeamStanding, PlayoffProbabilities, SimulationConfig, SimulationProgress, UserScenario, TeamId } from './types';
import { INITIAL_SCHEDULE } from './data/schedule';
import { getTeam } from './data/teams';
import { calculateStandings } from './engine/standingsEngine';
import { runMonteCarloSimulationAsync } from './engine/simulationEngine';
import { evaluateWhatIfScenario } from './engine/scenarioEngine';
import { LocalStorageService } from './storage/localStorageService';
import { SAMPLE_RESULTS_WEEK_1_TO_4 } from './data/demoPresets';

import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { MatchesPage } from './pages/MatchesPage';
import { PlayoffRacePage } from './pages/PlayoffRacePage';
import { WhatIfPanel } from './components/WhatIfPanel';
import { TeamDetailModal } from './components/TeamDetailModal';
import { BackupModal } from './components/BackupModal';
import { ValidationModal } from './components/ValidationModal';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastState {
  id: string;
  title: string;
  subtitle: string;
  type: 'success' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<ToastState | null>(null);

  // State: Matches with persistent saved results
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = LocalStorageService.loadSavedResults();
    return INITIAL_SCHEDULE.map((m) => {
      const matchResult = saved[m.id];
      if (matchResult && matchResult.homeScore !== null && matchResult.awayScore !== null) {
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

  // State: What-If Scenario Overrides & Presets
  const [scenarioOverrides, setScenarioOverrides] = useState<Record<string, [number, number]>>(() => {
    return LocalStorageService.loadScenarioOverrides();
  });
  const [savedScenarios, setSavedScenarios] = useState<UserScenario[]>(() => {
    return LocalStorageService.loadSavedScenarios();
  });

  // Simulation State
  const [simConfig] = useState<SimulationConfig>({
    iterations: 30000,
    modelType: 'dynamic_strength'
  });
  const [probabilities, setProbabilities] = useState<PlayoffProbabilities[]>([]);

  // Modals
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isValidationOpen, setIsValidationOpen] = useState<boolean>(false);

  // Calculate Real Standings
  const realStandings = useMemo(() => {
    return calculateStandings(matches);
  }, [matches]);

  // Calculate What-If Evaluation
  const { simulatedStandings, comparison } = useMemo(() => {
    return evaluateWhatIfScenario(matches, scenarioOverrides);
  }, [matches, scenarioOverrides]);

  // Execute Monte Carlo Simulation
  const triggerSimulation = useCallback((configToUse = simConfig, matchesToUse = matches, overrides = scenarioOverrides) => {
    runMonteCarloSimulationAsync(
      matchesToUse,
      overrides,
      configToUse,
      () => {},
      (results) => {
        setProbabilities(results);
      }
    );
  }, [simConfig, matches, scenarioOverrides]);

  // Initial simulation on mount and when matches/overrides change
  useEffect(() => {
    triggerSimulation(simConfig, matches, scenarioOverrides);
  }, [matches, scenarioOverrides]);

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

  // Result Management Handlers
  const handleSaveResult = (matchId: string, homeScore: number, awayScore: number) => {
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

  // Scenario Handlers
  const handleSetScenarioScore = (matchId: string, homeScore: number, awayScore: number) => {
    const updated = { ...scenarioOverrides, [matchId]: [homeScore, awayScore] as [number, number] };
    setScenarioOverrides(updated);
    LocalStorageService.saveScenarioOverrides(updated);
  };

  const handleClearScenarioScore = (matchId: string) => {
    const updated = { ...scenarioOverrides };
    delete updated[matchId];
    setScenarioOverrides(updated);
    LocalStorageService.saveScenarioOverrides(updated);
  };

  const handleResetAllOverrides = () => {
    setScenarioOverrides({});
    LocalStorageService.saveScenarioOverrides({});
    showToast('Skenario Direset', 'Semua pilihan what-if dikembalikan ke normal', 'info');
  };

  const handleSaveScenario = (name: string) => {
    const newScen: UserScenario = {
      id: `scen-${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
      overrides: { ...scenarioOverrides }
    };
    LocalStorageService.saveUserScenario(newScen);
    setSavedScenarios(LocalStorageService.loadSavedScenarios());
    showToast('Skenario Disimpan', name);
  };

  const handleLoadScenario = (scen: UserScenario) => {
    setScenarioOverrides(scen.overrides);
    LocalStorageService.saveScenarioOverrides(scen.overrides);
    showToast('Skenario Dimuat', scen.name);
  };

  const handleDeleteScenario = (id: string) => {
    LocalStorageService.deleteUserScenario(id);
    setSavedScenarios(LocalStorageService.loadSavedScenarios());
  };

  // Sample and Reset handlers
  const handleLoadSample = () => {
    SAMPLE_RESULTS_WEEK_1_TO_4.forEach((res) => {
      LocalStorageService.saveMatchResult(res.matchId, res.homeScore, res.awayScore);
    });
    setMatches(INITIAL_SCHEDULE.map((m) => {
      const matchResult = SAMPLE_RESULTS_WEEK_1_TO_4.find((r) => r.matchId === m.id);
      if (matchResult) {
        return { ...m, homeScore: matchResult.homeScore, awayScore: matchResult.awayScore, status: 'completed' as const };
      }
      return m;
    }));
    showToast('Contoh Data Dimuat', 'Hasil simulasi pekan 1-4 berhasil dimasukkan');
  };

  const handleResetAll = () => {
    LocalStorageService.clearAllData();
    setMatches(INITIAL_SCHEDULE.map((m) => ({ ...m, homeScore: null, awayScore: null, status: 'scheduled' as const })));
    setScenarioOverrides({});
    setSavedScenarios([]);
    showToast('Data Direset', 'Semua hasil manual telah dihapus', 'info');
  };

  const completedCount = matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  ).length;

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
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedMatchesCount={completedCount}
        totalMatches={72}
        scenarioOverridesCount={Object.keys(scenarioOverrides).length}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenValidator={() => setIsValidationOpen(true)}
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
            setActiveTab={setActiveTab}
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
            onSelectTeam={(tId) => setSelectedTeamId(tId)}
          />
        )}

        {/* Tab 4: What-If Mode (Simulation Sandbox) */}
        {activeTab === 'whatif' && (
          <WhatIfPanel
            allMatches={matches}
            realStandings={realStandings}
            simulatedStandings={simulatedStandings}
            comparison={comparison}
            scenarioOverrides={scenarioOverrides}
            onSetScenarioScore={handleSetScenarioScore}
            onClearScenarioScore={handleClearScenarioScore}
            onResetAllOverrides={handleResetAllOverrides}
            onSaveScenario={handleSaveScenario}
            savedScenarios={savedScenarios}
            onLoadScenario={handleLoadScenario}
            onDeleteScenario={handleDeleteScenario}
            onSelectTeam={(tId) => setSelectedTeamId(tId)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090D] py-6 px-4 text-center text-xs text-slate-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">MPL ID S18 Playoff Predictor</span>
            <span>•</span>
            <span>Regular Season 9 Weeks (72 BO3)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>9 Teams</span>
            <span>•</span>
            <span>Top 6 Qualify</span>
            <span>•</span>
            <button
              onClick={() => setIsValidationOpen(true)}
              className="text-[#00D4FF] hover:underline font-semibold"
            >
              Diagnostic Tests
            </button>
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
          setScenarioOverrides(LocalStorageService.loadScenarioOverrides());
          setSavedScenarios(LocalStorageService.loadSavedScenarios());
        }}
        onLoadSample={handleLoadSample}
        onResetAll={handleResetAll}
        completedCount={completedCount}
      />

      {/* Diagnostic Validation Modal */}
      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />

    </div>
  );
}
