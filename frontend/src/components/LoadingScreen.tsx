import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  level: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingPhrase, setLoadingPhrase] = useState('Inicializando sistemas nucleares...');

  // Dynamic status phrases based on load progress
  useEffect(() => {
    if (progress < 20) {
      setLoadingPhrase('Sintonizando frequências neurais...');
    } else if (progress < 40) {
      setLoadingPhrase('Carregando algoritmos algébricos de combate...');
    } else if (progress < 60) {
      setLoadingPhrase('Estabelecendo conexão segura com banco de dados...');
    } else if (progress < 80) {
      setLoadingPhrase('Construindo malhas tridimensionais da arena...');
    } else if (progress < 95) {
      setLoadingPhrase('Injetando potência nos motores principais...');
    } else {
      setLoadingPhrase('Preparado. Entrando na arena Tryhard...');
    }
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      pulseSpeed: number;
      pulseDir: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * (isMobile ? 1.2 : 2) + 0.8;
        this.speedX = (Math.random() - 0.5) * (isMobile ? 0.6 : 1.2);
        this.speedY = (Math.random() - 0.5) * (isMobile ? 0.6 : 1.2);
        const colors = ['#00f2ff', '#bc13fe', '#ff00ff', '#3b82f6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.4 + 0.15;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse opacity for cyber star effect
        this.opacity += this.pulseSpeed * this.pulseDir;
        if (this.opacity > 0.75) {
          this.opacity = 0.75;
          this.pulseDir = -1;
        } else if (this.opacity < 0.15) {
          this.opacity = 0.15;
          this.pulseDir = 1;
        }

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        
        // Glow effect
        if (!isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.color;
        }
        ctx.restore();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = isMobile ? 30 : 70;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Dark trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw gridlines in background
      drawGrid();

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const drawGrid = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    init();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-[100] pointer-events-auto overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Moving scanline */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-scanline opacity-10 animate-scanline" />

      {/* Cyber/Steam HUD Frame decoration */}
      <div className="absolute inset-8 border border-white/5 pointer-events-none z-20 rounded-[2rem]">
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#00f2ff]/30 to-transparent" />
        <div className="absolute bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#bc13fe]/30 to-transparent" />
        <div className="absolute top-4 left-4 text-[8px] font-mono text-white/25 uppercase tracking-widest">TRYHARD SYSTEM v4.2</div>
        <div className="absolute top-4 right-4 text-[8px] font-mono text-white/25 uppercase tracking-widest">SECURE COMBAT HANDLER</div>
        <div className="absolute bottom-4 left-4 text-[8px] font-mono text-cyan-400/30 uppercase tracking-widest">LNK: READY</div>
        <div className="absolute bottom-4 right-4 text-[8px] font-mono text-[#bc13fe]/30 uppercase tracking-widest">SYS: ONLINE</div>
      </div>
      
      <div className="relative z-30 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="mb-8 relative"
        >
          {/* Circular Progress & Glowing Ring */}
          <div className="absolute inset-0 rounded-full border border-white/5 blur-sm" />
          <svg className="w-56 h-56 transform -rotate-90">
            <defs>
              <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2ff" />
                <stop offset="50%" stopColor="#bc13fe" />
                <stop offset="100%" stopColor="#00f2ff" />
              </linearGradient>
            </defs>
            <circle
              cx="112"
              cy="112"
              r="96"
              stroke="rgba(255, 255, 255, 0.02)"
              strokeWidth="5"
              fill="transparent"
            />
            <motion.circle
              cx="112"
              cy="112"
              r="96"
              stroke="url(#cyber-gradient)"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 96}
              initial={{ strokeDashoffset: 2 * Math.PI * 96 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 96) * (1 - progress / 100) }}
              transition={{ type: "spring", stiffness: 45, damping: 15 }}
              className="drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              className="flex items-baseline"
              key={Math.round(progress)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {Math.round(progress)}
              </span>
              <span className="text-lg font-black text-[#00f2ff] ml-0.5">%</span>
            </motion.div>
            <span className="text-[9px] text-[#00f2ff] font-black tracking-[0.4em] uppercase mt-2 animate-pulse">
              Carregando
            </span>
          </div>
        </motion.div>

        <div className="w-[28rem] space-y-6">
          <div className="text-center px-4">
            <motion.h3 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-black text-white mb-2 tracking-tight italic"
            >
              PREPARANDO NÍVEL {level}
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-8 flex items-center justify-center"
            >
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase truncate max-w-full">
                {loadingPhrase}
              </p>
            </motion.div>
          </div>

          {/* Subsystems Monitor grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Matriz de Cálculo', val: progress > 30 ? 'PRONTO' : 'CARREGANDO', color: progress > 30 ? 'text-[#00f2ff]' : 'text-white/30' },
              { label: 'Defesas Defletoras', val: progress > 60 ? 'PRONTO' : 'SINTONIZANDO', color: progress > 60 ? 'text-[#00f2ff]' : 'text-white/30' },
              { label: 'Armamento Laser', val: progress > 85 ? 'PRONTO' : 'CARREGANDO', color: progress > 85 ? 'text-[#00f2ff]' : 'text-white/30' },
              { label: 'Núcleo Central', val: progress > 15 ? 'ESTÁVEL' : 'INICIALIZANDO', color: progress > 15 ? 'text-[#00f2ff]' : 'text-white/30' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="bg-zinc-950/60 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden group hover:border-white/10 transition-all"
              >
                <div className="absolute top-0 left-0 w-[2px] h-full bg-[#00f2ff]/20 group-hover:bg-[#00f2ff]/50 transition-colors" />
                <span className="text-[7.5px] text-white/30 font-black uppercase tracking-widest pl-1">{stat.label}</span>
                <span className={`text-[10px] font-black tracking-widest pl-1 ${stat.color}`}>
                  {stat.val}
                </span>
              </motion.div>
            ))}
          </div>
          
          {/* Micro-loading dot indicator */}
          <div className="flex justify-center items-center gap-1.5 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.7, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full shadow-[0_0_8px_rgba(0,242,255,0.7)]"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
