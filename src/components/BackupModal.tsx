import React, { useState, useRef } from 'react';
import { X, Download, Upload, Trash2, CheckCircle2, AlertCircle, RotateCcw, Database, Sparkles, Settings } from 'lucide-react';
import { LocalStorageService } from '../storage/localStorageService';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
  onLoadSample: () => void;
  onResetAll: () => void;
  completedCount: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  onLoadSample,
  onResetAll,
  completedCount
}) => {
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonString = LocalStorageService.exportAllData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mpl-id-s18-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = LocalStorageService.importData(content);
        setImportStatus(result);
        if (result.success) {
          onDataImported();
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    onResetAll();
    setIsConfirmingReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#11131A] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/20 text-[#00D4FF] flex items-center justify-center border border-[#7C5CFF]/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Pengaturan Data & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Data tersimpan aman di browser (LocalStorage)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181B24] hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5">
          
          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                importStatus.success
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-800/50 text-red-300'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Reset Confirmation Dialog */}
          {isConfirmingReset ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 space-y-3 animate-in fade-in">
              <div className="text-sm font-bold text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Yakin ingin mereset semua hasil?</span>
              </div>
              <p className="text-xs text-red-200/80">
                Semua hasil pertandingan yang telah dimasukkan secara manual akan dihapus dan dikembalikan ke awal musim.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsConfirmingReset(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/40 transition-all"
                >
                  Reset Semua
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sample Data Button */}
              <div className="p-3.5 bg-[#181B24] rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200">Gunakan Template Hasil Week 1–3</div>
                  <div className="text-[11px] text-slate-400">Otomatis isi 24 pertandingan realistis Pekan 1–3 ke LocalStorage</div>
                </div>
                <button
                  onClick={() => {
                    onLoadSample();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shrink-0 transition-all cursor-pointer"
                >
                  Gunakan Template
                </button>
              </div>

              {/* Export JSON Button */}
              <div className="p-3.5 bg-[#181B24] rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200">Ekspor File Backup (JSON)</div>
                  <div className="text-[11px] text-slate-400">Unduh data hasil pertandingan Anda</div>
                </div>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#00D4FF] bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 border border-[#00D4FF]/30 flex items-center gap-1.5 shrink-0 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor</span>
                </button>
              </div>

              {/* Import JSON Button */}
              <div className="p-3.5 bg-[#181B24] rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-200">Impor File Backup (JSON)</div>
                  <div className="text-[11px] text-slate-400">Pulihkan hasil dari file JSON</div>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Impor</span>
                  </button>
                </div>
              </div>

              {/* Reset Option */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsConfirmingReset(true)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Hasil Pertandingan ({completedCount} Tersimpan)</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
