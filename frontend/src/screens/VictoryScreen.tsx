import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { CornerDecoration } from '../lib/ui';

interface VictoryScreenProps {
  setShowVictory: (v: boolean) => void;
  setGameState: (s: any) => void;
  isLevel50Victory: boolean;
}

export function VictoryScreen({ setShowVictory, setGameState, isLevel50Victory }: VictoryScreenProps) {
  return (
    <motion.div
      key="victory-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/60 border border-yellow-400/30 p-12 rounded-[2rem] w-full max-w-lg text-center backdrop-blur-md relative"
      >
        <CornerDecoration className="text-yellow-400 -inset-4 opacity-100" />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-8 bg-yellow-400/20 blur-[50px] rounded-full animate-pulse" />
            <Trophy className="w-32 h-32 text-[#ffea00] relative drop-shadow-[0_0_30px_rgba(255,234,0,0.8)]" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-[#ffea00] text-7xl font-black uppercase tracking-tighter mb-4 italic drop-shadow-[0_0_15px_rgba(255,234,0,0.5)]"
        >
          {isLevel50Victory ? 'LENDA DA ARENA' : 'VITÓRIA TOTAL'}
        </motion.h2>

        <div className="flex flex-col gap-2 mb-10">
          <p className="text-white font-black uppercase tracking-[0.5em] text-xs">Simulação Concluída com Sucesso</p>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-4 mb-12 max-w-xs mx-auto">
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="bg-[#ffea00]/10 border border-[#ffea00]/30 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(255,234,0,0.2)]"
          >
            <Trophy className="w-12 h-12 text-[#ffea00] mb-3" />
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Recompensa de Vitória</span>
            <span className="text-white font-black text-4xl italic">+{isLevel50Victory ? 50 : 25} <span className="text-[#ffea00] text-sm">TROFÉUS</span></span>
          </motion.div>
        </div>

        <button
          onClick={() => {
            setShowVictory(false);
            setGameState('menu');
          }}
          className="game-btn-primary w-full py-6 text-xl bg-yellow-400 !text-black hover:bg-yellow-300 shadow-[0_0_40px_rgba(255,234,0,0.4)]"
        >
          RETORNAR À BASE
        </button>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`v-particle-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              y: -100,
              rotate: 360,
              opacity: 0
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-2 h-2 bg-yellow-400/40 rounded-sm"
          />
        ))}
      </div>
    </motion.div>
  );
}
