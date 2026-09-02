import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { runSelfValidationTests, ValidationReport } from '../engine/engineValidator';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const rep = await runSelfValidationTests();
      setReport(rep);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0e1424] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[85vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Engine Invariant Validation Report</span>
                {report && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    report.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {report.passed ? 'ALL CHECKS PASSED' : 'ISSUES DETECTED'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Automated verification of schedule topology, tiebreaker rules, and probability axioms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all disabled:opacity-50"
              title="Rerun diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="my-5 space-y-3">
          {isRunning ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              Running comprehensive calculation engine diagnostics...
            </div>
          ) : report ? (
            report.checks.map((check, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
                  check.passed
                    ? 'bg-[#12192c] border-slate-800'
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                      {check.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {check.details}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
