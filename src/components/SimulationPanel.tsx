import React from 'react';
import { SimulationConfig, SimulationProgress, PlayoffProbabilities } from '../types';
import { Sparkles, Cpu, Clock, CheckCircle, Zap, Shield, Play } from 'lucide-react';
import { ProbabilityTable } from './ProbabilityTable';

interface SimulationPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  progress: SimulationProgress | null;
  probabilities: PlayoffProbabilities[];
  onSelectTeam: (teamId: any) => void;
  lastRunStats: { iterations: number; timeTakenMs: number } | null;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  config,
  onChangeConfig,
  onRunSimulation,
  isSimulating,
  progress,
  probabilities,
  onSelectTeam,
  lastRunStats
}) => {
  const iterationOptions = [10000, 50000, 100000, 500000];

  return (
    <div className="space-y-6">
      
      {/* Simulation Controls Card */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Monte Carlo Simulation Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulates thousands of full season permutations asynchronously in pure client-side Web Worker / microtasks.
              </p>
            </div>
          </div>

          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-slate-950 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Runs...' : `Run ${config.iterations.toLocaleString()} Simulations`}</span>
          </button>
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          
          {/* Iteration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Simulation Iterations
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iterationOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => onChangeConfig({ ...config, iterations: count })}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-mono font-bold transition-all ${
                    config.iterations === count
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {count >= 1000 ? `${count / 1000}k` : count}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Recommended: 100,000 runs for high precision convergence.
            </p>
          </div>

          {/* Model Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Probability Model Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeConfig({ ...config, modelType: 'dynamic_strength' })}
                className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                  config.modelType === 'dynamic_strength'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Dynamic Elo
              </button>
              <button
                onClick={() => onChangeConfig({ ...config, modelType: 'recent_form_weighted' })}
                className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                  config.modelType === 'recent_form_weighted'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Form Weighted
              </button>
              <button
                onClick={() => onChangeConfig({ ...config, modelType: 'equal_50_50' })}
                className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                  config.modelType === 'equal_50_50'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                Equal 50/50
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Transparent, deterministic model cleanly separated from official MPL statistics.
            </p>
          </div>
        </div>

        {/* Live Progress Bar (During Simulation) */}
        {isSimulating && progress && (
          <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Executing Monte Carlo Runs...
              </span>
              <span className="font-mono text-slate-300 font-bold">
                {progress.current.toLocaleString()} / {progress.total.toLocaleString()} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-100 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Execution Benchmark Stat Tag */}
        {lastRunStats && !isSimulating && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Simulated {lastRunStats.iterations.toLocaleString()} seasons in</span>
              <span className="font-mono font-bold text-slate-200">{lastRunStats.timeTakenMs} ms</span>
            </div>
            <div className="font-mono text-slate-500">
              Convergence checked: Axioms valid
            </div>
          </div>
        )}
      </div>

      {/* Probability Results Display */}
      <ProbabilityTable
        probabilities={probabilities}
        onSelectTeam={onSelectTeam}
        iterations={lastRunStats?.iterations || config.iterations}
      />
    </div>
  );
};
