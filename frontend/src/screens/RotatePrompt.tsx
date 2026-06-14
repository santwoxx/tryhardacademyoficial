import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, RotateCcw } from 'lucide-react';
import { CornerDecoration } from '../lib/ui';

interface RotatePromptProps {
  setShowRotatePrompt: (v: boolean) => void;
  pendingStartAction: (() => void) | null;
  setPendingStartAction: (v: (() => void) | null) => void;
}

export function RotatePrompt({ setShowRotatePrompt, pendingStartAction, setPendingStartAction }: RotatePromptProps) {
  const dismiss = (cb?: () => void) => {
    setShowRotatePrompt(false);
    if (cb) cb();
    if (pendingStartAction) {
      pendingStartAction();
      setPendingStartAction(null);
    }
  };

  return (
    <motion.div
      key="rotate-prompt"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="bg-gradient-to-b from-cyan-500/10 to-[#bc13fe]/10 border border-cyan-400/40 p-6 md:p-8 rounded-[2rem] w-full max-w-sm text-center backdrop-blur-xl relative shadow-[0_0_60px_rgba(0,242,255,0.25)]"
      >
        <CornerDecoration className="text-cyan-400 -inset-4 opacity-100" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="relative mx-auto mb-6 w-24 h-24">
          <motion.div
            animate={{ rotate: [0, 90, 90, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.5, 0.9, 1] }}
            className="w-full h-full flex items-center justify-center"
          >
            <Smartphone className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(0,242,255,0.6)]" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
          />
        </div>

        <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">
          Modo Paisagem
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic mb-3 leading-tight">
          Vire o celular na <span className="text-cyan-400">horizontal</span>
        </h2>

        <p className="text-white/60 text-sm font-medium mb-6 leading-relaxed">
          O TryHard Academy foi feito para ser jogado em tela deitada. Incline o aparelho para iniciar.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => dismiss()}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3.5 rounded-2xl text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.4)] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Virei! Começar
          </button>
          <button
            onClick={() => dismiss()}
            className="w-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 font-bold py-2.5 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all"
          >
            Jogar de qualquer jeito
          </button>
        </div>

        <p className="text-white/30 text-[9px] uppercase tracking-widest mt-4 font-bold">
          O jogo detecta automaticamente quando você virar
        </p>
      </motion.div>
    </motion.div>
  );
}
