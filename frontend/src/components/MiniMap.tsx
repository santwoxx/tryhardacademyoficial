import React, { useEffect, useRef } from 'react';
import { Game } from '../game/engine';

interface MiniMapProps {
  game: Game | null;
  visible: boolean;
}

const POWERUP_ICONS: Record<string, string> = {
  shield: '#00f2ff',
  rapid: '#ffea00',
  speed: '#bc13fe',
  triple: '#ff4d00',
  bomb: '#ff0055',
  magnet: '#00ff88',
};

export const MiniMap: React.FC<MiniMapProps> = ({ game, visible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !game) return;

    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = game.getMiniMapData();
      const { playerPos, playerColor, remotePlayers, worldSize, powerUps, stars, bots, projectiles } = data;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / worldSize.width;
      const scaleY = canvas.height / worldSize.height;

      // Crosshair lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw Stars (XP pickups)
      if (stars) {
        stars.forEach(star => {
          ctx.fillStyle = 'rgba(255, 234, 0, 0.5)';
          const sx = star.pos.x * scaleX;
          const sy = star.pos.y * scaleY;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Power-ups
      if (powerUps) {
        powerUps.forEach(pu => {
          ctx.fillStyle = POWERUP_ICONS[pu.type] || pu.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = POWERUP_ICONS[pu.type] || pu.color;
          const px = pu.pos.x * scaleX;
          const py = pu.pos.y * scaleY;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Inner white dot for visibility
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // Draw Bots
      if (bots) {
        bots.forEach(bot => {
          ctx.fillStyle = bot.color || '#ff4444';
          ctx.globalAlpha = 0.7;
          const bx = bot.pos.x * scaleX;
          const by = bot.pos.y * scaleY;
          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      // Draw Projectiles
      if (projectiles) {
        projectiles.forEach(proj => {
          ctx.fillStyle = proj.owner === 'player' ? 'rgba(0, 242, 255, 0.6)' : 'rgba(188, 19, 254, 0.6)';
          const pjx = proj.pos.x * scaleX;
          const pjy = proj.pos.y * scaleY;
          ctx.beginPath();
          ctx.arc(pjx, pjy, 1, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Remote Players (Enemies)
      remotePlayers.forEach(remote => {
        ctx.fillStyle = remote.color;
        const rx = remote.pos.x * scaleX;
        const ry = remote.pos.y * scaleY;
        ctx.beginPath();
        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow for enemies
        ctx.shadowBlur = 6;
        ctx.shadowColor = remote.color;
        ctx.strokeStyle = remote.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw Local Player (on top of everything)
      ctx.fillStyle = playerColor;
      const px = playerPos.x * scaleX;
      const py = playerPos.y * scaleY;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Direction indicator (small line showing facing angle)
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      const angle = data.playerAngle || 0;
      ctx.lineTo(px + Math.cos(angle) * 8, py + Math.sin(angle) * 8);
      ctx.stroke();
      
      // Outer glow ring for player
      ctx.shadowBlur = 10;
      ctx.shadowColor = playerColor;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [game, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 right-6 z-[150] pointer-events-none">
      <div className="relative p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-60">Radar</span>
          <div className="ml-2 flex items-center gap-1.5">
            <div className="w-1 h-1 bg-yellow-400 rounded-full" />
            <span className="text-[6px] text-white/40 font-bold">XP</span>
            <div className="w-1 h-1 bg-green-400 rounded-full" />
            <span className="text-[6px] text-white/40 font-bold">BUFF</span>
            <div className="w-1 h-1 bg-red-400 rounded-full" />
            <span className="text-[6px] text-white/40 font-bold">BOT</span>
          </div>
        </div>
        <div className="absolute bottom-1 right-2 z-10">
          <span className="text-[6px] text-white/20 font-mono">[{worldSize.width}x{worldSize.height}]</span>
        </div>
        <canvas 
          ref={canvasRef} 
          width={150} 
          height={150} 
          className="rounded-lg"
        />
      </div>
    </div>
  );
};
