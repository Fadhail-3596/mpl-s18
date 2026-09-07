import React, { useState } from 'react';
import { Edit3, Sparkles, Trophy, ArrowRight, ShieldAlert, Check, X } from 'lucide-react';

interface InitialStateLandingProps {
  onSelectManual: () => void;
  onSelectTemplate: () => void;
}

export const InitialStateLanding: React.FC<InitialStateLandingProps> = ({
  onSelectManual,
  onSelectTemplate
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleConfirmTemplate = () => {
    setShowConfirmModal(false);
    onSelectTemplate();
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-[#7C5CFF] selection:text-white relative">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#11131A] border border-slate-700/80 p-2.5 flex items-center justify-center shadow-xl shadow-[#7C5CFF]/15">
            <img 
              src="/LOGO_MPL-ID-NEW-2024-400.png" 
              alt="Logo MPL ID" 
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/mpl-id-logo.svg') {
                  target.src = '/mpl-id-logo.svg';
                }
              }}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#7C5CFF]/15 text-[#00D4FF] border border-[#7C5CFF]/30 tracking-wider uppercase">
              <Trophy className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>MPL INDONESIA SEASON 18</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
              MPL ID S18 PLAYOFF PREDICTOR
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium">
              Masukkan hasil pertandingan untuk mulai menghitung klasemen dan peluang playoff.
            </p>
          </div>
        </div>

        {/* Two Main Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left pt-2">
          
          {/* Option 1: Manual Input */}
          <div 
            onClick={onSelectManual}
            className="group relative bg-[#11131A] hover:bg-[#151822] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#7C5CFF]/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-slate-300 group-hover:text-white group-hover:bg-[#7C5CFF]/20 group-hover:border group-hover:border-[#7C5CFF]/40 flex items-center justify-center transition-all">
                <Edit3 className="w-6 h-6" />
              </div>
              
              <div>
                <h2 className="text-lg font-black text-white group-hover:text-[#00D4FF] transition-colors">
                  INPUT MANUAL
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Mulai dari data kosong (0 pertandingan selesai). Anda dapat memasukkan hasil pertandingan satu per satu sesuai pekan yang berjalan.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#181B24] group-hover:bg-[#7C5CFF] text-slate-200 group-hover:text-white border border-slate-700/80 group-hover:border-[#7C5CFF] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Mulai Input Manual</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Option 2: Use Template Week 1–4 */}
          <div 
            onClick={() => setShowConfirmModal(true)}
            className="group relative bg-[#11131A] hover:bg-[#151822] border border-[#7C5CFF]/40 hover:border-[#7C5CFF] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl shadow-[#7C5CFF]/10 hover:shadow-[#7C5CFF]/20"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/20 text-[#00D4FF] border border-[#7C5CFF]/40 flex items-center justify-center transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider uppercase">
                  Data Aktual Week 1–4
                </span>
              </div>
              
              <div>
                <h2 className="text-lg font-black text-white group-hover:text-[#00D4FF] transition-colors">
                  GUNAKAN TEMPLATE WEEK 1–4
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Mengisi seluruh 32 hasil pertandingan resmi Week 1 sampai Week 4 yang telah selesai. Tersisa 40 pertandingan untuk disimulasikan.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#7C5CFF] to-[#6040e6] text-white border border-[#7C5CFF]/50 flex items-center justify-center gap-2 shadow-lg shadow-[#7C5CFF]/30 group-hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Gunakan Template Week 1–4</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Informative Note */}
        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Data tersimpan secara lokal di browser Anda (LocalStorage) dan dapat direset kapan saja.</span>
        </div>

      </div>

      {/* Confirmation Dialog for Template Week 1-4 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-[#11131A] border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 text-[#00D4FF] border border-[#7C5CFF]/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">
                Gunakan hasil pertandingan resmi Week 1–4?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Aplikasi akan memasukkan seluruh 32 hasil pertandingan resmi Week 1 sampai Week 4 ke dalam klasemen dan kalkulator. Sebanyak 40 sisa pertandingan akan tetap kosong untuk disimulasikan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmTemplate}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7C5CFF] to-[#00D4FF] hover:brightness-110 shadow-lg shadow-[#7C5CFF]/25 transition-all cursor-pointer"
              >
                TERAPKAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
