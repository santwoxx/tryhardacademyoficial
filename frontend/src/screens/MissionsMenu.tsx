import React from 'react';
import { motion } from 'framer-motion';
import { Flag, X, CheckCircle2, Trophy } from 'lucide-react';
import { deduplicateItems } from '../lib/ui';

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: string;
  completed: boolean;
  reward: number;
}

interface MissionsMenuProps {
  showMissionsMenu: boolean;
  setShowMissionsMenu: (v: boolean) => void;
  missions: Mission[];
  currentMissionIndex: number;
  beginGameWithRotationCheck: (cb: () => void) => void;
  handleStartGame: () => void;
  requestLandscape: () => void;
}

export function MissionsMenu({
  showMissionsMenu,
  setShowMissionsMenu,
  missions,
  currentMissionIndex,
  beginGameWithRotationCheck,
  handleStartGame,
  requestLandscape,
}: MissionsMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-900/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
              <Flag className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Missões <span className="text-cyan-400">Offline</span></h2>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-1">Complete desafios para ganhar troféus</p>
            </div>
          </div>
          <button
            onClick={() => setShowMissionsMenu(false)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 max-h-[60vh] custom-scrollbar">
          {deduplicateItems(missions, (m) => `mission-menu-${m.id}`, 'MissionsMenu').map((mission, index) => (
            <div
              key={`mission-menu-${mission.id}`}
              className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                mission.completed
                  ? 'bg-green-500/5 border-green-500/20 opacity-60'
                  : index === currentMissionIndex
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,255,0.1)]'
                    : 'bg-white/5 border-white/10 grayscale opacity-40'
              }`}
            >
              {index === currentMissionIndex && !mission.completed && (
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
              )}

              <div className="flex justify-between items-start relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-black uppercase tracking-tight ${mission.completed ? 'text-green-400' : 'text-white'}`}>
                      {mission.title}
                    </h3>
                    {mission.completed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {index === currentMissionIndex && !mission.completed && (
                      <span className="px-2 py-0.5 bg-cyan-400 text-black text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Ativa</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4">{mission.description}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className={`h-full ${mission.completed ? 'bg-green-500' : 'bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.4)]'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-white italic tabular-nums">
                      {mission.current}/{mission.target}
                    </span>
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-end gap-2">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Recompensa</div>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    <Trophy className="w-4 h-4 text-[#ffea00]" />
                    <span className="text-sm font-black text-white">+{mission.reward}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-zinc-900/80 border-t border-white/10 flex justify-center">
          <button
            onClick={() => {
              setShowMissionsMenu(false);
              beginGameWithRotationCheck(() => { handleStartGame(); requestLandscape(); });
            }}
            className="bg-cyan-400 hover:bg-cyan-300 text-black px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.3)]"
          >
            Jogar Agora
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
