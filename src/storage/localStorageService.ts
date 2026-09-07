import { UserScenario, BackupData, SimulationConfig } from '../types';
import { isValidBO3Score } from '../engine/scoreValidator';
import { DEFAULT_SIMULATION_ITERATIONS } from '../data/rules';

const STORAGE_KEYS = {
  RESULTS: 'mpl_s18_results',
  SCENARIOS: 'mpl_s18_scenarios',
  SETTINGS: 'mpl_s18_settings',
  ACTIVE_SCENARIO: 'mpl_s18_active_scenario',
  OVERRIDE_SCENARIOS: 'mpl_s18_overrides',
  STARTED: 'mpl_s18_app_started'
};

export interface MatchScoreRecord {
  homeScore: number;
  awayScore: number;
  updatedAt?: string;
}

export const LocalStorageService = {
  // Results
  getMatchResults(): Record<string, MatchScoreRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to parse match results from localStorage', e);
      return {};
    }
  },

  loadSavedResults(): Record<string, MatchScoreRecord> {
    return this.getMatchResults();
  },

  saveMatchResult(matchId: string, homeScore: number, awayScore: number): Record<string, MatchScoreRecord> {
    if (!isValidBO3Score(homeScore, awayScore)) {
      console.warn(`[LocalStorageService] Refusing to save invalid BO3 score: ${homeScore}-${awayScore} for match ${matchId}`);
      return this.getMatchResults();
    }
    const current = this.getMatchResults();
    current[matchId] = {
      homeScore,
      awayScore,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save match result to localStorage', e);
    }
    return current;
  },

  deleteMatchResult(matchId: string): Record<string, MatchScoreRecord> {
    const current = this.getMatchResults();
    delete current[matchId];
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(current));
    } catch (e) {
      console.error('Failed to delete match result from localStorage', e);
    }
    return current;
  },

  clearAllMatchResults(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.RESULTS);
    } catch (e) {
      console.error('Failed to clear match results from localStorage', e);
    }
  },

  // Overrides
  loadScenarioOverrides(): Record<string, [number, number]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OVERRIDE_SCENARIOS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveScenarioOverrides(overrides: Record<string, [number, number]>): void {
    const cleanOverrides: Record<string, [number, number]> = {};
    for (const [id, score] of Object.entries(overrides)) {
      if (Array.isArray(score) && isValidBO3Score(score[0], score[1])) {
        cleanOverrides[id] = [score[0], score[1]];
      }
    }
    try {
      localStorage.setItem(STORAGE_KEYS.OVERRIDE_SCENARIOS, JSON.stringify(cleanOverrides));
    } catch (e) {
      console.error('Failed to save scenario overrides to localStorage', e);
    }
  },

  // Scenarios
  getSavedScenarios(): UserScenario[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse scenarios from localStorage', e);
      return [];
    }
  },

  loadSavedScenarios(): UserScenario[] {
    return this.getSavedScenarios();
  },

  saveUserScenario(scenario: UserScenario): void {
    const scenarios = this.getSavedScenarios().filter((s) => s.id !== scenario.id);
    scenarios.push(scenario);
    try {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    } catch (e) {
      console.error('Failed to save scenario to localStorage', e);
    }
  },

  saveScenario(name: string, overrides: Record<string, [number, number]>): UserScenario {
    const scenarios = this.getSavedScenarios();
    const newScenario: UserScenario = {
      id: 'scen_' + Date.now(),
      name: name || `Scenario ${scenarios.length + 1}`,
      updatedAt: new Date().toISOString(),
      overrides
    };
    scenarios.push(newScenario);
    try {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    } catch (e) {
      console.error('Failed to save scenario to localStorage', e);
    }
    return newScenario;
  },

  deleteUserScenario(id: string): UserScenario[] {
    let scenarios = this.getSavedScenarios();
    scenarios = scenarios.filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    } catch (e) {
      console.error('Failed to delete scenario from localStorage', e);
    }
    return scenarios;
  },

  deleteScenario(id: string): UserScenario[] {
    return this.deleteUserScenario(id);
  },

  // Settings
  getSettings(): { simIterations: number; modelType: SimulationConfig['modelType'] } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return {
      simIterations: DEFAULT_SIMULATION_ITERATIONS,
      modelType: 'dynamic_strength'
    };
  },

  saveSettings(settings: { simIterations: number; modelType: SimulationConfig['modelType'] }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  // Export / Import
  exportAllData(): string {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      results: this.getMatchResults(),
      scenarios: this.getSavedScenarios(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string): { success: boolean; message: string; resultsCount: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Format file JSON tidak valid.', resultsCount: 0 };
      }

      // Validate results format & score validity
      const validatedResults: Record<string, MatchScoreRecord> = {};
      if (parsed.results) {
        if (typeof parsed.results !== 'object') {
          return { success: false, message: 'Data hasil pertandingan di file JSON rusak.', resultsCount: 0 };
        }
        for (const [matchId, val] of Object.entries(parsed.results)) {
          if (!val || typeof val !== 'object') {
            return { success: false, message: `Data skor untuk match ${matchId} tidak valid.`, resultsCount: 0 };
          }
          const item = val as any;
          if (!isValidBO3Score(item.homeScore, item.awayScore)) {
            return {
              success: false,
              message: `Skor tidak valid (${item.homeScore}-${item.awayScore}) untuk match ${matchId}. Hanya skor BO3 (2-0, 2-1, 1-2, 0-2) yang diizinkan.`,
              resultsCount: 0
            };
          }
          validatedResults[matchId] = {
            homeScore: item.homeScore,
            awayScore: item.awayScore,
            updatedAt: item.updatedAt || new Date().toISOString()
          };
        }
      }

      // Validate scenarios
      const validatedScenarios: UserScenario[] = [];
      if (Array.isArray(parsed.scenarios)) {
        for (const scen of parsed.scenarios) {
          if (scen && typeof scen === 'object' && scen.id && scen.name) {
            const cleanOverrides: Record<string, [number, number]> = {};
            if (scen.overrides && typeof scen.overrides === 'object') {
              for (const [mId, scr] of Object.entries(scen.overrides)) {
                if (Array.isArray(scr) && isValidBO3Score(scr[0], scr[1])) {
                  cleanOverrides[mId] = [scr[0], scr[1]];
                }
              }
            }
            validatedScenarios.push({
              id: String(scen.id),
              name: String(scen.name),
              updatedAt: scen.updatedAt || new Date().toISOString(),
              overrides: cleanOverrides
            });
          }
        }
      }

      // Check settings
      let validatedSettings = this.getSettings();
      if (parsed.settings && typeof parsed.settings === 'object') {
        if (typeof parsed.settings.simIterations === 'number' && parsed.settings.simIterations > 0) {
          validatedSettings.simIterations = parsed.settings.simIterations;
        }
        if (parsed.settings.modelType) {
          validatedSettings.modelType = parsed.settings.modelType;
        }
      }

      // Safe write only after complete validation passes
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(validatedResults));
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(validatedScenarios));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(validatedSettings));

      const count = Object.keys(validatedResults).length;
      return {
        success: true,
        message: `Berhasil mengimpor ${count} data hasil pertandingan resmi!`,
        resultsCount: count
      };
    } catch (err: any) {
      return { success: false, message: `Gagal membaca file: ${err?.message || 'JSON tidak valid'}`, resultsCount: 0 };
    }
  },

  isAppStarted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.STARTED) === 'true';
    } catch {
      return false;
    }
  },

  setAppStarted(started: boolean): void {
    try {
      if (started) {
        localStorage.setItem(STORAGE_KEYS.STARTED, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.STARTED);
      }
    } catch (e) {
      console.error('Failed to set app started state', e);
    }
  },

  clearAllData(): void {
    this.resetAllData();
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.RESULTS);
      localStorage.removeItem(STORAGE_KEYS.SCENARIOS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SCENARIO);
      localStorage.removeItem(STORAGE_KEYS.OVERRIDE_SCENARIOS);
      localStorage.removeItem(STORAGE_KEYS.STARTED);
    } catch (e) {
      console.error('Failed to reset all data', e);
    }
  }
};
