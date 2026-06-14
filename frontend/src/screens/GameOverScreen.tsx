import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Zap, Target, Timer, Trophy, ArrowLeft } from 'lucide-react';
import { CornerDecoration } from '../lib/ui';

interface GameOverScreenProps {
  showGameOver: boolean;
  setShowGameOver: (v: boolean) => void;
  setShowMatchIntro: (v: boolean) => void;
  setGameState: (s: any) => void;
  stats: { kills: number };
  survivalTime: number;
  highScore: number;
  handleRestart: () => void;
}

export function GameOverScreen({
  showGameOver,
  setShowGameOver,
  setShowMatchIntro,
  setGameState,
  stats,
  survivalTime,
  highScore,
  handleRestart,
}: GameOverScreenProps) {
  return (
    <motion.div
      key="game-over-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-3 md:p-4 overflow-y-auto"
      onClick={() => { setShowGameOver(false); setShowMatchIntro(false); setGameState('menu'); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm md:max-w-md landscape:max-w-lg bg-gradient-to-b from-red-950/30 via-black/85 to-black/95 border-2 border-red-500/30 rounded-3xl landscape:rounded-2xl p-5 md:p-6 landscape:p-4 text-center shadow-[0_0_80px_rgba(239,68,68,0.25)] overflow-hidden my-auto"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <CornerDecoration className="text-red-500/60 -inset-2" />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="relative mx-auto mb-3 md:mb-4 landscape:mb-2 w-16 h-16 md:w-20 md:h-20 landscape:w-14 landscape:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.6)] border-2 border-red-400/50"
        >
          <Heart className="w-7 h-7 md:w-9 md:h-9 landscape:w-7 landscape:h-7 text-white fill-white" strokeWidth={0} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-black">
            <X className="w-3 h-3 text-black font-black" strokeWidth={4} />
          </div>
        </motion.div>

        <div className="inline-block px-3 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[8px] landscape:text-[9px] font-black uppercase tracking-[0.3em] mb-2 landscape:mb-1 rounded-full">
          Sinal de Vida Perdido
        </div>

        <h2 className="text-red-500 text-4xl md:text-5xl landscape:text-3xl font-black uppercase tracking-tighter italic mb-1 landscape:mb-0 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)] leading-none">
          GAME <span className="text-white">OVER</span>
        </h2>

        <div className="my-3 md:my-4 landscape:my-2 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 landscape:w-3.5 landscape:h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs landscape:text-[10px] font-black uppercase tracking-widest text-yellow-400">+{stats.kills * 25 + survivalTime * 2} XP</span>
          <div className="flex-1 max-w-[80px] h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.kills * 25 + survivalTime * 2) / 5)}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-[#bc13fe]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-2 landscape:gap-2 mb-4 md:mb-5 landscape:mb-3">
          {[
            { label: 'Elims', val: stats.kills, icon: Target, color: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-400', border: 'border-cyan-500/20' },
            { label: 'Tempo', val: `${survivalTime}s`, icon: Timer, color: 'from-yellow-500/20 to-yellow-500/5', iconColor: 'text-yellow-400', border: 'border-yellow-500/20' },
            { label: 'Recorde', val: highScore, icon: Trophy, color: 'from-[#bc13fe]/20 to-[#bc13fe]/5', iconColor: 'text-[#bc13fe]', border: 'border-[#bc13fe]/20' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`relative bg-gradient-to-b ${stat.color} border ${stat.border} rounded-xl landscape:rounded-lg p-2.5 landscape:p-2 flex flex-col items-center gap-0.5 landscape:gap-0 backdrop-blur-sm`}
            >
              <stat.icon className={`w-4 h-4 landscape:w-3.5 landscape:h-3.5 ${stat.iconColor}`} />
              <span className="text-[8px] landscape:text-[7px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
              <span className="text-lg landscape:text-base font-black text-white italic tabular-nums leading-none">{stat.val}</span>
            </motion.div>
          ))}
        </div>

        {stats.kills > 0 && stats.kills >= highScore && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mb-3 landscape:mb-2 mx-auto inline-block px-3 py-1 bg-gradient-to-r from-[#bc13fe] to-pink-500 text-white text-[9px] landscape:text-[8px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(188,19,254,0.5)]"
          >
            ⭐ Novo Recorde!
          </motion.div>
        )}

        <div className="flex flex-col gap-2 landscape:gap-1.5">
          <button
            onClick={handleRestart}
            className="w-full py-3.5 landscape:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm landscape:text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-400/50"
          >
            <Zap className="w-4 h-4 fill-white" />
            REINICIAR
          </button>
          <button
            onClick={() => {
              setShowGameOver(false);
              setGameState('menu');
            }}
            className="w-full py-2.5 landscape:py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white rounded-xl text-[10px] landscape:text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar ao Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
