/**
 * TRYHARD ACADEMY - Visual Effects System
 * Advanced Particles, Trails, and Lighting
 */

import { Point, GraphicQuality } from './engine';

export class GlowManager {
    private static cache: Map<string, HTMLCanvasElement> = new Map();

    static getGlow(color: string, radius: number): HTMLCanvasElement {
        const key = `${color}_${radius}`;
        if (this.cache.has(key)) return this.cache.get(key)!;

        const canvas = document.createElement('canvas');
        const size = Math.ceil(radius * 2);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
        
        // Extract RGB from hex (handles #RGB, #RRGGBB, #RRGGBBAA)
        let rgb = '255, 255, 255';
        if (color.startsWith('#')) {
            if (color.length === 4) {
                const r = parseInt(color[1] + color[1], 16);
                const g = parseInt(color[2] + color[2], 16);
                const b = parseInt(color[3] + color[3], 16);
                rgb = `${r}, ${g}, ${b}`;
            } else if (color.length >= 7) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                rgb = `${r}, ${g}, ${b}`;
            }
        }

        grad.addColorStop(0, `rgba(${rgb}, 1)`);
        grad.addColorStop(0.4, `rgba(${rgb}, 0.2)`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        this.cache.set(key, canvas);
        return canvas;
    }
}

export class EffectParticle {
    pos: Point = { x: 0, y: 0 };
    vel: Point = { x: 0, y: 0 };
    life: number = 0;
    maxLife: number = 1;
    color: string = '#fff';
    size: number = 2;
    active: boolean = false;
    glow: boolean = false;
    rotation: number = 0;
    rotationVel: number = 0;

    init(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number, glow: boolean) {
        this.pos.x = x;
        this.pos.y = y;
        this.vel.x = vx;
        this.vel.y = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.glow = glow;
        this.active = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationVel = (Math.random() - 0.5) * 0.2;
    }

    update(dt: number) {
        if (!this.active) return;
        this.pos.x += this.vel.x * (dt / 16);
        this.pos.y += this.vel.y * (dt / 16);
        this.rotation += this.rotationVel * (dt / 16);
        this.life -= dt / 1000;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        if (!this.active) return;
        const alpha = this.life / this.maxLife;
        
        if (quality === 'high' && this.glow) {
            const glowSize = this.size * 6;
            const glowCanvas = GlowManager.getGlow(this.color, glowSize);
            ctx.globalAlpha = alpha * 0.5;
            ctx.drawImage(glowCanvas, this.pos.x - glowSize, this.pos.y - glowSize);
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        // Square particles look more "digital/tech"
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotation);
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();
        
        ctx.globalAlpha = 1.0;
    }
}

export class ParticlePool {
    private pool: EffectParticle[] = [];
    private maxSize: number = 500;

    constructor(size: number = 500) {
        this.maxSize = size;
        for (let i = 0; i < size; i++) {
            this.pool.push(new EffectParticle());
        }
    }

    spawn(x: number, y: number, color: string, count: number = 1, speed: number = 2, glow: boolean = true) {
        let spawned = 0;
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const angle = Math.random() * Math.PI * 2;
                const s = Math.random() * speed + 1;
                this.pool[i].init(
                    x, y, 
                    Math.cos(angle) * s, 
                    Math.sin(angle) * s, 
                    0.5 + Math.random() * 0.5, 
                    color, 
                    1 + Math.random() * 2,
                    glow
                );
                spawned++;
                if (spawned >= count) break;
            }
        }
    }

    spawnAbsorption(fromX: number, fromY: number, toX: number, toY: number, color: string, count: number = 10) {
        let spawned = 0;
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                const angle = Math.atan2(toY - fromY, toX - fromX) + (Math.random() - 0.5) * 0.5;
                const speed = 5 + Math.random() * 5;
                const life = 0.3 + Math.random() * 0.3;
                this.pool[i].init(
                    fromX, fromY,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    life,
                    color,
                    2 + Math.random() * 2,
                    true
                );
                spawned++;
                if (spawned >= count) break;
            }
        }
    }

    update(dt: number) {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].active) this.pool[i].update(dt);
        }
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality, viewport: { x: number, y: number, w: number, h: number }) {
        if (quality === 'low') return;
        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (p.active) {
                // Culling
                if (p.pos.x > viewport.x - 20 && p.pos.x < viewport.x + viewport.w + 20 &&
                    p.pos.y > viewport.y - 20 && p.pos.y < viewport.y + viewport.h + 20) {
                    p.draw(ctx, quality);
                }
            }
        }
    }
}

export class Trail {
    points: Point[] = [];
    maxLength: number = 10;
    color: string = '#fff';
    width: number = 2;

    constructor(maxLength: number, color: string, width: number) {
        this.maxLength = maxLength;
        this.color = color;
        this.width = width;
    }

    update(x: number, y: number) {
        this.points.unshift({ x, y });
        if (this.points.length > this.maxLength) {
            this.points.pop();
        }
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        if (this.points.length < 2 || quality === 'low') return;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.globalAlpha = 0.3;
        
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
}

export class ScreenShake {
    intensity: number = 0;
    decay: number = 0.85; // Faster decay for snappier feel
    angle: number = 0;

    shake(amount: number) {
        this.intensity = Math.min(this.intensity + amount, 40); // Cap intensity but allow stacking
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        this.intensity *= this.decay;
        if (this.intensity < 0.1) this.intensity = 0;
    }

    apply(ctx: CanvasRenderingContext2D) {
        if (this.intensity > 0) {
            // Perlin-like noise or random offset
            const x = (Math.random() - 0.5) * this.intensity;
            const y = (Math.random() - 0.5) * this.intensity;
            const rot = (Math.random() - 0.5) * (this.intensity * 0.01);
            
            ctx.translate(x, y);
            ctx.rotate(rot);
        }
    }
}

export class FlashEffect {
    intensity: number = 0;
    color: string = '#fff';
    decay: number = 0.9;

    trigger(intensity: number, color: string = '#fff') {
        this.intensity = intensity;
        this.color = color;
    }

    update() {
        this.intensity *= this.decay;
        if (this.intensity < 0.01) this.intensity = 0;
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        if (this.intensity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.intensity;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}

export class HitMarker {
    pos: Point = { x: 0, y: 0 };
    life: number = 0;
    maxLife: number = 0.2;
    active: boolean = false;
    color: string = '#ffffff';

    init(x: number, y: number, color: string = '#ffffff') {
        this.pos.x = x;
        this.pos.y = y;
        this.color = color;
        this.life = this.maxLife;
        this.active = true;
    }

    update(dt: number) {
        if (!this.active) return;
        this.life -= dt / 1000;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;
        const progress = this.life / this.maxLife;
        const size = 15 * (1 - progress);
        const alpha = progress;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3 * alpha;
        ctx.globalAlpha = alpha;
        
        // Draw cross
        ctx.beginPath();
        ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
        ctx.moveTo(0, -size); ctx.lineTo(0, size);
        ctx.stroke();
        
        ctx.restore();
    }
}

export class Shockwave {
    pos: Point = { x: 0, y: 0 };
    radius: number = 0;
    maxRadius: number = 100;
    life: number = 0;
    maxLife: number = 0.5;
    color: string = '#fff';
    active: boolean = false;

    init(x: number, y: number, maxRadius: number, color: string) {
        this.pos.x = x;
        this.pos.y = y;
        this.maxRadius = maxRadius;
        this.color = color;
        this.life = 0.4;
        this.maxLife = 0.4;
        this.radius = 0;
        this.active = true;
    }

    update(dt: number) {
        if (!this.active) return;
        this.life -= dt / 1000;
        const progress = 1 - (this.life / this.maxLife);
        this.radius = this.maxRadius * progress;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8 * (this.life / this.maxLife);
        ctx.globalAlpha = (this.life / this.maxLife) * 0.5;
        ctx.stroke();
        ctx.restore();
    }
}

export const Lighting = {
    drawGlow: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, opacity: number = 0.2) => {
        const glowCanvas = GlowManager.getGlow(color, radius);
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(glowCanvas, x - radius, y - radius);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
    },
    adjustBrightness: (color: string, amount: number): string => {
        let r = 0, g = 0, b = 0;
        if (color.startsWith('#')) {
            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            }
        } else if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            }
        }
        
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
};
