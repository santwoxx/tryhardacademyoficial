import React, { useEffect, useRef } from 'react';
import { Game } from '../game/engine';

interface MiniMapProps {
  game: Game | null;
  visible: boolean;
}

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
      const { playerPos, playerColor, remotePlayers, worldSize } = data;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / worldSize.width;
      const scaleY = canvas.height / worldSize.height;

      // Draw Remote Players (Enemies)
      remotePlayers.forEach(remote => {
        ctx.fillStyle = remote.color;
        const rx = remote.pos.x * scaleX;
        const ry = remote.pos.y * scaleY;
        ctx.beginPath();
        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow for enemies
        ctx.shadowBlur = 5;
        ctx.shadowColor = remote.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw Local Player
      ctx.fillStyle = playerColor;
      const px = playerPos.x * scaleX;
      const py = playerPos.y * scaleY;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow for player
      ctx.shadowBlur = 8;
      ctx.shadowColor = playerColor;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
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
      <div className="relative p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-white uppercase tracking-widest opacity-60">Radar</span>
        </div>
        <canvas 
          ref={canvasRef} 
          width={120} 
          height={120} 
          className="rounded-lg"
        />
      </div>
    </div>
  );
};
