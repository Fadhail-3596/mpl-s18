import { UserScenario, BackupData, SimulationConfig } from '../types';

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
    try {
      localStorage.setItem(STORAGE_KEYS.OVERRIDE_SCENARIOS, JSON.stringify(overrides));
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
      simIterations: 100000,
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
        return { success: false, message: 'Invalid JSON file format', resultsCount: 0 };
      }

      // Check results
      if (parsed.results && typeof parsed.results === 'object') {
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(parsed.results));
      }

      // Check scenarios
      if (Array.isArray(parsed.scenarios)) {
        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(parsed.scenarios));
      }

      // Check settings
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }

      const count = Object.keys(parsed.results || {}).length;
      return {
        success: true,
        message: `Successfully imported ${count} match results!`,
        resultsCount: count
      };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err?.message || 'Invalid JSON'}`, resultsCount: 0 };
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
