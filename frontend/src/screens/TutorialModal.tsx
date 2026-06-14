import React from 'react';
import { motion } from 'framer-motion';
import { X, Move, Target, Star, Zap, Trophy, BookOpen } from 'lucide-react';
import { deduplicateItems } from '../lib/ui';

interface TutorialModalProps {
  showTutorial: boolean;
  setShowTutorial: (v: boolean) => void;
  tutorialStep: number;
  setTutorialStep: React.Dispatch<React.SetStateAction<number>>;
  isTouch: boolean;
}

export function TutorialModal({
  showTutorial,
  setShowTutorial,
  tutorialStep,
  setTutorialStep,
  isTouch,
}: TutorialModalProps) {
  return (
    <motion.div
      key="tutorial-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-lg w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter italic">
              TUTORIAL <span className="text-purple-500">TRYHARD</span>
            </h2>
            <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-white/50 border border-white/10">
              PASSO {tutorialStep + 1} DE 6
            </div>
          </div>

          <div className="min-h-[200px] flex flex-col justify-center">
            {tutorialStep === 0 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 className="text-xl font-bold text-white mb-4">Bem-vindo à Tryhard Academy!</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Prepare-se para uma experiência intensa onde conhecimento e reflexos se encontram.
                  Vamos te ensinar o básico para você dominar a arena.
                </p>
              </motion.div>
            )}

            {tutorialStep === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                  <Move className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Movimentação</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  {isTouch ?
                    "Use o joystick no lado esquerdo da tela para mover sua nave pela arena." :
                    "Use as teclas WASD ou as setas do teclado para mover sua nave."}
                </p>
                <div className="flex gap-2">
                  {isTouch ? (
                    <div className="px-3 py-1 bg-white/5 rounded-md text-xs font-mono text-purple-400 border border-purple-500/20">JOYSTICK ESQUERDO</div>
                  ) : (
                    deduplicateItems(['W', 'A', 'S', 'D'], (k) => `tutorial-wasd-${k}`, 'TutorialWASD').map((k) => (
                      <div key={`tutorial-wasd-${k}`} className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center text-xs font-mono text-purple-400 border border-purple-500/20">{k}</div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {tutorialStep === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Mira e Disparo</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  {isTouch ?
                    "Toque e segure em qualquer lugar do lado direito da tela para atirar na direção do toque." :
                    "Use o mouse para mirar e clique (ou segure) para disparar seus projéteis."}
                </p>
                <div className="px-3 py-1 bg-white/5 rounded-md text-xs font-mono text-cyan-400 border border-cyan-500/20 inline-block">
                  {isTouch ? "TOQUE LADO DIREITO" : "MOUSE + CLIQUE"}
                </div>
              </motion.div>
            )}

            {tutorialStep === 3 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30">
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Desafio Matemático</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Colete as <span className="text-yellow-400 font-bold">Estrelas Douradas</span> para ganhar munição e bônus.
                  Ao coletar uma, um desafio matemático surgirá. Responda rápido para ganhar o bônus de combo!
                </p>
              </motion.div>
            )}

            {tutorialStep === 4 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Power-ups</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  Fique atento aos itens que aparecem na arena:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">S</div>
                    <span className="text-zinc-300">Escudo</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">R</div>
                    <span className="text-zinc-300">Tiro Rápido</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">V</div>
                    <span className="text-zinc-300">Velocidade</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">T</div>
                    <span className="text-zinc-300">Tiro Triplo</span>
                  </div>
                </div>
              </motion.div>
            )}

            {tutorialStep === 5 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                  <Trophy className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Pronto para a Batalha!</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Vença seus oponentes, suba de nível e conquiste o topo do leaderboard.
                  Boa sorte, Tryharder!
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-10 flex gap-4">
            {tutorialStep > 0 && (
              <button
                onClick={() => setTutorialStep(prev => prev - 1)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all"
              >
                VOLTAR
              </button>
            )}
            <button
              onClick={() => {
                if (tutorialStep < 5) {
                  setTutorialStep(prev => prev + 1);
                } else {
                  setShowTutorial(false);
                  setTutorialStep(0);
                }
              }}
              className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition-all"
            >
              {tutorialStep === 5 ? "COMEÇAR AGORA" : "PRÓXIMO"}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setShowTutorial(false);
            setTutorialStep(0);
          }}
          className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    </motion.div>
  );
}
