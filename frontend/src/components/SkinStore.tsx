import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Crown, ShoppingBag, BarChart3, Timer, ShieldCheck, Zap, Star } from 'lucide-react';
import { SKINS, Skin } from '../game/engine';

interface SkinStoreProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  currentSkinId: number | string;
  onSelectSkin: (id: number | string) => void;
  isPremium: boolean;
}

const SkinPreview: React.FC<{ skin: Skin; size?: number; locked?: boolean }> = ({ skin, size = 80, locked = false }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now() / 1000;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);
    const r = size * 0.3;

    ctx.save();
    ctx.translate(cx, cy);
    
    if (locked) {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#444';
    } else {
        ctx.shadowBlur = 15;
        ctx.shadowColor = skin.glowColor;
        ctx.strokeStyle = skin.color;
    }

    const secondaryColor = skin.secondaryColor || skin.color;

    const drawShape = (radius: number) => {
        switch (skin.shape) {
            case 'circle': ctx.arc(0, 0, radius, 0, Math.PI * 2); break;
            case 'hexagon':
                for (let i = 0; i < 6; i++) {
                    const a = (i * Math.PI * 2) / 6;
                    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
                }
                ctx.closePath();
                break;
            case 'star':
                for (let i = 0; i < 10; i++) {
                    const a = (i * Math.PI * 2) / 10;
                    const rad = i % 2 === 0 ? radius : radius * 0.5;
                    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
                }
                ctx.closePath();
                break;
            case 'octagon':
                for (let i = 0; i < 8; i++) {
                    const a = (i * Math.PI * 2) / 8;
                    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
                }
                ctx.closePath();
                break;
            case 'diamond':
                ctx.moveTo(0, -radius); ctx.lineTo(radius * 0.8, 0); ctx.lineTo(0, radius); ctx.lineTo(-radius * 0.8, 0); ctx.closePath();
                break;
            case 'square': ctx.rect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 1.6); break;
            case 'triangle': ctx.moveTo(0, -radius); ctx.lineTo(radius, radius * 0.8); ctx.lineTo(-radius, radius * 0.8); ctx.closePath(); break;
            case 'cross':
                const w = radius * 0.4;
                ctx.moveTo(-radius, -w); ctx.lineTo(-w, -w); ctx.lineTo(-w, radius);
                ctx.lineTo(w, -radius); ctx.lineTo(w, -w); ctx.lineTo(radius, -w);
                ctx.lineTo(radius, w); ctx.lineTo(w, w); ctx.lineTo(w, radius);
                ctx.lineTo(-w, radius); ctx.lineTo(-w, w); ctx.lineTo(-radius, w);
                ctx.closePath();
                break;
            case 'shield':
                ctx.moveTo(0, -radius); ctx.bezierCurveTo(radius, -radius, radius, radius * 0.5, 0, radius); ctx.bezierCurveTo(-radius, radius * 0.5, -radius, -radius, 0, -radius); ctx.closePath();
                break;
            case 'gear':
                for (let i = 0; i < 16; i++) {
                    const a = (i * Math.PI * 2) / 16;
                    const rad = i % 2 === 0 ? radius : radius * 0.8;
                    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
                }
                ctx.closePath();
                break;
        }
    };

    if (!locked && skin.aura && skin.aura !== 'none') {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = skin.color;
        ctx.fill();
        ctx.restore();
    }

    ctx.beginPath();
    drawShape(r);

    if (!locked && skin.pattern && skin.pattern !== 'none') {
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = secondaryColor;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        if (skin.pattern === 'stripes') {
            for(let i=-5; i<5; i++) { ctx.moveTo(-r, i*4); ctx.lineTo(r, i*4+2); }
        } else if (skin.pattern === 'dots') {
            for(let i=-3; i<3; i++) for(let j=-3; j<3; j++) { ctx.moveTo(i*6, j*6); ctx.arc(i*6, j*6, 0.5, 0, Math.PI*2); }
        } else if (skin.pattern === 'grid') {
            for(let i=-3; i<3; i++) { ctx.moveTo(-r, i*6); ctx.lineTo(r, i*6); ctx.moveTo(i*6, -r); ctx.lineTo(i*6, r); }
        }
        ctx.stroke();
        ctx.restore();
    }

    if (skin.details === 'core') {
        ctx.moveTo(r * 0.4, 0); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    } else if (skin.details === 'double') {
        ctx.moveTo(r * 0.6, 0); drawShape(r * 0.6);
    } else if (skin.details === 'triple') {
        ctx.moveTo(r * 0.7, 0); drawShape(r * 0.7);
        ctx.moveTo(r * 0.4, 0); drawShape(r * 0.4);
    } else if (skin.details === 'spikes') {
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI * 2) / 4 + Math.PI / 4;
            ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            ctx.lineTo(Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4);
        }
    } else if (skin.details === 'circuit') {
        ctx.moveTo(r * 0.3, 0); ctx.rect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6);
    } else if (skin.details === 'ornate') {
        ctx.moveTo(r * 0.6, 0); drawShape(r * 0.6);
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI * 2) / 4;
            ctx.moveTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1);
            ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
        }
    }

    ctx.lineWidth = 3;
    ctx.stroke();

    if (!locked) {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = grad;
        ctx.fill();
    }

    if (skin.isPremium && !locked) {
        ctx.save();
        const crownY = -r * 1.5;
        const crownW = r * 1.2;
        const crownH = r * 0.8;
        ctx.fillStyle = '#ffea00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffea00';
        ctx.beginPath();
        ctx.moveTo(-crownW/2, crownY);
        ctx.lineTo(-crownW/2, crownY - crownH);
        ctx.lineTo(-crownW/4, crownY - crownH * 0.6);
        ctx.lineTo(0, crownY - crownH);
        ctx.lineTo(crownW/4, crownY - crownH * 0.6);
        ctx.lineTo(crownW/2, crownY - crownH);
        ctx.lineTo(crownW/2, crownY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();
  }, [skin, size, locked]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
};

export const SkinStore: React.FC<SkinStoreProps> = ({ isOpen, onClose, currentLevel, currentSkinId, onSelectSkin, isPremium }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl h-[85vh] bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#bc13fe]/20 rounded-2xl border border-[#bc13fe]/30">
                  <ShoppingBag className="w-6 h-6 text-[#bc13fe]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Loja de Skins</h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Desbloqueie novas aparências subindo de nível ou sendo um Fundador</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {SKINS.map((skin) => {
                    const isUnlocked = skin.isPremium ? isPremium : currentLevel >= (skin.id as number);
                    const isSelected = currentSkinId === skin.id;

                    return (
                      <motion.button
                        key={skin.id}
                        whileHover={isUnlocked ? { scale: 1.02, y: -4 } : {}}
                        whileTap={isUnlocked ? { scale: 0.98 } : {}}
                        onClick={() => isUnlocked && onSelectSkin(skin.id)}
                        className={`relative group p-4 rounded-3xl border transition-all flex flex-col items-center gap-3 ${isSelected ? 'bg-[#bc13fe]/10 border-[#bc13fe] shadow-[0_0_30px_rgba(188,19,254,0.2)]' : isUnlocked ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-black/40 border-white/5 opacity-60 grayscale'}`}
                      >
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isUnlocked ? 'bg-white/10 border-white/10 text-white/60' : 'bg-black/40 border-white/5 text-white/20'}`}>
                          {skin.isPremium ? 'PREMIUM' : `LVL ${skin.id}`}
                        </div>
                        {isSelected && <div className="absolute top-3 right-3 p-1 bg-[#bc13fe] rounded-full"><Check className="w-3 h-3 text-white" /></div>}
                        <div className="mt-4 relative">
                          <SkinPreview skin={skin} locked={!isUnlocked} />
                          {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center"><Lock className="w-6 h-6 text-white/20" /></div>}
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-black uppercase tracking-widest ${isUnlocked ? 'text-white' : 'text-white/20'}`}>{skin.name}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            {isUnlocked ? (isSelected ? 'Equipado' : 'Desbloqueado') : (skin.isPremium ? 'Somente Fundadores' : `Nível ${skin.id}`)}
                          </p>
                        </div>
                        {isUnlocked && !isSelected && <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Seu Nível Atual</span>
                  <span className="text-xl font-black text-[#00f2ff] italic">{currentLevel}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Skins Desbloqueadas</span>
                  <span className="text-xl font-black text-white italic">
                    {SKINS.filter(s => s.isPremium ? isPremium : currentLevel >= (s.id as number)).length}/{SKINS.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/40 italic font-bold text-xs uppercase tracking-widest">
                <Crown className="w-4 h-4 text-[#ffea00]" />
                Continue jogando para desbloquear todas as skins!
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
