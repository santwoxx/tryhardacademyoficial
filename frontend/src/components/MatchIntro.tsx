import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '../game/audio';

interface MatchIntroProps {
  isMultiplayer: boolean;
  isMobile: boolean;
  isLandscape: boolean;
  onDismiss: () => void;
  loadingProgress?: number;
}

const TIPS = [
  { icon: '🎮', title: 'Movimento', desc: 'Use WASD ou o joystick esquerdo para navegar pela arena' },
  { icon: '🎯', title: 'Disparo', desc: 'Clique/touch no lado direito da tela para atirar nos inimigos' },
  { icon: '⭐', title: 'Estrelas XP', desc: 'Colete estrelas para ganhar munição e pontos de experiência' },
  { icon: '❓', title: 'Perguntas', desc: 'Ao atirar, responda perguntas corretamente para acertar o alvo' },
  { icon: '🛡️', title: 'Power-ups', desc: 'Escudo, tiro triplo, velocidade e mais aparecem na arena' },
  { icon: '🏆', title: 'Vidas', desc: 'Você tem 3 vidas. Errar perguntas ou ser atingido custa uma vida' },
];

const PHONE_TIPS = [
  '📱 Gire o celular para DEITADO (modo paisagem) para melhor experiência',
  '🎮 Use o joystick esquerdo para andar, direito para atirar',
  '⚡ Toque no botão de tiro no canto inferior direito',
];

export const MatchIntro: React.FC<MatchIntroProps> = ({
  isMultiplayer,
  isMobile,
  isLandscape,
  onDismiss,
  loadingProgress = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'tips' | 'loading' | 'exit'>('enter');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }[] = [];
    let animId: number;

    const spawnBurst = () => {
      const cx = canvas.width / 2 + (Math.random() - 0.5) * canvas.width;
      const cy = canvas.height / 2 + (Math.random() - 0.5) * canvas.height;
      const colors = ['#00f2ff', '#bc13fe', '#ffea00', '#ff4d00', '#00ff88'];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const speed = 0.5 + Math.random() * 1;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 80 + Math.random() * 60,
        });
      }
    };

    let burstTimer = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      burstTimer++;
      if (burstTimer % 20 === 0) spawnBurst();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life++;
        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  const playedIntroRef = useRef(false);
  useEffect(() => {
    if (!playedIntroRef.current) {
      playedIntroRef.current = true;
      audioManager.playSound('match_intro');
    }
  }, []);

  const milestonesRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    for (const m of milestones) {
      if (loadingProgress >= m && !milestonesRef.current.has(m)) {
        milestonesRef.current.add(m);
        audioManager.playSound('countdown_tick');
      }
    }
  }, [loadingProgress]);

  useEffect(() => {
    if (phase === 'enter') {
      timerRef.current = setTimeout(() => setPhase('tips'), 800);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'tips') return;
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % (isMobile ? PHONE_TIPS.length : TIPS.length));
    }, 3500);
    return () => clearInterval(tipInterval);
  }, [phase, isMobile]);

  useEffect(() => {
    if (loadingProgress >= 100 && phase !== 'exit') {
      setPhase('exit');
      setTimeout(onDismiss, 600);
    }
  }, [loadingProgress, phase, onDismiss]);

  const handleSkip = () => {
    setPhase('exit');
    setTimeout(onDismiss, 400);
  };

  const tips = isMobile ? PHONE_TIPS : TIPS;
  const currentTip = tips[currentTipIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] pointer-events-auto overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-scanline opacity-[0.03] animate-scanline" />

      {/* Top-left title */}
      <div className="absolute top-8 left-8 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] font-black text-green-400/80 uppercase tracking-[0.3em]">Sistema Iniciado</span>
        </motion.div>
      </div>

      {/* Top-right info */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[9px] font-mono text-white/20"
        >
          {isMultiplayer ? 'MODO MULTIPLAYER' : 'MODO TREINAMENTO'}
        </motion.span>
      </div>

      {/* Center Content */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-lg px-6">
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
            <span className="bg-gradient-to-r from-[#00f2ff] to-[#bc13fe] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,242,255,0.3)]">
              TRYHARD
            </span>
            <span className="text-white ml-2">ARENA</span>
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-3"
          />
        </motion.div>

        {/* Game Tips Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-start gap-4">
              {isMobile ? (
                <div className="text-3xl flex-shrink-0">{(currentTip as string).split(' ')[0]}</div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-2xl">
                  {(currentTip as any).icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {!isMobile && (
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                    {(currentTip as any).title}
                  </h3>
                )}
                <p className={`${isMobile ? 'text-base' : 'text-sm'} text-white/70 leading-relaxed`}>
                  {isMobile ? (currentTip as string) : (currentTip as any).desc}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile: Orientation prompt */}
        {isMobile && !isLandscape && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 flex flex-col items-center gap-3"
          >
            <div className="text-4xl animate-bounce">📱</div>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 90, 90, 0] }}
                transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                className="w-12 h-8 border-2 border-amber-400 rounded-md flex items-center justify-center"
              >
                <div className="w-6 h-4 bg-amber-400/30 rounded-sm" />
              </motion.div>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl"
              >
                ➡️
              </motion.span>
              <motion.div
                animate={{ rotate: [0, -90, -90, 0] }}
                transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                className="w-12 h-8 border-2 border-amber-400 rounded-md flex items-center justify-center"
              >
                <div className="w-6 h-4 bg-amber-400/30 rounded-sm" />
              </motion.div>
            </div>
            <p className="text-amber-300/90 text-sm font-bold text-center">
              Gire o celular para o modo <span className="text-amber-300 uppercase">DEITADO</span> para melhor jogabilidade
            </p>
          </motion.div>
        )}

        {/* Loading Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
              Carregando Arena
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {Math.round(loadingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00f2ff] via-[#bc13fe] to-[#00f2ff] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(5, loadingProgress)}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
              style={{ boxShadow: '0 0 12px rgba(0,242,255,0.4)' }}
            />
          </div>
        </motion.div>

        {/* Tip counter dots */}
        <div className="flex gap-1.5 mt-5">
          {(isMobile ? PHONE_TIPS : TIPS).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === currentTipIndex ? 1.3 : 1,
                opacity: i === currentTipIndex ? 1 : 0.3,
                backgroundColor: i === currentTipIndex ? '#00f2ff' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.3 }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleSkip}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-white/40 hover:text-white/70 uppercase tracking-widest transition-all active:scale-95"
      >
        Pular ({Math.round(loadingProgress)}%)
      </motion.button>
    </motion.div>
  );
};