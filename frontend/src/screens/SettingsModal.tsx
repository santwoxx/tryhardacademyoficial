import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, X, User, Trophy, Volume2, VolumeX, Move, Maximize2, ChevronRight, ShieldCheck, Download } from 'lucide-react';
import { deduplicateItems } from '../lib/ui';

type GraphicQuality = 'low' | 'medium' | 'high';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  nickname: string;
  trophies: number;
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  quality: GraphicQuality;
  setQuality: (v: GraphicQuality) => void;
  setIsCustomizingHUD: (v: boolean) => void;
  saveSettings: () => void;
  setShowPrivacyPolicy: (v: boolean) => void;
  handleInstallClick: () => void;
  handleLogout: () => void;
}

export function SettingsModal({
  showSettings,
  setShowSettings,
  nickname,
  trophies,
  isMuted,
  setIsMuted,
  quality,
  setQuality,
  setIsCustomizingHUD,
  saveSettings,
  setShowPrivacyPolicy,
  handleInstallClick,
  handleLogout,
}: SettingsModalProps) {
  return (
    <motion.div
      key="settings-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3"
      onClick={() => setShowSettings(false)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-zinc-900/95 to-black/95 border border-white/10 rounded-2xl w-full max-w-[17rem] sm:max-w-xs shadow-[0_0_60px_rgba(188,19,254,0.15)] overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#bc13fe]/20 blur-[60px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#bc13fe]/20 border border-[#bc13fe]/30 flex items-center justify-center">
              <SettingsIcon size={14} className="text-[#bc13fe]" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Ajustes</h2>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative p-3 space-y-1.5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Nickname */}
          <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-3 py-2.5 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-3.5 h-3.5 text-[#bc13fe] shrink-0" />
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Nick</span>
            </div>
            <span className="text-xs font-black text-white tracking-wider truncate ml-2">{nickname || '...'}</span>
          </div>

          {/* Trophies */}
          <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-3 py-2.5 transition-colors">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[#ffea00]" />
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Troféus</span>
            </div>
            <span className="text-xs font-black text-white tracking-wider tabular-nums">{trophies}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-3 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isMuted
                ? <VolumeX className="w-3.5 h-3.5 text-red-500" />
                : <Volume2 className="w-3.5 h-3.5 text-[#00f2ff]" />}
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Áudio</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
              isMuted
                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                : 'bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/20'
            }`}>
              {isMuted ? 'Mudo' : 'On'}
            </span>
          </button>

          {/* Quality */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Qualidade</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {deduplicateItems(['low', 'medium', 'high'] as GraphicQuality[], (q) => `quality-opt-${q}`, 'GraphicQualityOptions').map((q) => (
                <button
                  key={`quality-opt-${q}`}
                  onClick={() => setQuality(q)}
                  className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                    quality === q
                      ? 'bg-[#bc13fe] border-[#bc13fe] text-white shadow-[0_0_12px_rgba(188,19,254,0.4)]'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
                >
                  {q === 'low' ? 'Baixo' : q === 'medium' ? 'Méd' : 'Alto'}
                </button>
              ))}
            </div>
          </div>

          {/* HUD Customizer */}
          <button
            onClick={() => {
              setShowSettings(false);
              setIsCustomizingHUD(true);
            }}
            className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-3 py-2.5 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Move className="w-3.5 h-3.5 text-[#00f2ff] group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">HUD Mobile</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
          </button>

          {/* Save (primary) */}
          <button
            onClick={saveSettings}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#bc13fe] to-[#8a00ff] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(188,19,254,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Salvar Alterações
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 mt-1 border-t border-white/5">
            <button
              onClick={() => {
                setShowSettings(false);
                setShowPrivacyPolicy(true);
              }}
              className="py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white/50 hover:text-white/80 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3 h-3" />
              Privacidade
            </button>
            <button
              onClick={handleInstallClick}
              className="py-2 bg-cyan-500/[0.08] hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3 h-3" />
              Instalar
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/[0.08] hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <X className="w-3 h-3" />
            Sair da Conta
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
