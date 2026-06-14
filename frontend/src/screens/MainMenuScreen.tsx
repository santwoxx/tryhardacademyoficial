import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Timer, WifiOff, Globe, Zap, ShoppingBag, MessageSquare, Trophy, Settings, BookOpen, ShieldCheck, User, Star } from 'lucide-react';
import { SKINS } from '../game/engine';

const MainMenuSkinShowcase: React.FC<{ skinId: number | string; size?: number }> = ({ skinId, size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const skin = SKINS.find(s => s.id === skinId) || SKINS[0];

    const render = () => {
      const time = Date.now() / 1000;
      const cx = size / 2;
      const cy = size / 2;

      ctx.clearRect(0, 0, size, size);
      const r = size * 0.22;

      ctx.save();
      ctx.translate(cx, cy + r * 1.2);
      ctx.scale(1, 0.35);

      ctx.strokeStyle = skin.glowColor || '#00f2ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = skin.glowColor || '#00f2ff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `${skin.glowColor || '#00f2ff'}44`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r * 1.8, Math.sin(angle) * r * 1.8);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);

      const floatOffset = Math.sin(time * 3) * 6;
      ctx.translate(0, floatOffset);
      ctx.rotate(time * 0.5);

      if (skin.aura && skin.aura !== 'none') {
        const auraSize = r * 2.2;
        ctx.save();
        ctx.globalAlpha = 0.25;
        const grad = ctx.createRadialGradient(0, 0, r, 0, 0, auraSize);
        grad.addColorStop(0, skin.color);
        grad.addColorStop(0.5, skin.secondaryColor || skin.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.shadowBlur = 20;
      ctx.shadowColor = skin.glowColor;
      ctx.strokeStyle = skin.color;
      ctx.fillStyle = skin.color;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';

      const drawShape = (radius: number) => {
        ctx.beginPath();
        switch (skin.shape) {
          case 'circle': ctx.arc(0, 0, radius, 0, Math.PI * 2); break;
          case 'hexagon':
            for (let i = 0; i < 6; i++) {
              const a = (i * Math.PI * 2) / 6;
              ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            }
            break;
          case 'star':
            for (let i = 0; i < 10; i++) {
              const a = (i * Math.PI * 2) / 10;
              const rad = i % 2 === 0 ? radius : radius * 0.5;
              ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
            }
            break;
          case 'octagon':
            for (let i = 0; i < 8; i++) {
              const a = (i * Math.PI * 2) / 8;
              ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            }
            break;
          case 'diamond':
            ctx.moveTo(0, -radius); ctx.lineTo(radius * 0.8, 0); ctx.lineTo(0, radius); ctx.lineTo(-radius * 0.8, 0);
            break;
          case 'square': ctx.rect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 1.6); break;
          case 'triangle': ctx.moveTo(0, -radius); ctx.lineTo(radius, radius * 0.8); ctx.lineTo(-radius, radius * 0.8); break;
          case 'cross':
            const w = radius * 0.4;
            ctx.moveTo(-radius, -w); ctx.lineTo(-w, -w); ctx.lineTo(-w, radius);
            ctx.lineTo(w, -radius); ctx.lineTo(w, -w); ctx.lineTo(radius, -w);
            ctx.lineTo(radius, w); ctx.lineTo(w, w); ctx.lineTo(w, radius);
            ctx.lineTo(-w, radius); ctx.lineTo(-w, w); ctx.lineTo(-radius, w);
            break;
          case 'shield':
            ctx.moveTo(0, -radius); ctx.bezierCurveTo(radius, -radius, radius, radius * 0.5, 0, radius); ctx.bezierCurveTo(-radius, radius * 0.5, -radius, -radius, 0, -radius);
            break;
          case 'gear':
            for (let i = 0; i < 16; i++) {
              const a = (i * Math.PI * 2) / 16;
              const rad = i % 2 === 0 ? radius : radius * 0.8;
              ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
            }
            break;
        }
        ctx.closePath();
      };

      drawShape(r);
      ctx.stroke();

      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
      grad.addColorStop(0, '#ffffff44');
      grad.addColorStop(0.3, skin.color);
      grad.addColorStop(1, '#00000033');
      ctx.fillStyle = grad;
      ctx.fill();

      const secondaryColor = skin.secondaryColor || skin.color;
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 3;

      if (skin.details === 'core') {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2); ctx.stroke();
      } else if (skin.details === 'double') {
        drawShape(r * 0.6); ctx.stroke();
      } else if (skin.details === 'triple') {
        drawShape(r * 0.7); ctx.stroke();
        drawShape(r * 0.4); ctx.stroke();
      } else if (skin.details === 'spikes') {
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
          ctx.stroke();
        }
      } else if (skin.details === 'circuit') {
        ctx.strokeRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6);
      } else if (skin.details === 'ornate') {
        drawShape(r * 0.6); ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * 0.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (skin.details === 'crown') {
        ctx.save();
        ctx.fillStyle = '#ffea00';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        const cw = r * 0.8;
        const ch = r * 0.5;
        ctx.translate(0, -r * 1.1);
        ctx.beginPath();
        ctx.moveTo(-cw/2, 0);
        ctx.lineTo(-cw/2, -ch);
        ctx.lineTo(-cw/4, -ch * 0.6);
        ctx.lineTo(0, -ch);
        ctx.lineTo(cw/4, -ch * 0.6);
        ctx.lineTo(cw/2, -ch);
        ctx.lineTo(cw/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (skin.details === 'satellites') {
        for (let i = 0; i < 3; i++) {
          const ang = time * 2.5 + (i * Math.PI * 2) / 3;
          const sx = Math.cos(ang) * r * 1.6;
          const sy = Math.sin(ang) * r * 1.6;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.fillStyle = skin.color;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [skinId, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="block select-none pointer-events-none" />;
};

interface MainMenuScreenProps {
  playerData: any;
  remainingSeconds: number;
  isOnline: boolean;
  nickname: string;
  currentLevel: number;
  trophies: number;
  currentSkinId: number | string;
  matchCount: number;
  totalTimePlayed: number;
  hasNewChatMessages: boolean;
  handleMultiplayer: () => void;
  requestLandscape: () => void;
  triggerHaptic: () => void;
  setShowStore: (v: boolean) => void;
  setShowGlobalChat: (v: boolean) => void;
  setHasNewChatMessages: (v: boolean) => void;
  setShowLeaderboard: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowTutorial: (v: boolean) => void;
  setShowPrivacyPolicy: (v: boolean) => void;
  beginGameWithRotationCheck: (cb: () => void) => void;
  handleStartGame: () => void;
}

export function MainMenuScreen({
  playerData,
  remainingSeconds,
  isOnline,
  nickname,
  currentLevel,
  trophies,
  currentSkinId,
  matchCount,
  totalTimePlayed,
  hasNewChatMessages,
  handleMultiplayer,
  requestLandscape,
  triggerHaptic,
  setShowStore,
  setShowGlobalChat,
  setHasNewChatMessages,
  setShowLeaderboard,
  setShowSettings,
  setShowTutorial,
  setShowPrivacyPolicy,
  beginGameWithRotationCheck,
  handleStartGame,
}: MainMenuScreenProps) {
  return (
    <motion.div
      key="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-6 bg-[radial-gradient(circle_at_center,_#0f0a1a_0%,_#050505_100%)] overflow-y-auto custom-scrollbar"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-[#bc13fe]/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full flex justify-between items-center z-10 border-b border-white/5 pb-4 mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">Servidor Principal: ONLINE</span>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <WifiOff size={10} className="text-red-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Modo Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 py-2">
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left h-full justify-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mb-8 md:mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-[0.8] select-none">
              TRYHARD<br/>
              <span className="text-[#bc13fe] drop-shadow-[0_0_35px_rgba(188,19,254,0.5)]">ACADEMY</span>
            </h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.45em] mt-3 pl-1">Arena do Conhecimento</p>
          </motion.div>

          <div className="w-full flex flex-col gap-2.5">
            <motion.button
              whileHover={{ x: 8 }}
              onClick={() => {
                handleMultiplayer();
                requestLandscape();
                triggerHaptic();
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full text-left p-4 rounded-xl border border-[#bc13fe]/30 bg-gradient-to-r from-[#bc13fe]/10 via-[#bc13fe]/5 to-transparent hover:border-[#bc13fe] hover:from-[#bc13fe]/20 hover:to-[#bc13fe]/5 flex items-center justify-between group transition-all duration-300 relative overflow-hidden shadow-[0_0_30px_rgba(188,19,254,0.05)] hover:shadow-[0_0_30px_rgba(188,19,254,0.15)]"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bc13fe] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div>
                <span className="text-white text-base md:text-xl font-black italic tracking-tighter uppercase leading-none block">JOGAR ONLINE</span>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1 block">Combate Multiplayer em Arena</span>
              </div>
              <Globe size={18} className="text-[#bc13fe] group-hover:rotate-180 transition-transform duration-500" />
            </motion.button>

            <motion.button
              whileHover={{ x: 8 }}
              onClick={() => { beginGameWithRotationCheck(() => { handleStartGame(); requestLandscape(); }); }}
              className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/[0.05] flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div>
                <span className="text-white text-base md:text-xl font-black italic tracking-tighter uppercase leading-none block">PRATICAR</span>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1 block">Treino Offline contra Bots</span>
              </div>
              <Zap size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ x: 6 }}
              onClick={() => setShowStore(true)}
              className="w-full text-left py-3 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-[#bc13fe]/40 hover:bg-white/[0.03] flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bc13fe]/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div>
                <span className="text-white text-sm md:text-base font-black italic tracking-tighter uppercase leading-none block">LOJA DE SKINS</span>
                <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-0.5 block">Customizar Aparência</span>
              </div>
              <ShoppingBag size={14} className="text-[#bc13fe]" />
            </motion.button>



            <motion.button
              whileHover={{ x: 6 }}
              onClick={() => { setShowGlobalChat(true); setHasNewChatMessages(false); }}
              className="w-full text-left py-3 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-green-500/40 hover:bg-white/[0.03] flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-white text-sm md:text-base font-black italic tracking-tighter uppercase leading-none block">CHAT GLOBAL</span>
                  <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-0.5 block">Mensagens em Tempo Real</span>
                </div>
                {hasNewChatMessages && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <MessageSquare size={14} className="text-green-500" />
            </motion.button>

            <motion.button
              whileHover={{ x: 6 }}
              onClick={() => setShowLeaderboard(true)}
              className="w-full text-left py-3 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-[#ffea00]/40 hover:bg-white/[0.03] flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffea00]/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div>
                <span className="text-white text-sm md:text-base font-black italic tracking-tighter uppercase leading-none block">RANKING GLOBAL</span>
                <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-0.5 block">Classificação dos Melhores</span>
              </div>
              <Crown size={14} className="text-[#ffea00]" />
            </motion.button>

            <motion.button
              whileHover={{ x: 6 }}
              onClick={() => setShowSettings(true)}
              className="w-full text-left py-3 px-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03] flex items-center justify-between group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div>
                <span className="text-white text-sm md:text-base font-black italic tracking-tighter uppercase leading-none block">AJUSTES & PERFIL</span>
                <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-0.5 block">Áudio, Gráficos e Conta</span>
              </div>
              <Settings size={14} className="text-white/40" />
            </motion.button>
          </div>
        </div>

        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center items-center h-full">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-lg bg-black/40 border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[420px]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#bc13fe]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bc13fe] to-[#8a00ff] flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(188,19,254,0.3)]">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-sm font-black text-white italic tracking-wide uppercase leading-none truncate max-w-[120px]">{nickname || 'CONECTANDO...'}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#bc13fe] mt-1">RECRUTA • NÍVEL {currentLevel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-[#ffea00]/10 border border-[#ffea00]/30 rounded-lg px-2.5 py-1.5 hover:bg-[#ffea00]/20 transition-all">
                <Trophy size={12} className="text-[#ffea00] drop-shadow-[0_0_8px_rgba(255,234,0,0.5)]" />
                <span className="text-white text-xs font-black italic tracking-tight tabular-nums">{trophies}</span>
              </div>
            </div>

            <div className="my-1 relative flex items-center justify-center w-full z-10">
              <MainMenuSkinShowcase skinId={currentSkinId} size={180} />
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 rounded-full py-1 px-4 text-[8px] font-black text-white/50 uppercase tracking-widest select-none shadow-lg">
                Visualização do Avatar
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 mt-4 border-t border-white/5 pt-3 z-10">
              <div className="bg-white/[0.02] border border-white/5 px-2 py-2 rounded-xl text-center">
                <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block mb-0.5">Partidas</span>
                <span className="text-sm font-black text-white font-mono italic leading-none">{matchCount}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 px-2 py-2 rounded-xl text-center">
                <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block mb-0.5">Tempo de Jogo</span>
                <span className="text-sm font-black text-[#00f2ff] font-mono italic leading-none">{Math.floor(totalTimePlayed / 60)}m</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center z-10 border-t border-white/5 pt-4 mt-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] gap-4">
        <div className="flex gap-6">
          <button
            onClick={() => setShowTutorial(true)}
            className="hover:text-white transition-colors flex items-center gap-2 group text-xs font-black uppercase"
          >
            <BookOpen size={12} className="text-[#00f2ff] group-hover:scale-110 transition-transform" />
            MANUAL DE COMBATE
          </button>
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="hover:text-white transition-colors flex items-center gap-2 group text-xs font-black uppercase"
          >
            <ShieldCheck size={12} className="text-green-500 group-hover:scale-110 transition-transform" />
            POLÍTICA DE PRIVACIDADE
          </button>
        </div>
        <div className="text-[8px] opacity-50 tracking-[0.3em]">
          TRYHARD ACADEMY v1.2.0 • © 2026 GATO GALUDO
        </div>
      </div>
    </motion.div>
  );
}
