import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  level: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * (isMobile ? 1.5 : 2) + 1;
        this.speedX = (Math.random() - 0.5) * (isMobile ? 1 : 2);
        this.speedY = (Math.random() - 0.5) * (isMobile ? 1 : 2);
        const colors = ['#00f2ff', '#bc13fe', '#ff00ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        
        // Glow effect - skip on mobile
        if (!isMobile) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
        }
        ctx.globalAlpha = 1;
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = isMobile ? 25 : 50;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
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
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] z-[100] pointer-events-auto overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40"
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 relative"
        >
          {/* Circular Progress */}
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - progress / 100) }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-5xl font-black text-white font-mono"
              key={Math.round(progress)}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
            <span className="text-[10px] text-cyan-400/60 font-bold tracking-[0.3em] uppercase mt-1">
              Sincronizando
            </span>
          </div>
        </motion.div>

        <div className="w-96 space-y-8">
          <div className="text-center">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2 tracking-tight"
            >
              PREPARANDO NÍVEL {level}
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 text-xs font-medium tracking-widest uppercase"
            >
              Carregando ativos neurais e malhas de combate
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Motores', val: progress > 30 ? 'ONLINE' : 'BOOTING' },
              { label: 'Escudos', val: progress > 60 ? 'ONLINE' : 'BOOTING' },
              { label: 'Armas', val: progress > 85 ? 'ONLINE' : 'BOOTING' },
              { label: 'Núcleo', val: progress > 10 ? 'ESTÁVEL' : 'INICIALIZANDO' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-1"
              >
                <span className="text-[8px] text-white/30 font-bold uppercase tracking-tighter">{stat.label}</span>
                <span className={`text-[10px] font-black tracking-widest ${stat.val === 'ONLINE' || stat.val === 'ESTÁVEL' ? 'text-cyan-400' : 'text-white/60'}`}>
                  {stat.val}
                </span>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center">
             <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,242,255,1)]"
             />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
