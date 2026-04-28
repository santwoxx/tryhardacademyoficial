/**
 * TRYHARD ACADEMY - Game Engine
 * Pure JavaScript 2D Arena Base
 */

import { ParticlePool, Trail, ScreenShake, Lighting, FlashEffect, Shockwave, HitMarker } from './effects';
import { audioManager } from './audio';

/**
 * NATIVE SFX UTILITY
 * Minimal, high-performance sound management inside engine.ts
 */
const GAME_SFX_CONFIG = {
    shoot: 'https://cdn.pixabay.com/audio/2022/02/10/audio_fc068e214d.mp3',
    collect: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
    hit: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c36940a045.mp3',
    explosion: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5e2f7f90f2.mp3',
    level_up: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c5df006b53.mp3',
    powerup: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3'
};

const SFX_POOLS: Record<string, HTMLAudioElement[]> = {};

// Initialization: Preload sounds into pools to prevent latency
Object.entries(GAME_SFX_CONFIG).forEach(([key, url]) => {
    // Increased pool size for rapid sounds like shoot and hit
    const poolSize = (key === 'shoot' || key === 'hit') ? 12 : 6;
    SFX_POOLS[key] = Array.from({ length: poolSize }, () => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        return audio;
    });
});

/** Plays a sound effect from the pool with volume control */
const triggerGameSfx = (name: keyof typeof GAME_SFX_CONFIG, vol = 0.35) => {
    if (audioManager.getMuted()) return;
    const pool = SFX_POOLS[name];
    if (!pool) return;
    const sound = pool.find(s => s.paused || s.ended) || pool[0];
    sound.currentTime = 0; // Reset for rapid-fire sounds
    sound.volume = vol;
    sound.play().catch(() => {});
};

export interface Point {
    x: number;
    y: number;
}

export type GraphicQuality = 'low' | 'medium' | 'high';
export type GameState = 'playing' | 'transition' | 'loading';

export interface Skin {
    id: number | string;
    name: string;
    color: string;
    glowColor: string;
    secondaryColor?: string;
    outlineColor?: string;
    highlightColor?: string;
    pattern?: 'none' | 'stripes' | 'dots' | 'grid' | 'waves' | 'circuit' | 'checkered' | 'stars' | 'hex' | 'constellation' | 'galaxy';
    aura?: 'none' | 'fire' | 'electric' | 'ghost' | 'portal' | 'rainbow' | 'void' | 'nature' | 'frost' | 'cosmic' | 'nebula' | 'astral';
    shape: 'circle' | 'hexagon' | 'star' | 'octagon' | 'diamond' | 'square' | 'triangle' | 'cross' | 'shield' | 'gear' | 'heart' | 'spiky' | 'crescent';
    details: 'none' | 'core' | 'rings' | 'spikes' | 'circuit' | 'double' | 'triple' | 'ornate' | 'eyes' | 'crown' | 'wings' | 'satellites' | 'orbit';
    isPremium?: boolean;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    price?: number;
    premium?: boolean;
    shader?: boolean;
    trail?: boolean;
    responseTimeMultiplier?: number;
    image?: string;
    banner?: string;
}

const SHAPES: Skin['shape'][] = ['circle', 'hexagon', 'star', 'octagon', 'diamond', 'square', 'triangle', 'cross', 'shield', 'gear', 'heart', 'spiky', 'crescent'];
const DETAILS: Skin['details'][] = ['none', 'core', 'rings', 'spikes', 'circuit', 'double', 'triple', 'ornate', 'eyes', 'crown', 'wings', 'satellites', 'orbit'];
const PATTERNS: Skin['pattern'][] = ['none', 'stripes', 'dots', 'grid', 'waves', 'circuit', 'checkered', 'stars', 'hex', 'constellation', 'galaxy'];
const AURAS: Skin['aura'][] = ['none', 'fire', 'electric', 'ghost', 'portal', 'rainbow', 'void', 'nature', 'frost', 'cosmic', 'nebula', 'astral'];
const NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];

export const SKINS: Skin[] = [
    {
        id: 0,
        name: 'SKIN FUNDADOR',
        color: '#ffea00',
        glowColor: '#ffea00',
        secondaryColor: '#ff4d00',
        outlineColor: '#000000',
        highlightColor: '#ffffff',
        pattern: 'circuit',
        aura: 'rainbow',
        shape: 'star',
        details: 'ornate',
        isPremium: true
    },
    ...Array.from({ length: 100 }, (_, i) => {
        const id = i + 1;
        const hue = (id * 137.5) % 360;
        const shape = SHAPES[i % SHAPES.length];
        const details = DETAILS[i % DETAILS.length];
        const pattern = PATTERNS[i % PATTERNS.length];
        const aura = AURAS[i % AURAS.length];
        const name = `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`;
        return {
            id,
            name,
            color: `hsl(${hue}, 100%, 60%)`,
            glowColor: `hsl(${hue}, 100%, 50%)`,
            secondaryColor: `hsl(${(hue + 40) % 360}, 100%, 50%)`,
            outlineColor: '#000000',
            highlightColor: `hsl(${hue}, 100%, 90%)`,
            pattern,
            aura,
            shape,
            details
        };
    })
];

export class Projectile {
    pos: Point = { x: 0, y: 0 };
    vel: Point = { x: 0, y: 0 };
    angle: number = 0;
    radius: number = 4;
    color: string = '#fff';
    glowColor: string = '#fff';
    active: boolean = false;
    owner: 'player' | 'remote' | 'bot' = 'player';
    ownerId?: string;
    trail: Trail;

    constructor() {
        this.trail = new Trail(10, '#fff', 2);
    }

    init(x: number, y: number, angle: number, owner: 'player' | 'remote' | 'bot' = 'player', ownerId?: string) {
        this.pos.x = x;
        this.pos.y = y;
        this.angle = angle;
        const speed = 10;
        this.vel.x = Math.cos(angle) * speed;
        this.vel.y = Math.sin(angle) * speed;
        this.radius = 4;
        this.color = owner === 'player' ? '#00f2ff' : '#bc13fe'; 
        this.glowColor = this.color;
        this.owner = owner;
        this.ownerId = ownerId;
        this.active = true;
        this.trail.color = this.color;
        this.trail.points = []; // Reset trail
    }

    update(bounds: { width: number, height: number }, dt: number) {
        if (!this.active) return;
        this.pos.x += this.vel.x * (dt / 16);
        this.pos.y += this.vel.y * (dt / 16);
        this.trail.update(this.pos.x, this.pos.y);

        if (this.pos.x < -50 || this.pos.x > bounds.width + 50 || 
            this.pos.y < -50 || this.pos.y > bounds.height + 50) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality = 'high') {
        if (!this.active) return;
        this.trail.draw(ctx, quality);
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        // Squash and stretch based on velocity
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        const stretch = 1 + speed * 0.05;
        const squash = 1 / stretch;
        ctx.scale(stretch, squash);

        if (quality === 'high') {
            const glowSize = this.radius * 4;
            Lighting.drawGlow(ctx, 0, 0, glowSize, this.glowColor, 0.4);
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core for juice
        if (quality !== 'low') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

export class ProjectilePool {
    private pool: Projectile[] = [];
    private activeList: Projectile[] = [];
    
    constructor(size: number = 100) {
        for (let i = 0; i < size; i++) {
            this.pool.push(new Projectile());
        }
    }

    spawn(x: number, y: number, angle: number, owner: 'player' | 'remote' = 'player', ownerId?: string) {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) {
                this.pool[i].init(x, y, angle, owner, ownerId);
                return this.pool[i];
            }
        }
        return null;
    }

    update(bounds: { width: number, height: number }, dt: number) {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].active) {
                this.pool[i].update(bounds, dt);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality, viewport: { x: number, y: number, w: number, h: number }) {
        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (p.active) {
                // Culling
                if (p.pos.x > viewport.x - 50 && p.pos.x < viewport.x + viewport.w + 50 &&
                    p.pos.y > viewport.y - 50 && p.pos.y < viewport.y + viewport.h + 50) {
                    p.draw(ctx, quality);
                }
            }
        }
    }

    getActive() {
        this.activeList.length = 0;
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].active) {
                this.activeList.push(this.pool[i]);
            }
        }
        return this.activeList;
    }

    clear() {
        this.pool.forEach(p => p.active = false);
    }
}

export class Star {
    pos: Point;
    radius: number = 20;
    color: string = '#ffea00'; 
    glowColor: string = '#ffea00';
    isDead: boolean = false;
    pulse: number = 0;
    private static cache: HTMLCanvasElement | null = null;

    constructor(x: number, y: number) {
        this.pos = { x, y };
    }

    update() {
        this.pulse += 0.05;
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality = 'high') {
        if (this.isDead) return;
        
        ctx.save();
        const time = Date.now() / 1000;
        const scale = 1 + Math.sin(time * 5 + this.pos.x * 0.1) * 0.15;
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(scale, scale);
        ctx.rotate(time * 0.5);

        if (quality !== 'low') {
            if (!Star.cache) {
                Star.cache = document.createElement('canvas');
                Star.cache.width = 60;
                Star.cache.height = 60;
                const cCtx = Star.cache.getContext('2d')!;
                cCtx.translate(30, 30);
                this.renderStaticStar(cCtx, 20);
            }
            ctx.drawImage(Star.cache, -30, -30);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    private renderStaticStar(ctx: CanvasRenderingContext2D, r: number) {
        ctx.beginPath();
        const spikes = 5;
        const outer = r;
        const inner = r / 2;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(0, -outer);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
            rot += step;
            ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
            rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 234, 0, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#ffea00';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#ffea00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
    }
}

export class PowerUp {
    pos: Point;
    type: 'shield' | 'rapid' | 'speed' | 'triple';
    radius: number = 15;
    active: boolean = false;
    pulse: number = 0;
    color: string;

    constructor() {
        this.pos = { x: 0, y: 0 };
        this.type = 'shield';
        this.color = '#fff';
    }

    init(x: number, y: number, type: 'shield' | 'rapid' | 'speed' | 'triple') {
        this.pos.x = x;
        this.pos.y = y;
        this.type = type;
        this.active = true;
        this.pulse = 0;
        switch (type) {
            case 'shield': this.color = '#00f2ff'; break;
            case 'rapid': this.color = '#ffea00'; break;
            case 'speed': this.color = '#bc13fe'; break;
            case 'triple': this.color = '#ff4d00'; break;
        }
    }

    update() {
        this.pulse += 0.1;
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        if (!this.active) return;
        const time = Date.now() / 1000;
        const scale = 1 + Math.sin(this.pulse) * 0.15;
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(scale, scale);

        if (quality !== 'low') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            
            // Outer rotating ring
            ctx.save();
            ctx.rotate(time * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 1.4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Inner glow
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            grad.addColorStop(0, `${this.color}44`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        const r = this.radius;
        
        switch (this.type) {
            case 'shield':
                // Hexagon
                for (let i = 0; i < 6; i++) {
                    const a = (i * Math.PI * 2) / 6 - Math.PI / 2;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.stroke();
                // Inner shield icon
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.5);
                ctx.bezierCurveTo(r * 0.5, -r * 0.5, r * 0.5, r * 0.3, 0, r * 0.6);
                ctx.bezierCurveTo(-r * 0.5, r * 0.3, -r * 0.5, -r * 0.5, 0, -r * 0.5);
                ctx.fillStyle = this.color;
                ctx.fill();
                break;

            case 'rapid':
                // Double Triangle (Fast Forward)
                const tw = r * 0.6;
                const th = r * 0.5;
                // First triangle
                ctx.moveTo(-tw, -th); ctx.lineTo(0, 0); ctx.lineTo(-tw, th); ctx.closePath();
                // Second triangle
                ctx.moveTo(0, -th); ctx.lineTo(tw, 0); ctx.lineTo(0, th); ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = this.color;
                ctx.fill();
                break;

            case 'speed':
                // Lightning Bolt
                ctx.moveTo(r * 0.2, -r * 0.8);
                ctx.lineTo(-r * 0.4, r * 0.1);
                ctx.lineTo(r * 0.1, r * 0.1);
                ctx.lineTo(-r * 0.2, r * 0.8);
                ctx.lineTo(r * 0.4, -r * 0.1);
                ctx.lineTo(-r * 0.1, -r * 0.1);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = this.color;
                ctx.fill();
                break;

            case 'triple':
                // Triple Diamond Cluster
                for (let i = 0; i < 3; i++) {
                    const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
                    const dx = Math.cos(a) * r * 0.5;
                    const dy = Math.sin(a) * r * 0.5;
                    const dr = r * 0.4;
                    ctx.moveTo(dx, dy - dr);
                    ctx.lineTo(dx + dr * 0.7, dy);
                    ctx.lineTo(dx, dy + dr);
                    ctx.lineTo(dx - dr * 0.7, dy);
                    ctx.closePath();
                }
                ctx.stroke();
                ctx.fillStyle = this.color;
                ctx.fill();
                break;
        }

        ctx.restore();
    }
}

export class Portal {
    pos: Point;
    targetPos: Point;
    radius: number = 40;
    active: boolean = true;
    pulse: number = 0;
    color: string = '#00f2ff';
    id: string;

    constructor(x: number, y: number, tx: number, ty: number, color: string = '#00f2ff') {
        this.pos = { x, y };
        this.targetPos = { x: tx, y: ty };
        this.color = color;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    update() {
        this.pulse += 0.05;
    }

    draw(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        if (!this.active) return;
        const time = Date.now() / 1000;
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(scale, scale);

        if (quality !== 'low') {
            Lighting.drawGlow(ctx, 0, 0, this.radius * 2, this.color, 0.3);
            
            // Outer rotating ring
            ctx.save();
            ctx.rotate(time * 1.5);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Swirl effect
            ctx.save();
            ctx.rotate(-time * 3);
            for(let i=0; i<3; i++) {
                ctx.rotate(Math.PI * 2 / 3);
                ctx.beginPath();
                ctx.moveTo(this.radius * 0.2, 0);
                ctx.quadraticCurveTo(this.radius * 0.5, -this.radius * 0.5, this.radius * 0.8, 0);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.restore();
        }

        // Event Horizon
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        grad.addColorStop(0, '#000');
        grad.addColorStop(0.7, '#000');
        grad.addColorStop(1, this.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class SkinRenderer {
    private static textureCache: Map<string, HTMLImageElement> = new Map();
    private static bitmapCache: Map<string, HTMLCanvasElement> = new Map();

    private static getCacheKey(skin: Skin, radius: number, isHit: boolean, isSegment: boolean, quality: GraphicQuality): string {
        return `${skin.id}_${Math.round(radius)}_${isHit}_${isSegment}_${quality}`;
    }

    static draw(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, skin: Skin, quality: GraphicQuality, powerUps: any, hitTimer: number, isSegment: boolean = false) {
        const time = Date.now() / 1000;
        const pulse = quality === 'low' ? 1.0 : Math.sin(time * 5) * 0.1 + 0.9;
        const color = skin.color;
        const secondaryColor = skin.secondaryColor || Lighting.adjustBrightness(color, 40);
        const outlineColor = skin.outlineColor || '#000000';
        const highlightColor = skin.highlightColor || 'rgba(255, 255, 255, 0.5)';

        ctx.save();
        ctx.translate(x, y);
        
        // 1. Draw Aura (Only for head, optimized for quality)
        if (!isSegment && quality === 'high' && skin.aura && skin.aura !== 'none') {
            this.drawAura(ctx, radius, skin.aura, color, secondaryColor, time);
        }

        // 1.5 Draw Shield (Animated, so not cached)
        if (powerUps.shield > 0) {
            this.drawShield(ctx, radius, time);
        }

        // 2. Draw Body (Heavily cached)
        ctx.rotate(angle);
        const cacheKey = this.getCacheKey(skin, radius, hitTimer > 0, isSegment, quality);
        let cached = this.bitmapCache.get(cacheKey);
        
        if (!cached) {
            cached = document.createElement('canvas');
            const pad = radius * 1.0; 
            cached.width = (radius + pad) * 2;
            cached.height = (radius + pad) * 2;
            const cCtx = cached.getContext('2d')!;
            cCtx.translate(cached.width / 2, cached.height / 2);
            
            this.renderToCache(cCtx, radius, skin, secondaryColor, outlineColor, highlightColor, quality, hitTimer > 0);
            this.bitmapCache.set(cacheKey, cached);
        }
        
        // Pulse effect for the entire body
        if (quality !== 'low') {
            ctx.scale(pulse, pulse);
        }
        
        ctx.drawImage(cached, -cached.width/2, -cached.height/2);

        // 3. Dynamic Bloom/Shimmer (Only high quality, not cached as it's time-dependent)
        if (!isSegment && quality === 'high') {
            this.drawDynamicEffects(ctx, radius, skin, color, time);
        }

        ctx.restore();
    }

    private static renderToCache(ctx: CanvasRenderingContext2D, radius: number, skin: Skin, secondaryColor: string, outlineColor: string, highlightColor: string, quality: GraphicQuality, isHit: boolean) {
        const color = isHit ? '#ffffff' : skin.color;

        // 1. Static Glow/Shadow for Depth
        if (quality !== 'low') {
            ctx.shadowBlur = quality === 'high' ? 20 : 10;
            ctx.shadowColor = skin.glowColor;
        }

        // 2. Outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = quality === 'high' ? 6 : (quality === 'low' ? 1 : 3);
        ctx.lineJoin = 'round';
        this.drawShape(ctx, radius, skin.shape);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Complex Gradient Fill
        const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
        grad.addColorStop(0, highlightColor); 
        grad.addColorStop(0.3, Lighting.adjustBrightness(color, 20));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        this.drawShape(ctx, radius, skin.shape);
        ctx.fill();

        // 4. Pattern
        if (quality !== 'low' && skin.pattern && skin.pattern !== 'none') {
            ctx.save();
            ctx.clip();
            this.drawPattern(ctx, radius, skin.pattern, secondaryColor, 0); 
            ctx.restore();
        }

        // 5. Details
        if (skin.details && skin.details !== 'none' && quality !== 'low') {
            this.drawDetails(ctx, radius, skin.details, secondaryColor, 0);
        }
    }

    private static drawDynamicEffects(ctx: CanvasRenderingContext2D, radius: number, skin: Skin, color: string, time: number) {
        // Shimmer Sweep
        ctx.save();
        ctx.beginPath();
        this.drawShape(ctx, radius, skin.shape);
        ctx.clip();
        
        const shimmerTime = (time * 1.2) % 3; 
        if (shimmerTime < 0.8) {
            const sweepX = -radius * 3 + shimmerTime * radius * 8;
            const shimmerGrad = ctx.createLinearGradient(sweepX - radius, -radius, sweepX + radius, radius);
            shimmerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            shimmerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            shimmerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = shimmerGrad;
            ctx.fillRect(sweepX - radius, -radius * 2, radius * 2, radius * 4);
        }
        ctx.restore();

        // Energy Ripples
        for (let i = 0; i < 2; i++) {
            const rippleTime = (time * 0.8 + i * 0.5) % 1;
            const rippleRadius = radius * (1 + rippleTime * 0.6);
            ctx.beginPath();
            ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = (1 - rippleTime) * 0.3;
            ctx.stroke();
        }
    }

    private static drawEnergyRipples(ctx: CanvasRenderingContext2D, r: number, color: string, time: number) {
        ctx.save();
        for (let i = 0; i < 2; i++) {
            const rippleTime = (time + i * 0.5) % 1;
            const rippleRadius = r * (1 + rippleTime * 0.5);
            const alpha = 1 - rippleTime;
            ctx.beginPath();
            ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = alpha * 0.3;
            ctx.stroke();
        }
        ctx.restore();
    }

    private static drawShape(ctx: CanvasRenderingContext2D, r: number, shape: Skin['shape']) {
        ctx.beginPath();
        switch (shape) {
            case 'circle':
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                break;
            case 'hexagon':
                for (let i = 0; i < 6; i++) {
                    const ang = (i * Math.PI * 2) / 6;
                    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                break;
            case 'star':
                for (let i = 0; i < 10; i++) {
                    const ang = (i * Math.PI * 2) / 10;
                    const dist = i % 2 === 0 ? r : r * 0.5;
                    ctx.lineTo(Math.cos(ang) * dist, Math.sin(ang) * dist);
                }
                break;
            case 'octagon':
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2) / 8;
                    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                break;
            case 'diamond':
                ctx.moveTo(r, 0);
                ctx.lineTo(0, r * 1.2);
                ctx.lineTo(-r, 0);
                ctx.lineTo(0, -r * 1.2);
                break;
            case 'square':
                ctx.rect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
                break;
            case 'triangle':
                ctx.moveTo(r, 0);
                ctx.lineTo(-r * 0.8, r * 0.8);
                ctx.lineTo(-r * 0.8, -r * 0.8);
                break;
            case 'cross':
                const w = r * 0.4;
                ctx.rect(-r, -w, r * 2, w * 2);
                ctx.rect(-w, -r, w * 2, r * 2);
                break;
            case 'shield':
                ctx.moveTo(0, -r);
                ctx.quadraticCurveTo(r, -r, r, 0);
                ctx.quadraticCurveTo(r, r, 0, r * 1.2);
                ctx.quadraticCurveTo(-r, r, -r, 0);
                ctx.quadraticCurveTo(-r, -r, 0, -r);
                break;
            case 'gear':
                for (let i = 0; i < 16; i++) {
                    const ang = (i * Math.PI * 2) / 16;
                    const dist = i % 2 === 0 ? r : r * 0.8;
                    ctx.lineTo(Math.cos(ang) * dist, Math.sin(ang) * dist);
                }
                break;
            case 'heart':
                ctx.moveTo(0, r * 0.3);
                ctx.bezierCurveTo(0, -r, -r * 1.5, -r, -r * 1.5, r * 0.3);
                ctx.bezierCurveTo(-r * 1.5, r * 1.2, 0, r * 1.5, 0, r * 1.8);
                ctx.bezierCurveTo(0, r * 1.5, r * 1.5, r * 1.2, r * 1.5, r * 0.3);
                ctx.bezierCurveTo(r * 1.5, -r, 0, -r, 0, r * 0.3);
                break;
            case 'spiky':
                for (let i = 0; i < 24; i++) {
                    const ang = (i * Math.PI * 2) / 24;
                    const dist = i % 2 === 0 ? r : r * 0.6;
                    ctx.lineTo(Math.cos(ang) * dist, Math.sin(ang) * dist);
                }
                break;
            case 'crescent':
                ctx.arc(0, 0, r, Math.PI * 0.2, Math.PI * 1.8);
                ctx.quadraticCurveTo(r * 0.5, 0, r * 0.8, -r * 0.6);
                break;
        }
        ctx.closePath();
    }

    private static drawPattern(ctx: CanvasRenderingContext2D, r: number, pattern: Skin['pattern'], color: string, time: number) {
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        switch (pattern) {
            case 'stripes':
                for (let i = -r; i < r; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(i, -r);
                    ctx.lineTo(i + r, r);
                    ctx.stroke();
                }
                break;
            case 'dots':
                for (let x = -r; x < r; x += 15) {
                    for (let y = -r; y < r; y += 15) {
                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'grid':
                for (let i = -r; i < r; i += 12) {
                    ctx.beginPath();
                    ctx.moveTo(i, -r); ctx.lineTo(i, r);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(-r, i); ctx.lineTo(r, i);
                    ctx.stroke();
                }
                break;
            case 'waves':
                for (let i = -r; i < r; i += 10) {
                    ctx.beginPath();
                    for (let x = -r; x < r; x += 5) {
                        const y = i + Math.sin(x * 0.1 + time * 2) * 5;
                        if (x === -r) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
                break;
            case 'circuit':
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * r - r/2, Math.random() * r - r/2);
                    ctx.lineTo(Math.random() * r - r/2, Math.random() * r - r/2);
                    ctx.stroke();
                }
                break;
            case 'checkered':
                const size = 10;
                for (let x = -r; x < r; x += size * 2) {
                    for (let y = -r; y < r; y += size * 2) {
                        ctx.fillRect(x, y, size, size);
                        ctx.fillRect(x + size, y + size, size, size);
                    }
                }
                break;
            case 'stars':
                for (let i = 0; i < 10; i++) {
                    const x = Math.random() * r * 2 - r;
                    const y = Math.random() * r * 2 - r;
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'hex':
                const h = 10;
                for (let x = -r; x < r; x += h * 1.5) {
                    for (let y = -r; y < r; y += h * Math.sqrt(3)) {
                        const ox = (Math.floor(y / (h * Math.sqrt(3))) % 2) * h * 0.75;
                        ctx.beginPath();
                        for (let a = 0; a < 6; a++) {
                            const ang = (a * Math.PI * 2) / 6;
                            ctx.lineTo(x + ox + Math.cos(ang) * h * 0.5, y + Math.sin(ang) * h * 0.5);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                break;
            case 'constellation':
                ctx.lineWidth = 1;
                const points = [];
                for (let i = 0; i < 6; i++) {
                    points.push({
                        x: (Math.random() - 0.5) * r * 1.5,
                        y: (Math.random() - 0.5) * r * 1.5
                    });
                }
                ctx.beginPath();
                for (let i = 0; i < points.length; i++) {
                    const p1 = points[i];
                    const p2 = points[(i + 1) % points.length];
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.arc(p1.x, p1.y, 1.5, 0, Math.PI * 2);
                }
                ctx.stroke();
                break;
            case 'galaxy':
                ctx.save();
                ctx.rotate(time);
                for (let i = 0; i < 3; i++) {
                    ctx.rotate((Math.PI * 2) / 3);
                    ctx.beginPath();
                    ctx.ellipse(r * 0.4, 0, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
                break;
        }
        ctx.globalAlpha = 1.0;
    }

    private static drawAura(ctx: CanvasRenderingContext2D, r: number, aura: Skin['aura'], color: string, secondaryColor: string, time: number) {
        const auraSize = r * 2.5;
        ctx.save();
        
        switch (aura) {
            case 'fire':
                for (let i = 0; i < 12; i++) {
                    const ang = time * 2 + (i * Math.PI * 2) / 12;
                    const dist = r * 1.2 + Math.sin(time * 10 + i) * 15;
                    const x = Math.cos(ang) * dist;
                    const y = Math.sin(ang) * dist;
                    Lighting.drawGlow(ctx, x, y, 20, '#ff4d00', 0.4);
                }
                break;
            case 'electric':
                ctx.strokeStyle = '#00f2ff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    const ang = time * 5 + (i * Math.PI * 2) / 6;
                    for (let j = 0; j < 6; j++) {
                        const dist = r + j * 12;
                        const nx = Math.cos(ang + (Math.random() - 0.5) * 0.8) * dist;
                        const ny = Math.sin(ang + (Math.random() - 0.5) * 0.8) * dist;
                        if (j === 0) ctx.moveTo(nx, ny);
                        else ctx.lineTo(nx, ny);
                    }
                    ctx.stroke();
                }
                break;
            case 'ghost':
                ctx.globalAlpha = 0.15;
                for (let i = 1; i <= 4; i++) {
                    const offset = Math.sin(time * 3 + i) * 10;
                    ctx.beginPath();
                    ctx.arc(offset, offset, r * (1 + i * 0.2), 0, Math.PI * 2);
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
                break;
            case 'portal':
                ctx.rotate(time * 3);
                const grad = ctx.createRadialGradient(0, 0, r, 0, 0, auraSize);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'rainbow':
                const hue = (time * 100) % 360;
                Lighting.drawGlow(ctx, 0, 0, auraSize * 1.8, `hsl(${hue}, 100%, 50%)`, 0.3);
                break;
            case 'void':
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
                ctx.fill();
                for (let i = 0; i < 8; i++) {
                    const ang = time * -2 + (i * Math.PI * 2) / 8;
                    const x = Math.cos(ang) * auraSize;
                    const y = Math.sin(ang) * auraSize;
                    Lighting.drawGlow(ctx, x, y, 25, '#bc13fe', 0.3);
                }
                break;
            case 'nature':
                for (let i = 0; i < 10; i++) {
                    const ang = time + (i * Math.PI * 2) / 10;
                    const x = Math.cos(ang) * (r * 1.5);
                    const y = Math.sin(ang) * (r * 1.5);
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.ellipse(x, y, 8, 4, ang, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'frost':
                ctx.strokeStyle = '#00f2ff';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const ang = (i * Math.PI * 2) / 6;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(ang) * auraSize, Math.sin(ang) * auraSize);
                    ctx.stroke();
                }
                break;
            case 'cosmic':
                for (let i = 0; i < 20; i++) {
                    const ang = time * 0.5 + (i * Math.PI * 2) / 20;
                    const dist = r * 1.5 + Math.sin(time * 2 + i) * 10;
                    const x = Math.cos(ang) * dist;
                    const y = Math.sin(ang) * dist;
                    const size = 1 + Math.sin(time * 5 + i) * 1;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    if (i % 4 === 0) Lighting.drawGlow(ctx, x, y, 15, color, 0.2);
                }
                break;
            case 'nebula':
                const g = ctx.createRadialGradient(0, 0, r, 0, 0, auraSize * 1.5);
                g.addColorStop(0, 'transparent');
                g.addColorStop(0.3, `${color}44`);
                g.addColorStop(0.6, `${secondaryColor}22`);
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, auraSize * 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'astral':
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 10]);
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r * (1.5 + i * 0.5), time * (i + 1), time * (i + 1) + Math.PI);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
                break;
        }
        ctx.restore();
    }

    private static drawShield(ctx: CanvasRenderingContext2D, r: number, time: number) {
        ctx.save();
        ctx.rotate(time * 2);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.restore();
        
        ctx.fillStyle = 'rgba(0, 242, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
        ctx.fill();
    }

    private static drawDetails(ctx: CanvasRenderingContext2D, r: number, details: Skin['details'], color: string, time: number) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        switch (details) {
            case 'core':
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            case 'rings':
                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r * (0.4 + i * 0.2), 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'spikes':
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2) / 8;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
                    ctx.lineTo(Math.cos(ang) * (r * 1.3), Math.sin(ang) * (r * 1.3));
                    ctx.stroke();
                }
                break;
            case 'circuit':
                ctx.beginPath();
                ctx.rect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.4); ctx.lineTo(0, -r * 0.8);
                ctx.moveTo(0, r * 0.4); ctx.lineTo(0, r * 0.8);
                ctx.stroke();
                break;
            case 'double':
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'triple':
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r * (0.3 + i * 0.2), 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'ornate':
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                for (let i = 0; i < 4; i++) {
                    const ang = (i * Math.PI * 2) / 4;
                    ctx.beginPath();
                    ctx.arc(Math.cos(ang) * r * 0.7, Math.sin(ang) * r * 0.7, r * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 'eyes':
                const eyeX = r * 0.3;
                const eyeY = -r * 0.2;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(eyeX, eyeY, r * 0.15, 0, Math.PI * 2);
                ctx.arc(-eyeX, eyeY, r * 0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(eyeX + 1, eyeY - 1, r * 0.05, 0, Math.PI * 2);
                ctx.arc(-eyeX + 1, eyeY - 1, r * 0.05, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'crown':
                ctx.fillStyle = '#ffea00';
                ctx.beginPath();
                ctx.moveTo(-r * 0.6, -r * 0.8);
                ctx.lineTo(-r * 0.4, -r * 1.2);
                ctx.lineTo(-r * 0.2, -r * 0.9);
                ctx.lineTo(0, -r * 1.3);
                ctx.lineTo(r * 0.2, -r * 0.9);
                ctx.lineTo(r * 0.4, -r * 1.2);
                ctx.lineTo(r * 0.6, -r * 0.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 'wings':
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.ellipse(-r * 1.2, 0, r * 0.8, r * 0.4, -Math.PI / 6, 0, Math.PI * 2);
                ctx.ellipse(r * 1.2, 0, r * 0.8, r * 0.4, Math.PI / 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
            case 'satellites':
                for (let i = 0; i < 3; i++) {
                    const ang = time * 2 + (i * Math.PI * 2) / 3;
                    const x = Math.cos(ang) * r * 1.8;
                    const y = Math.sin(ang) * r * 1.8;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 'orbit':
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 2, r * 0.8, time * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                const ox = Math.cos(time * 3) * r * 2;
                const oy = Math.sin(time * 3) * r * 0.8;
                // Rotate point by ellipse angle
                const rot = time * 0.5;
                const rx = ox * Math.cos(rot) - oy * Math.sin(rot);
                const ry = ox * Math.sin(rot) + oy * Math.cos(rot);
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(rx, ry, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;
        }
    }
}

export class Player {
    pos: Point;
    vel: Point;
    radius: number;
    speed: number;
    friction: number;
    color: string;
    glowColor: string;
    angle: number;
    shootCooldown: number = 0;
    maxShootCooldown: number = 200; // ms
    lives: number = 3;
    ammo: number = 2;
    nickname: string = '';
    trophies: number = 0;
    trail: Trail;
    loadingTrail: boolean = false;
    level: number = 1;
    skinId: number | string = 1;
    killsToNextLevel: number = 5;
    hitTimer: number = 0;
    status: 'alive' | 'dead' | 'spectator' = 'alive';
    team: 'A' | 'B' | 'none' = 'none';
    isMobile: boolean = false;
    path: { x: number, y: number, angle: number }[] = [];
    segmentSpacing: number = 10;
    totalSegments: number = 15;
    
    // Mobile Aim Indicator properties
    private aimPulse: number = 0;
    
    powerUps: {
        shield: number;
        rapid: number;
        speed: number;
        triple: number;
    } = { shield: 0, rapid: 0, speed: 0, triple: 0 };

    constructor(x: number, y: number) {
        this.pos = { x, y };
        this.vel = { x: 0, y: 0 };
        this.radius = 25;
        this.speed = 0.8;
        this.friction = 0.92;
        this.color = '#bc13fe'; // Neon Purple
        this.glowColor = '#bc13fe';
        this.angle = 0;
        
        // Increased trail length and density for sub-stepped fluidity
        // 20 segments * 4 substeps = 80 points for extreme smoothness
        this.trail = new Trail(80, 'rgba(188, 19, 254, 0.3)', 20);
    }

    canShoot(time: number): boolean {
        return time > this.shootCooldown && this.ammo > 0;
    }

    shoot(time: number, target: Point): number | null {
        if (!this.canShoot(time)) return null;

        this.ammo--;
        this.shootCooldown = time + this.maxShootCooldown;
        const angle = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);
        
        triggerGameSfx('shoot');

        // Mobile Haptic Feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
        
        this.vel.x -= Math.cos(angle) * 2;
        this.vel.y -= Math.sin(angle) * 2;

        return angle;
    }

    update(input: { x: number, y: number }, bounds: { width: number, height: number }, dt: number, camera?: { x: number, y: number, scale: number, w: number, h: number }) {
        if (this.status !== 'alive') {
            this.vel.x = 0;
            this.vel.y = 0;
            return;
        }
        if (this.hitTimer > 0) this.hitTimer -= dt;
        const factor = dt / 16;
        const speedMult = this.powerUps.speed > 0 ? 1.5 : 1;
        
        this.vel.x += input.x * this.speed * speedMult * factor;
        this.vel.y += input.y * this.speed * speedMult * factor;

        this.vel.x *= Math.pow(this.friction, factor);
        this.vel.y *= Math.pow(this.friction, factor);

        this.pos.x += this.vel.x * factor;
        this.pos.y += this.vel.y * factor;
        this.trail.update(this.pos.x, this.pos.y);

        // Ensure head is always the first point in path
        this.path[0] = { x: this.pos.x, y: this.pos.y, angle: this.angle };

        // Update Path for Snake-like movement (Slither.io style)
        const isSnake = this.skinId === 'cobra' || String(this.skinId).toLowerCase().includes('viper');
        if (isSnake) {
            const lastRec = this.path[1];
            const distSinceLast = lastRec ? Math.hypot(this.pos.x - lastRec.x, this.pos.y - lastRec.y) : 999;

            // Optimized sampling frequency for mobile to prevent memory pressure
            const samplingThreshold = this.isMobile ? 1.8 : 0.8;
            if (distSinceLast > samplingThreshold) {
                this.path.unshift({ 
                    x: this.pos.x, 
                    y: this.pos.y, 
                    angle: this.angle 
                });
                
                // Limit path length to slightly more than needed for totalSegments
                const segmentsToKeep = this.totalSegments + 5;
                const samplesPerSegment = Math.ceil(this.segmentSpacing / samplingThreshold);
                const maxPath = segmentsToKeep * samplesPerSegment;
                if (this.path.length > maxPath) {
                    this.path.pop();
                }
            }
        }

        // Update power-up timers
        this.powerUps.shield = Math.max(0, this.powerUps.shield - dt);
        this.powerUps.rapid = Math.max(0, this.powerUps.rapid - dt);
        this.powerUps.speed = Math.max(0, this.powerUps.speed - dt);
        this.powerUps.triple = Math.max(0, this.powerUps.triple - dt);

        if (Math.abs(this.vel.x) > 0.05 || Math.abs(this.vel.y) > 0.05) {
            const targetAngle = Math.atan2(this.vel.y, this.vel.x);
            // Smoothly interpolate angle to avoid jittery rotations
            let diff = targetAngle - this.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.angle += diff * Math.min(1.0, 0.4 * factor);
        }

        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.vel.x *= -0.5;
        }
        if (this.pos.x > bounds.width - this.radius) {
            this.pos.x = bounds.width - this.radius;
            this.vel.x *= -0.5;
        }
        if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.vel.y *= -0.5;
        }
        if (this.pos.y > bounds.height - this.radius) {
            this.pos.y = bounds.height - this.radius;
            this.vel.y *= -0.5;
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number, w: number, h: number }, quality: GraphicQuality = 'high') {
        if (quality === 'low') {
            const skin = SKINS.find(s => s.id === this.skinId) || SKINS[0];
            SkinRenderer.draw(ctx, this.pos.x, this.pos.y, this.radius, this.angle, skin, quality, this.powerUps, this.hitTimer);
            this.drawNickname(ctx, quality);
            return;
        }

        // 1. Draw Active Trail
        this.trail.draw(ctx, quality);

        // 2. Draw Head (With Squash & Stretch)
        const skin = SKINS.find(s => s.id === this.skinId) || SKINS[0];
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        let stretch = Math.min(0.25, speed * 0.025);
        let squash = stretch * 0.6;
        
        if (speed < 0.1) {
            const pulse = Math.sin(Date.now() / 300) * 0.05;
            stretch = pulse;
            squash = -pulse;
        }

        // 3. Draw Mobile Aim Indicator (Requested: Mira que segue o analógico)
        if (this.isMobile && this.status === 'alive') {
            this.drawAimIndicator(ctx);
        }

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.scale(1 + stretch, 1 - squash);
        
        SkinRenderer.draw(ctx, 0, 0, this.radius, 0, skin, quality, this.powerUps, this.hitTimer);
        ctx.restore();
        
        this.drawNickname(ctx, quality);
    }

    private drawNickname(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        if (!this.nickname) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        const text = this.nickname;
        ctx.font = 'bold 14px "Space Grotesk", sans-serif';
        
        if (quality !== 'low') {
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.roundRect(this.pos.x - textWidth / 2 - 8, this.pos.y - this.radius - 52, textWidth + 16, 22, 5);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(text, this.pos.x, this.pos.y - this.radius - 36);
            
            ctx.fillStyle = '#ffea00';
            ctx.font = 'bold 12px "JetBrains Mono", monospace';
            ctx.fillText(`🏆 ${this.trophies}`, this.pos.x, this.pos.y - this.radius - 18);
        } else {
            // Stripped down UI for low quality
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(text, this.pos.x, this.pos.y - this.radius - 20);
        }
        
        ctx.restore();
    }

    private drawAimIndicator(ctx: CanvasRenderingContext2D) {
        this.aimPulse += 0.05;
        const pulse = Math.sin(this.aimPulse) * 10;
        const lineLen = 140 + pulse;
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        // Draw dashed guide line
        ctx.beginPath();
        ctx.setLineDash([8, 6]);
        ctx.moveTo(this.radius + 15, 0);
        ctx.lineTo(this.radius + lineLen, 0);
        
        // Dynamic gradient for the aim line
        const grad = ctx.createLinearGradient(this.radius + 15, 0, this.radius + lineLen, 0);
        grad.addColorStop(0, 'rgba(0, 242, 255, 0.5)');
        grad.addColorStop(1, 'rgba(0, 242, 255, 0.0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw crosshair at the end
        ctx.setLineDash([]);
        ctx.translate(this.radius + lineLen + 20, 0);
        ctx.rotate(-this.angle); // Keep crosshair upright
        
        const cs = 12; // Crosshair size
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -cs);
        ctx.lineTo(0, cs);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(-cs, 0);
        ctx.lineTo(cs, 0);
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.fill();
        
        ctx.restore();
    }

    private drawBodySegments(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        // Method cleared as per user request to remove segment visuals (beads/spine)
        // keeping logic for future path-based mechanics if needed
    }
}

export class Bot extends Player {
    shootTimer: number = 0;
    type: 'basic' | 'advanced' | 'boss' | 'super_boss' = 'basic';
    health: number = 1;
    maxHealth: number = 1;
    isDead: boolean = false;
    aiTimer: number = 0;
    botLevel: number = 1;
    
    constructor(x: number, y: number, level: number) {
        super(x, y);
        this.botLevel = level;
        this.radius = 20;
        this.speed = 0.3 + (level * 0.03);
        this.color = '#ff4d00'; // Neon Orange
        this.glowColor = '#ff4d00';
        this.trail.color = 'rgba(255, 77, 0, 0.3)';
        
        // Intelligent form change based on level
        if (level === 50) {
            this.type = 'super_boss';
            this.radius = 120;
            this.speed = 0.2;
            this.health = 500;
            this.maxHealth = 500;
            this.color = '#ff00ff'; // Neon Pink / Magenta
            this.glowColor = '#ff00ff';
            this.trail.color = 'rgba(255, 0, 255, 0.3)';
        } else if (level >= 5 && level % 5 === 0) {
            this.type = 'boss';
            this.radius = 50 + (level * 2);
            this.speed = 0.15;
            this.health = 15 + (level * 3);
            this.maxHealth = this.health;
            this.color = '#ff0000';
            this.glowColor = '#ff0000';
            this.trail.color = 'rgba(255, 0, 0, 0.3)';
        } else if (level >= 3) {
            this.type = 'advanced';
            this.radius = 22;
            this.speed = 0.5;
            this.health = 2 + Math.floor(level / 4);
            this.maxHealth = this.health;
            this.color = '#00ff00';
            this.glowColor = '#00ff00';
            this.trail.color = 'rgba(0, 255, 0, 0.3)';
        }
    }

    updateAI(player: Player, dt: number, projectilePool: ProjectilePool, bounds: { width: number, height: number }, camera?: { x: number, y: number, scale: number, w: number, h: number }, onShoot?: (p: Projectile) => void) {
        if (this.isDead) return;

        // Skip expensive AI for bots far off-screen to save CPU on mobile
        if (camera) {
            const margin = 300; // Large margin to allow some movement
            const isVisible = (
                this.pos.x > camera.x - camera.w/2 - margin && 
                this.pos.x < camera.x + camera.w/2 + margin &&
                this.pos.y > camera.y - camera.h/2 - margin &&
                this.pos.y < camera.y + camera.h/2 + margin
            );
            
            if (!isVisible) {
                // Minimum movement when off-screen
                const dx = player.pos.x - this.pos.x;
                const dy = player.pos.y - this.pos.y;
                const angleToPlayer = Math.atan2(dy, dx);
                this.pos.x += Math.cos(angleToPlayer) * (this.speed * 4) * (dt / 16);
                this.pos.y += Math.sin(angleToPlayer) * (this.speed * 4) * (dt / 16);
                this.angle = angleToPlayer;
                return;
            }
        }

        this.aiTimer += dt;
        
        // Movement AI
        const dx = player.pos.x - this.pos.x;
        const dy = player.pos.y - this.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const input = { x: 0, y: 0 };
        
        // Predictive Aiming: Aim where player is going
        const projectileSpeed = 5; // Approximate speed
        const timeToHit = dist / projectileSpeed;
        const predictedX = player.pos.x + player.vel.x * timeToHit * 0.5;
        const predictedY = player.pos.y + player.vel.y * timeToHit * 0.5;
        
        this.angle = Math.atan2(predictedY - this.pos.y, predictedX - this.pos.x);

        const idealDist = this.type === 'super_boss' ? 400 : (this.type === 'boss' ? 350 : 220);
        
        // Dodge Logic: Check for nearby projectiles (Optimized Loop)
        let dodgeX = 0;
        let dodgeY = 0;
        const activeProjectiles = projectilePool.getActive();
        const checkLimit = this.type === 'boss' || this.type === 'super_boss' ? 40 : 15;
        let checkCount = 0;
        
        for (const p of activeProjectiles) {
            if (p.owner === 'bot') continue;
            
            const pdx = p.pos.x - this.pos.x;
            const pdy = p.pos.y - this.pos.y;
            // Early dist check before squaring
            if (Math.abs(pdx) > 200 || Math.abs(pdy) > 200) continue;
            
            checkCount++;
            if (checkCount > checkLimit) break;

            const pdistSq = pdx * pdx + pdy * pdy;
            const dodgeRange = (this.type === 'super_boss' ? 300 : 150);
            if (pdistSq < dodgeRange * dodgeRange) {
                // Move perpendicular to projectile
                dodgeX -= pdy;
                dodgeY += pdx;
            }
        }

        if (dodgeX !== 0 || dodgeY !== 0) {
            const mag = Math.sqrt(dodgeX * dodgeX + dodgeY * dodgeY);
            input.x = dodgeX / mag;
            input.y = dodgeY / mag;
        } else if (dist > idealDist + 40) {
            input.x = Math.cos(this.angle);
            input.y = Math.sin(this.angle);
        } else if (dist < idealDist - 40) {
            input.x = -Math.cos(this.angle);
            input.y = -Math.sin(this.angle);
        } else {
            // Strafe with occasional direction change
            const strafeFreq = this.type === 'super_boss' ? 0.005 : 0.002;
            const strafeDir = Math.sin(this.aiTimer * strafeFreq) > 0 ? 1 : -1;
            const strafeAngle = this.angle + (Math.PI / 2) * strafeDir;
            input.x = Math.cos(strafeAngle);
            input.y = Math.sin(strafeAngle);
        }

        this.update(input, bounds, dt, camera);

        // Shooting AI
        this.shootTimer += dt;
        let shootInterval = this.type === 'boss' ? 600 : 2200 - (this.botLevel * 120);
        if (this.type === 'super_boss') shootInterval = 400;
        
        if (this.shootTimer >= Math.max(200, shootInterval)) {
            const spawnProjectile = (ang: number) => {
                const p = projectilePool.spawn(this.pos.x, this.pos.y, ang, 'remote', 'bot');
                if (p) {
                    p.color = this.color;
                    p.glowColor = this.glowColor;
                    if (onShoot) onShoot(p);
                }
            };

            if (this.type === 'super_boss') {
                // Spiral pattern
                const spiralAngle = (this.aiTimer * 0.005) % (Math.PI * 2);
                for (let i = 0; i < 8; i++) {
                    spawnProjectile(spiralAngle + (i * Math.PI * 2) / 8);
                }
            } else {
                spawnProjectile(this.angle);
                if (this.type === 'boss') {
                    const spread = 0.25;
                    spawnProjectile(this.angle - spread);
                    spawnProjectile(this.angle + spread);
                    spawnProjectile(this.angle - spread * 2);
                    spawnProjectile(this.angle + spread * 2);
                } else if (this.type === 'advanced' && Math.random() < 0.4) {
                    spawnProjectile(this.angle - 0.15);
                    spawnProjectile(this.angle + 0.15);
                }
            }

            this.shootTimer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number, w: number, h: number }, quality: GraphicQuality) {
        if (this.isDead) return;
        super.draw(ctx, camera, quality);
        
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 6) * 0.15 + 0.85;
        const color = this.color;
        const glowColor = this.glowColor;

        if (quality !== 'low') {
            Lighting.drawGlow(ctx, this.pos.x, this.pos.y, this.radius * 3.5, glowColor, 0.2 * pulse);
        }

        // Squash and stretch based on velocity
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        const stretch = Math.min(0.2, speed * 0.025);
        const squash = stretch * 0.6;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.scale(1 + stretch, 1 - squash);
        ctx.rotate(-this.angle);

        // Nested save for the actual drawing translated to 0,0
        ctx.save();

        // Hit effect (flash white)
        if (this.hitTimer > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.8, this.hitTimer / 100)})`;
            ctx.rotate(this.angle);
            this.drawBotShape(ctx);
            ctx.fill();
            ctx.restore();
        }

        // Bold Outline (Brawl Stars style)
        if (quality !== 'low') {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = quality === 'high' ? 5 : 3;
            ctx.lineJoin = 'round';
            ctx.save();
            ctx.rotate(this.angle);
            this.drawBotShape(ctx);
            ctx.stroke();
            ctx.restore();
        }

        ctx.rotate(this.angle);

        // Fill with Gradient
        const grad = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 0, 0, 0, this.radius);
        grad.addColorStop(0, Lighting.adjustBrightness(color, 40));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        this.drawBotShape(ctx);
        ctx.fill();

        // Tech Details
        if (quality !== 'low') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            this.drawBotDetails(ctx, time);
        }

        ctx.restore();
        ctx.restore();
        
        // Draw health bar
        if (this.health < this.maxHealth || this.type === 'boss' || this.type === 'super_boss') {
            this.drawHealthBar(ctx, quality);
        }
    }

    private drawBotShape(ctx: CanvasRenderingContext2D) {
        const r = this.radius;
        ctx.beginPath();
        switch (this.type) {
            case 'super_boss':
                for (let i = 0; i < 16; i++) {
                    const ang = (i * Math.PI * 2) / 16;
                    const d = i % 2 === 0 ? r : r * 0.8;
                    ctx.lineTo(Math.cos(ang) * d, Math.sin(ang) * d);
                }
                break;
            case 'boss':
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2) / 8;
                    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                break;
            case 'advanced':
                ctx.moveTo(r, 0);
                ctx.lineTo(-r * 0.6, r * 0.8);
                ctx.lineTo(-r * 0.3, 0);
                ctx.lineTo(-r * 0.6, -r * 0.8);
                break;
            default:
                const sides = 3 + (this.botLevel % 5);
                for (let i = 0; i < sides; i++) {
                    const ang = (i * Math.PI * 2) / sides;
                    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                break;
        }
        ctx.closePath();
    }

    private drawBotDetails(ctx: CanvasRenderingContext2D, time: number) {
        const r = this.radius;
        switch (this.type) {
            case 'super_boss':
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'boss':
                ctx.strokeRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);
                break;
            case 'advanced':
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.4);
                ctx.lineTo(0, r * 0.4);
                ctx.stroke();
                break;
            default:
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    }

    private drawHealthBar(ctx: CanvasRenderingContext2D, quality: GraphicQuality) {
        const barWidth = this.radius * 2.5;
        const barHeight = quality === 'low' ? 4 : 6;
        const x = this.pos.x - barWidth / 2;
        const y = this.pos.y - this.radius - 20;
        
        if (quality !== 'low') {
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.roundRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 3);
            ctx.fill();
        }
        
        // Fill
        const healthPerc = this.health / this.maxHealth;
        const barColor = healthPerc > 0.5 ? '#22c55e' : (healthPerc > 0.2 ? '#eab308' : '#ef4444');
        ctx.fillStyle = barColor;
        
        if (quality !== 'low') {
            ctx.roundRect(x, y, barWidth * healthPerc, barHeight, 2);
        } else {
            ctx.fillRect(x, y, barWidth * healthPerc, barHeight);
        }
        ctx.fill();

        if (quality !== 'low' && (this.type === 'boss' || this.type === 'super_boss')) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.type === 'super_boss' ? 'ANNIHILATOR' : 'COMMANDER', this.pos.x, y - 8);
        }
    }
}

export class RemotePlayer extends Player {
    uid: string;
    nickname: string;
    trophies: number;
    targetPos: Point;
    targetVel: Point;
    targetAngle: number = 0;
    lerpFactor: number = 0.1; // Smoother lerp
    lastUpdateTime: number = 0;

    constructor(uid: string, nickname: string, trophies: number, x: number, y: number) {
        super(x, y);
        this.uid = uid;
        this.nickname = nickname;
        this.trophies = trophies;
        this.color = '#00f2ff'; // Cyan for remote players
        this.targetPos = { x, y };
        this.targetVel = { x: 0, y: 0 };
        this.lastUpdateTime = Date.now();
    }

    updateFromRemote(data: any) {
        if (!data) return;
        if (data.pos) {
            this.targetPos = data.pos;
        }
        if (data.vel) {
            this.targetVel = data.vel;
        }
        if (data.angle !== undefined) this.targetAngle = data.angle;
        if (data.lives !== undefined) this.lives = data.lives;
        if (data.ammo !== undefined) this.ammo = data.ammo;
        if (data.nickname) this.nickname = data.nickname;
        if (data.trophies !== undefined) this.trophies = data.trophies;
        if (data.skinId !== undefined) this.skinId = data.skinId;
        this.lastUpdateTime = Date.now();
    }

    updateInterpolation(dt: number, camera?: { x: number, y: number, scale: number, w: number, h: number }) {
        // Dead Reckoning: Predict where the player should be based on their last known velocity
        const now = Date.now();
        const timeSinceUpdate = (now - this.lastUpdateTime) / 16; // in frames (approx 60fps)
        
        // Cap prediction to 15 frames (approx 250ms) for tighter control
        const predictionFrames = Math.min(15, timeSinceUpdate);
        
        // Defensive check: ensure targetPos and targetVel exist
        if (!this.targetPos || !this.targetVel) return;

        // Predicted target position
        const predictedX = this.targetPos.x + this.targetVel.x * predictionFrames;
        const predictedY = this.targetPos.y + this.targetVel.y * predictionFrames;

        // Dynamic lerp factor: if distance is large, move faster to catch up
        const dx = predictedX - this.pos.x;
        const dy = predictedY - this.pos.y;
        const distSq = dx * dx + dy * dy;
        
        // Adaptive lerp factor for ultra-fluid movement
        let dynamicLerp = 0.15; // Increased base lerp
        if (distSq > 1600) dynamicLerp = 0.35; // > 40px
        if (distSq > 6400) dynamicLerp = 0.6;  // > 80px
        if (distSq > 22500) { // > 150px - snap to prevent desync
            this.pos.x = predictedX;
            this.pos.y = predictedY;
            return;
        }

        // Smoothly interpolate towards predicted target position
        // Using a time-corrected lerp factor for consistency
        const factor = 1 - Math.pow(1 - dynamicLerp, dt / 16);
        
        this.pos.x += dx * factor;
        this.pos.y += dy * factor;
        
        this.vel.x += (this.targetVel.x - this.vel.x) * factor;
        this.vel.y += (this.targetVel.y - this.vel.y) * factor;

        // Interpolate angle
        let diff = this.targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.angle += diff * factor;

        this.trail.update(this.pos.x, this.pos.y);
    }
}

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 4000;
export const TARGET_FOV_WIDTH = 1400; // World units visible horizontally

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    player: Player;
    cameraPos: Point = { x: 0, y: 0 };
    cameraScale: number = 1;
    targetCameraScale: number = 1;
    cameraLerp: number = 0.15;
    remotePlayers: Map<string, RemotePlayer> = new Map();
    projectilePool: ProjectilePool;
    pool: ParticlePool;
    shake: ScreenShake;
    flash: FlashEffect;
    shockwaves: Shockwave[] = [];
    hitMarkers: HitMarker[] = [];
    hitStop: number = 0;
    stars: Star[] = [];
    bots: Bot[] = [];
    quality: GraphicQuality = 'high';
    keys: { [key: string]: boolean } = {};
    joystickInput: Point = { x: 0, y: 0 };
    gridOffset: number = 0;
    lastTime: number = 0;
    isShooting: boolean = false;
    shootTimer: number = 0;
    shootInterval: number = 200; // ms
    mousePos: Point = { x: 0, y: 0 };
    paused: boolean = false;
    gameOver: boolean = false;
    isMultiplayer: boolean = false;
    isHost: boolean = false;
    isMobile: boolean = false;
    performanceMode: boolean = false;
    pixelRatio: number = 1;
    isRunning: boolean = false;
    currentTargetPos: Point | null = null;
    currentTargetId: string | null = null;
    onStarCollected?: (index?: number) => void;
    onBotKilled?: (type: string) => void;
    onGameOver?: () => void;
    onShoot?: (projectile: Projectile) => void;
    onStarUpdate?: (stars: any[]) => void;
    onPlayerHit?: (victimId: string, damage: number, killerId: string) => void;
    onLevelUp?: (level: number) => void;
    onPowerUpCollected?: (type: string) => void;
    onSyncNetwork?: () => void;
    onGameStateChange?: (state: GameState) => void;
    onLoadingUpdate?: (progress: number) => void;
    onVictory?: () => void;
    gameState: GameState = 'playing';
    transitionTimer: number = 0;
    loadingTimer: number = 0;
    loadingProgress: number = 0;
    starSpawnTimer: number = 0;
    kills: number = 0; // Kills in current level
    totalKills: number = 0; // Cumulative kills
    level: number = 1;
    killsToNextLevel: number = 5;
    powerUps: PowerUp[] = [];
    portals: Portal[] = [];
    fps: number = 60;
    fpsHistory: number[] = [];
    startTime: number = 0;

    gridPattern: CanvasPattern | null = null;
    gridCanvas: HTMLCanvasElement | null = null;
    lastGridLevel: number = -1;
    parallaxStars: { x: number, y: number, size: number, speed: number, color: string }[] = [];
    spaceDust: { x: number, y: number, vx: number, vy: number, size: number, color: string }[] = [];

    // Performance: Spatial Partitioning
    private spatialGrid: (Bot | Player)[][][] = [];
    private spatialCellSize: number = 400; 
    
    // Performance: Fixed Timestep Accumulator
    private accumulator: number = 0;
    private fixedDt: number = 1000 / 60; 
    private maxAccumulator: number = 200;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!; 
        
        // Initialize spatial grid
        const gridCols = Math.ceil(WORLD_WIDTH / this.spatialCellSize);
        const gridRows = Math.ceil(WORLD_HEIGHT / this.spatialCellSize);
        this.spatialGrid = Array.from({ length: gridCols }, () => 
            Array.from({ length: gridRows }, () => [])
        );
        
        // Set isMobile early for use in later initializations
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Performance optimization: Lower resolution for mobile to improve fill-rate
        this.pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio;

        // Ensure canvas has dimensions before initializing player
        if (canvas.width === 0 || canvas.height === 0) {
            this.resize();
        }
        
        this.player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        this.player.isMobile = this.isMobile;
        this.cameraPos = { x: this.player.pos.x, y: this.player.pos.y };
        this.projectilePool = new ProjectilePool(this.isMobile ? 50 : 100);
        this.pool = new ParticlePool(this.isMobile ? 200 : 500);
        this.shake = new ScreenShake();
        this.flash = new FlashEffect();
        this.shockwaves = Array.from({ length: 10 }, () => new Shockwave());
        this.hitMarkers = Array.from({ length: 20 }, () => new HitMarker());
        this.powerUps = Array.from({ length: 15 }, () => new PowerUp());
        this.portals = [];

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('blur', () => {
            this.keys = {};
            this.isShooting = false;
            this.joystickInput = { x: 0, y: 0 };
        });
        
        this.loop = this.loop.bind(this);
        this.initUltraEffects();
    }

    private initUltraEffects() {
        this.parallaxStars = [];
        for (let i = 0; i < 300; i++) {
            this.parallaxStars.push({
                x: Math.random() * WORLD_WIDTH,
                y: Math.random() * WORLD_HEIGHT,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.4 + 0.1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
            });
        }
        
        this.spaceDust = [];
        for (let i = 0; i < 100; i++) {
            this.spaceDust.push({
                x: Math.random() * WORLD_WIDTH,
                y: Math.random() * WORLD_HEIGHT,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: Math.random() * 2 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`
            });
        }
    }

    reset() {
        this.player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        this.cameraPos = { x: this.player.pos.x, y: this.player.pos.y };
        this.projectilePool = new ProjectilePool(100);
        this.pool = new ParticlePool(500);
        this.stars = [];
        this.bots = [];
        this.portals = [];
        this.kills = 0;
        this.level = 1;
        this.killsToNextLevel = 5;
        this.powerUps.forEach(p => p.active = false);
        this.gameOver = false;
        this.paused = false;
        this.starSpawnTimer = 0;
        this.gameState = 'playing';
    }

    setQuality(quality: GraphicQuality) {
        this.quality = quality;
        this.performanceMode = this.isMobile || quality === 'low';
    }

    getMiniMapData() {
        const remotes = Array.from(this.remotePlayers.values()).map(r => ({
            pos: { x: r.pos.x, y: r.pos.y },
            color: r.color
        }));
        return {
            playerPos: { x: this.player.pos.x, y: this.player.pos.y },
            playerColor: this.player.color,
            remotePlayers: remotes,
            worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT }
        };
    }

    updatePowerUpFromRemote(id: number, data: any) {
        if (!data) return;
        let p = this.powerUps[id];
        if (p) {
            p.pos.x = data.x;
            p.pos.y = data.y;
            p.type = data.type;
            p.active = data.active;
            p.color = data.color;
        }
    }

    private mouseAngle: number = 0;

    setJoystickInput(x: number, y: number) {
        this.joystickInput = { x, y };
    }

    screenToWorld(x: number, y: number): Point {
        return {
            x: (x - this.canvas.width / 2) / this.cameraScale + this.cameraPos.x,
            y: (y - this.canvas.height / 2) / this.cameraScale + this.cameraPos.y
        };
    }

    setShooting(shooting: boolean, x?: number, y?: number) {
        this.isShooting = shooting;
        if (x !== undefined && y !== undefined) {
            this.mousePos = this.screenToWorld(x, y);
            this.mouseAngle = Math.atan2(this.mousePos.y - this.player.pos.y, this.mousePos.x - this.player.pos.x);
        }
    }

    updateMousePos(x: number, y: number) {
        this.mousePos = this.screenToWorld(x, y);
        this.mouseAngle = Math.atan2(this.mousePos.y - this.player.pos.y, this.mousePos.x - this.player.pos.x);
    }

    resize() {
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        // Apply pixelRatio for better mobile performance
        this.canvas.width = Math.floor(displayWidth * this.pixelRatio);
        this.canvas.height = Math.floor(displayHeight * this.pixelRatio);
        
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // Calculate scale to maintain fixed FOV width
        // Mobile Landscape optimization: Zoom out to see more when phone is rotated
        let fovWidth = this.isMobile ? TARGET_FOV_WIDTH * 0.45 : TARGET_FOV_WIDTH;
        if (this.isMobile && displayWidth > displayHeight) {
            fovWidth = TARGET_FOV_WIDTH * 0.75; // Increased FOV = Zoomed out for landscape
        }
        
        this.targetCameraScale = (this.canvas.width / fovWidth) / this.pixelRatio;
        if (this.cameraScale === 1) this.cameraScale = this.targetCameraScale;
    }

    private getInput() {
        let ix = 0;
        let iy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) iy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) iy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) ix -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) ix += 1;

        if (ix !== 0 && iy !== 0) {
            const mag = Math.sqrt(ix * ix + iy * iy);
            ix /= mag;
            iy /= mag;
        }

        if (Math.abs(this.joystickInput.x) > 0.1 || Math.abs(this.joystickInput.y) > 0.1) {
            return this.joystickInput;
        }

        return { x: ix, y: iy };
    }

    private createGridPattern(spacing: number, hue: number, saturation: number) {
        const canvas = document.createElement('canvas');
        canvas.width = spacing;
        canvas.height = spacing;
        const ctx = canvas.getContext('2d')!;
        
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 50%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(spacing, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, spacing);
        ctx.stroke();
        
        this.gridCanvas = canvas;
        this.gridPattern = this.ctx.createPattern(canvas, 'repeat');
        this.lastGridLevel = this.level;
    }

    private drawGrid() {
        if (this.quality === 'low') return; // Skip grid on low quality for FPS boost

        const viewport = {
            x: this.cameraPos.x - (this.canvas.width / 2) / this.cameraScale,
            y: this.cameraPos.y - (this.canvas.height / 2) / this.cameraScale,
            w: this.canvas.width / this.cameraScale,
            h: this.canvas.height / this.cameraScale
        };

        // Deep Space Nebula (High Quality)
        if (this.quality === 'high' && !this.performanceMode) {
            const time = Date.now() / 10000;
            this.ctx.save();
            
            // Nebula clouds
            for (let i = 0; i < 3; i++) {
                this.ctx.save();
                this.ctx.translate(WORLD_WIDTH/2, WORLD_HEIGHT/2);
                this.ctx.rotate(time * (i + 1) * 0.1);
                const cloudColor = i === 0 ? '#1a0b2e' : (i === 1 ? '#2d0b4a' : '#0b2e4a');
                const g = this.ctx.createRadialGradient(0, 0, 0, 0, 0, WORLD_WIDTH * 0.8);
                g.addColorStop(0, cloudColor);
                g.addColorStop(1, 'transparent');
                this.ctx.fillStyle = g;
                this.ctx.globalAlpha = 0.15;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, WORLD_WIDTH * 0.8, WORLD_HEIGHT * 0.4, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
            this.ctx.restore();
            this.drawParallaxStars(viewport);
        }

        const spacing = Math.max(30, 60 - (this.level * 0.6));
        const hue = (200 + this.level * 7) % 360;
        const saturation = 70 + Math.sin(this.level) * 30;

        if (this.level !== this.lastGridLevel || !this.gridPattern) {
            this.createGridPattern(spacing, hue, saturation);
        }

        this.ctx.save();
        this.ctx.fillStyle = this.gridPattern!;
        
        // Culling: Only draw the grid within the viewport to save draw calls and fill rate
        const margin = 20;
        const drawX = Math.max(0, viewport.x - margin);
        const drawY = Math.max(0, viewport.y - margin);
        const drawW = Math.min(WORLD_WIDTH - drawX, viewport.w + margin * 2);
        const drawH = Math.min(WORLD_HEIGHT - drawY, viewport.h + margin * 2);

        this.ctx.fillRect(drawX, drawY, drawW, drawH);
        
        // World Border
        if (this.quality === 'high' && !this.performanceMode) {
            const time = Date.now() / 1000;
            this.ctx.save();
            this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 60%, ${0.5 + Math.sin(time * 5) * 0.2})`;
            this.ctx.lineWidth = 15;
            this.ctx.setLineDash([30, 15]);
            this.ctx.lineDashOffset = -time * 40;
            this.ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
            
            // Outer glow for border
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = `hsla(${hue}, ${saturation}%, 50%, 0.6)`;
            this.ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
            this.ctx.restore();
        } else {
            this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 50%, 0.3)`;
            this.ctx.lineWidth = 10;
            this.ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        }
        
        this.ctx.restore();
        this.drawSpaceDust(viewport);

        // Level-specific background patterns
        if (this.level > 10 && !this.performanceMode) {
            const time = Date.now() / 1000;
            this.ctx.save();
            this.ctx.globalAlpha = 0.05;
            this.ctx.strokeStyle = '#fff';
            this.ctx.setLineDash([20, 40]);
            this.ctx.beginPath();
            const angle = time * 0.1;
            for (let i = 0; i < 8; i++) {
                const a = angle + (i * Math.PI * 2) / 8;
                this.ctx.moveTo(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
                this.ctx.lineTo(
                    WORLD_WIDTH / 2 + Math.cos(a) * WORLD_WIDTH,
                    WORLD_HEIGHT / 2 + Math.sin(a) * WORLD_WIDTH
                );
            }
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    private spawnStar() {
        const margin = 100;
        const x = margin + Math.random() * (WORLD_WIDTH - margin * 2);
        const y = margin + Math.random() * (WORLD_HEIGHT - margin * 2);
        
        if (this.isMultiplayer) {
            // In multiplayer, we want to maintain stable indices for stars
            // Find a dead star slot or push new one
            const deadIndex = this.stars.findIndex(s => s.isDead);
            if (deadIndex !== -1) {
                this.stars[deadIndex] = new Star(x, y);
            } else {
                this.stars.push(new Star(x, y));
            }
        } else {
            this.stars.push(new Star(x, y));
        }
    }

    private spawnPowerUp() {
        const p = this.powerUps.find(p => !p.active);
        if (p) {
            const margin = 200;
            const x = margin + Math.random() * (WORLD_WIDTH - margin * 2);
            const y = margin + Math.random() * (WORLD_HEIGHT - margin * 2);
            const types: ('shield' | 'rapid' | 'speed' | 'triple')[] = ['shield', 'rapid', 'speed', 'triple'];
            const type = types[Math.floor(Math.random() * types.length)];
            p.init(x, y, type);
        }
    }

    private spawnPortalPair() {
        // Prevent too many portals
        if (this.portals.length >= 6) return;
        
        const margin = 500;
        const x1 = margin + Math.random() * (WORLD_WIDTH - margin * 2);
        const y1 = margin + Math.random() * (WORLD_HEIGHT - margin * 2);
        const x2 = margin + Math.random() * (WORLD_WIDTH - margin * 2);
        const y2 = margin + Math.random() * (WORLD_HEIGHT - margin * 2);
        
        const hue = Math.random() * 360;
        const color = `hsl(${hue}, 100%, 50%)`;
        
        const p1 = new Portal(x1, y1, x2, y2, color);
        const p2 = new Portal(x2, y2, x1, y1, color);
        
        this.portals.push(p1, p2);
    }

    private applyPowerUp(type: 'shield' | 'rapid' | 'speed' | 'triple') {
        const duration = 10000; // 10 seconds
        triggerGameSfx('collect');
        this.player.powerUps[type] = duration;
    }

    private teleportPlayer(target: Point) {
        this.player.pos.x = target.x;
        this.player.pos.y = target.y;
        this.cameraPos.x = target.x;
        this.cameraPos.y = target.y;
        this.spawnParticles(target.x, target.y, '#ffffff', 50, 8);
        this.spawnShockwave(target.x, target.y, 150, '#ffffff');
        this.shake.shake(20);
        this.flash.trigger(0.4, '#ffffff');
        triggerGameSfx('powerup'); // Use powerup sound for teleport for now
    }
    private spawnParticles(x: number, y: number, color: string, count: number = 10, speed: number = 2, glow: boolean = true) {
        if (this.quality === 'low') return;
        const adjustedCount = this.quality === 'medium' ? Math.ceil(count * 0.5) : count;
        this.pool.spawn(x, y, color, adjustedCount, speed, glow);
    }

    private updateQualityScaling(dt: number) {
        const currentFps = 1000 / dt;
        this.fpsHistory.push(currentFps);
        if (this.fpsHistory.length > 60) this.fpsHistory.shift();
        
        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        
        // Auto-scale quality if FPS drops significantly
        if (avgFps < 30 && this.quality === 'high') {
            this.quality = 'medium';
            this.fpsHistory = [];
        } else if (avgFps < 20 && this.quality === 'medium') {
            this.quality = 'low';
            this.fpsHistory = [];
        }
    }

    private getAimAssistAngle(currentAngle: number): number {
        if (!this.isMobile) {
            this.currentTargetId = null;
            this.currentTargetPos = null;
            return currentAngle;
        }

        let nearestTarget: Point | null = null;
        let nearestTargetId: string | null = null;
        let minDistSq = 490000; // Increased from 500px to 700px radius squared for mobile (700^2 = 490000)

        // Check remote players
        this.remotePlayers.forEach(remote => {
            const dx = remote.pos.x - this.player.pos.x;
            const dy = remote.pos.y - this.player.pos.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDistSq && remote.lives > 0) { // Changed .isDead to .lives > 0
                minDistSq = distSq;
                nearestTarget = remote.pos;
                nearestTargetId = remote.uid;
            }
        });

        // Check bots
        this.bots.forEach(bot => {
            const dx = bot.pos.x - this.player.pos.x;
            const dy = bot.pos.y - this.player.pos.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDistSq && !bot.isDead) {
                minDistSq = distSq;
                nearestTarget = bot.pos;
                nearestTargetId = 'bot';
            }
        });

        this.currentTargetId = nearestTargetId;
        this.currentTargetPos = nearestTarget;

        if (nearestTarget) {
            const targetAngle = Math.atan2(nearestTarget.y - this.player.pos.y, nearestTarget.x - this.player.pos.x);
            // Stronger lerp on mobile (0.8 strength)
            let diff = targetAngle - currentAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            // Only assist if the player is aiming somewhat towards the target (within 150 degrees)
            if (Math.abs(diff) < Math.PI * 0.8) {
                return currentAngle + diff * 0.8;
            }
        }

        return currentAngle;
    }

    private drawAimAssist() {
        if (!this.isMobile || !this.currentTargetPos || !this.isShooting) return;

        const { x, y } = this.currentTargetPos;
        const time = Date.now() / 1000;
        const size = 30 + Math.sin(time * 10) * 5;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(time * 2);

        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.6)';
        this.ctx.lineWidth = 2;
        
        // Draw crosshair corners
        for (let i = 0; i < 4; i++) {
            this.ctx.rotate(Math.PI / 2);
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.5, size * 0.2);
            this.ctx.lineTo(size * 0.5, size * 0.5);
            this.ctx.lineTo(size * 0.2, size * 0.5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    updateBotFromRemote(uid: string, data: any) {
        // Bots removed
    }

    spawnRemoteProjectile(data: any, latency: number = 0) {
        if (!data || data.ownerId === (this.player as any).uid) return; // Don't spawn own projectiles again
        if (!data.pos || data.angle === undefined) return;
        
        const p = this.projectilePool.spawn(data.pos.x, data.pos.y, data.angle, 'remote', data.ownerId);
        if (p) {
            if (data.vel) {
                p.vel.x = data.vel.x;
                p.vel.y = data.vel.y;
            }
            // Latency compensation: advance projectile by the time it took to arrive
            if (latency > 0) {
                // Use dt-independent advancement
                const frames = Math.min(60, latency / 16); // Cap at 60 frames (1s) to avoid crazy jumps
                p.pos.x += p.vel.x * frames;
                p.pos.y += p.vel.y * frames;
                
                // Update trail immediately to avoid visual gap
                for (let i = 0; i < Math.min(5, frames); i++) {
                    p.trail.update(p.pos.x - p.vel.x * i, p.pos.y - p.vel.y * i);
                }
            }
        }
    }

    updateStarFromRemote(id: number, data: any) {
        if (!data) return;
        let star = this.stars[id];
        if (!star) {
            star = new Star(data.x, data.y);
            this.stars[id] = star;
        }
        star.pos.x = data.x;
        star.pos.y = data.y;
        star.isDead = !data.active;
    }

    private networkSyncTimer: number = 0;
    private networkSyncInterval: number = 40; // 25 FPS for network sync

    private clearSpatialGrid() {
        if (!this.spatialGrid.length) return;
        for (let x = 0; x < this.spatialGrid.length; x++) {
            for (let y = 0; y < this.spatialGrid[x].length; y++) {
                this.spatialGrid[x][y].length = 0;
            }
        }
    }

    private populateSpatialGrid() {
        if (!this.spatialGrid.length) return;
        
        // Index Players and Bots for broad-phase projectile collisions
        this.addEntityToGrid(this.player);
        this.remotePlayers.forEach(p => this.addEntityToGrid(p));
        this.bots.forEach(b => { if (!b.isDead) this.addEntityToGrid(b); });
    }

    private addEntityToGrid(entity: Player | Bot) {
        const xIdx = Math.floor(entity.pos.x / this.spatialCellSize);
        const yIdx = Math.floor(entity.pos.y / this.spatialCellSize);
        
        if (xIdx >= 0 && xIdx < this.spatialGrid.length && yIdx >= 0 && yIdx < this.spatialGrid[xIdx].length) {
            this.spatialGrid[xIdx][yIdx].push(entity);
        }
        
        // Handle entities sitting on boundaries - check neighbors
        const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (let i = 0; i < neighbors.length; i++) {
            const dx = neighbors[i][0];
            const dy = neighbors[i][1];
            const nx = xIdx + dx;
            const ny = yIdx + dy;
            if (nx >= 0 && nx < this.spatialGrid.length && ny >= 0 && ny < this.spatialGrid[nx].length) {
                const cellX = nx * this.spatialCellSize;
                const cellY = ny * this.spatialCellSize;
                const closestX = Math.max(cellX, Math.min(entity.pos.x, cellX + this.spatialCellSize));
                const closestY = Math.max(cellY, Math.min(entity.pos.y, cellY + this.spatialCellSize));
                const distSq = (entity.pos.x - closestX)**2 + (entity.pos.y - closestY)**2;
                if (distSq < entity.radius**2) {
                    this.spatialGrid[nx][ny].push(entity);
                }
            }
        }
    }

    private update(dt: number, time: number) {
        if (this.hitStop > 0) {
            this.hitStop -= dt;
            return;
        }

        this.updateQualityScaling(dt);
        
        // Performance: Clear and Populate Spatial Grid ONCE per frame before substeps
        this.clearSpatialGrid();
        this.populateSpatialGrid();
        
        // Sub-stepping for physics stability - optimized for mobile performance
        const substeps = this.isMobile ? 2 : 2; // Reduced from 4 to 2 on mobile for significant CPU savings
        const subDt = dt / substeps;

        for (let step = 0; step < substeps; step++) {
            this.internalUpdate(subDt, time);
        }
    }

    private internalUpdate(dt: number, time: number) {
        this.shake.update();
        this.flash.update();
        this.shockwaves.forEach(sw => sw.update(dt));
        
        // Removed: Clear and Populate Spatial Grid (moved to main update for O(1) grid builds per frame)

        // Update Camera with Look-ahead (Refined for extreme fluidity)
        const dtFactor = dt / 16;
        const lookAheadFactor = this.isMobile ? 0.08 : 0.15;
        const targetCamX = this.player.pos.x + (this.player.vel.x * lookAheadFactor * 16);
        const targetCamY = this.player.pos.y + (this.player.vel.y * lookAheadFactor * 16);
        
        // Use exponential decay for buttery smooth camera
        const camSmoothing = Math.min(1.0, this.cameraLerp * dtFactor);
        this.cameraPos.x += (targetCamX - this.cameraPos.x) * camSmoothing;
        this.cameraPos.y += (targetCamY - this.cameraPos.y) * camSmoothing;
        
        // Smoothly interpolate scale
        this.cameraScale += (this.targetCameraScale - this.cameraScale) * 0.1 * dtFactor;

        if (this.gameState === 'transition') {
            this.transitionTimer -= dt;
            this.pool.update(dt);
            if (this.transitionTimer <= 0) {
                this.gameState = 'loading';
                this.loadingTimer = 1500;
                this.loadingProgress = 0;
                if (this.onGameStateChange) this.onGameStateChange(this.gameState);
                this.prepareNextLevel();
            }
            return;
        }

        if (this.gameState === 'loading') {
            this.loadingTimer -= dt;
            this.loadingProgress = Math.min(100, (1 - this.loadingTimer / 1500) * 100);
            if (this.onLoadingUpdate) this.onLoadingUpdate(this.loadingProgress);
            if (this.loadingTimer <= 0) {
                this.gameState = 'playing';
                if (this.onGameStateChange) this.onGameStateChange(this.gameState);
                this.finalizeNextLevel();
            }
            return;
        }

        // Network sync
        if (this.isMultiplayer) {
            this.networkSyncTimer += dt;
            if (this.networkSyncTimer >= this.networkSyncInterval) {
                if (this.onSyncNetwork) this.onSyncNetwork();
                this.networkSyncTimer = 0;
            }
        }

        // Level Progression (Offline only)
        if (!this.isMultiplayer && this.gameState === 'playing') {
            if (this.kills >= this.killsToNextLevel) {
                this.gameState = 'transition';
                this.transitionTimer = 2000;
                this.bots = []; // Clear bots immediately
                this.spawnParticles(this.player.pos.x, this.player.pos.y, this.player.color, 100, 10);
                triggerGameSfx('level_up');
                if (this.onGameStateChange) this.onGameStateChange(this.gameState);
            }
        }

        // Spawning
        if (!this.isMultiplayer || this.isHost) {
            this.starSpawnTimer += dt;
            const maxStars = this.isMultiplayer ? 15 : 12;
            const spawnInterval = this.isMultiplayer ? 1000 : 1500;
            const activeStars = this.stars.filter(s => !s.isDead).length;

            if (this.starSpawnTimer > spawnInterval && activeStars < maxStars) {
                this.spawnStar();
                if (Math.random() < 0.5) this.spawnStar();
                this.starSpawnTimer = 0;
                
                // Spawn PowerUp occasionally
                if (Math.random() < 0.6) {
                    this.spawnPowerUp();
                }

                // Spawn Portal occasionally
                if (this.portals.length < 6 && Math.random() < 0.1) {
                    this.spawnPortalPair();
                }

                if (this.isMultiplayer && this.onStarUpdate) {
                    this.onStarUpdate(this.stars.map(s => ({ x: s.pos.x, y: s.pos.y, active: !s.isDead })));
                }
            }

            // Bot spawning (Offline only)
            if (!this.isMultiplayer && this.gameState === 'playing') {
                // Level 1: 3, Level 2: 5, Level 3: 8, etc.
                const maxBots = Math.min(60, Math.floor(3 + (this.level - 1) * 1.5));
                const spawnRate = 0.02 + (this.level * 0.002);
                
                // If no bots left, spawn one immediately
                if (this.bots.length === 0 || (this.bots.length < maxBots && Math.random() < spawnRate)) {
                    this.spawnBot();
                }
            }
        }

        const cameraObj = { 
            x: this.cameraPos.x, 
            y: this.cameraPos.y, 
            scale: this.cameraScale, 
            w: this.canvas.width, 
            h: this.canvas.height 
        };

        const input = this.getInput();
        this.player.update(input, { width: WORLD_WIDTH, height: WORLD_HEIGHT }, dt, cameraObj);

        // Update Bots
        this.bots.forEach(bot => {
            bot.updateAI(this.player, dt, this.projectilePool, { width: WORLD_WIDTH, height: WORLD_HEIGHT }, cameraObj, (p) => {
                if (this.onShoot) this.onShoot(p);
            });
            // Update bot skin effects if they ever get skins
            (bot as any).updateSkinEffects?.(dt, cameraObj);
        });

        // Update Portals
        this.portals.forEach(portal => {
            portal.update();
            // Collision with player
            const dx = this.player.pos.x - portal.pos.x;
            const dy = this.player.pos.y - portal.pos.y;
            const distSq = dx * dx + dy * dy;
            const minDist = this.player.radius + portal.radius * 0.5;
            if (distSq < minDist * minDist && portal.active) {
                this.teleportPlayer(portal.targetPos);
                // Temporarily disable portals for a bit to prevent infinite loop
                this.portals.forEach(p => {
                    p.active = false;
                    setTimeout(() => p.active = true, 2000);
                });
            }
        });

        // Update PowerUps
        this.powerUps.forEach(p => {
            if (p.active) {
                p.update();
                // Collision with player
                const dx = this.player.pos.x - p.pos.x;
                const dy = this.player.pos.y - p.pos.y;
                const distSq = dx * dx + dy * dy;
                const minDist = this.player.radius + p.radius;
                if (distSq < minDist * minDist) {
                    p.active = false;
                    this.applyPowerUp(p.type);
                    this.spawnParticles(p.pos.x, p.pos.y, p.color, 35, 6);
                    this.shake.shake(8);
                    this.flash.trigger(0.2, p.color);
                    // Absorption effect: particles from player to power-up position
                    this.pool.spawnAbsorption(this.player.pos.x, this.player.pos.y, p.pos.x, p.pos.y, p.color, 15);
                    if (this.onPowerUpCollected) this.onPowerUpCollected(p.type);
                }
            }
        });

        // Shooting logic
        const shootInterval = this.player.powerUps.rapid > 0 ? 100 : 200;
        if (this.isShooting && this.player.ammo > 0 && this.player.status === 'alive') {
            this.shootTimer += dt;
            if (this.shootTimer >= shootInterval) {
                // Mobile: Use player's current angle which follows the joystick/aim indicator
                const baseAngle = this.isMobile ? this.player.angle : this.mouseAngle;
                const angle = this.getAimAssistAngle(baseAngle);
                this.shake.shake(1.5);
                
                const spawnProjectile = (ang: number) => {
                    const p = this.projectilePool.spawn(this.player.pos.x, this.player.pos.y, ang, 'player', (this.player as any).uid || 'player');
                    if (p) {
                        this.spawnParticles(p.pos.x, p.pos.y, p.color, 5, 1, false);
                        if (this.onShoot) this.onShoot(p);
                    }
                };

                spawnProjectile(angle);
                triggerGameSfx('shoot');
                if (this.player.powerUps.triple > 0) {
                    spawnProjectile(angle - 0.2);
                    spawnProjectile(angle + 0.2);
                }

                this.player.ammo--;
                if (this.quality === 'high') this.shake.shake(2);
                if (this.isMobile && window.navigator.vibrate) window.navigator.vibrate(10);
                
                this.shootTimer = 0;
            }
        } else {
            this.shootTimer = shootInterval;
        }

        // Update Projectiles
        this.projectilePool.update({ width: WORLD_WIDTH, height: WORLD_HEIGHT }, dt);
        this.remotePlayers.forEach(r => r.updateInterpolation(dt, cameraObj));
        
        // Update Particles
        this.pool.update(dt);
        this.hitMarkers.forEach(hm => hm.update(dt));

        // Performance: Optimized Spatial Collisions
        this.checkSpatialCollisions(dt);

        // Cleanup (Optimized to avoid frequent allocations)
        if (!this.isMultiplayer && time % 500 < 20) { // Only cleanup every ~0.5s
            this.stars = this.stars.filter(s => !s.isDead);
            this.bots = this.bots.filter(b => !b.isDead);
        }
        
        // Leveling System Check
        if (!this.isMultiplayer && this.kills >= this.killsToNextLevel) {
            this.prepareNextLevel();
        }
    }

    private checkSpatialCollisions(dt: number) {
        const activeProjectiles = this.projectilePool.getActive();
        const playerX = this.player.pos.x;
        const playerY = this.player.pos.y;
        const playerR = this.player.radius;

        // 1. Star collisions (Checked first for instant response)
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            if (star.isDead) continue;
            
            const dx = playerX - star.pos.x;
            const dy = playerY - star.pos.y;
            // Quick Manhattan check
            if (Math.abs(dx) < 60 && Math.abs(dy) < 60) {
                const distSq = dx * dx + dy * dy;
                const minDist = (playerR + star.radius) * (this.isMobile ? 1.3 : 1.15);
                if (distSq < minDist * minDist) {
                    star.isDead = true;
                    this.paused = true; // Instant pause for question
                    this.spawnParticles(star.pos.x, star.pos.y, star.color, 45, 6);
                    this.shake.shake(6);
                    this.flash.trigger(0.2, star.color);
                    this.pool.spawnAbsorption(playerX, playerY, star.pos.x, star.pos.y, star.color, 15);
                    triggerGameSfx('collect');
                    if (this.onStarCollected) this.onStarCollected(i);
                    
                    if (this.isMultiplayer && this.onStarUpdate) {
                        this.onStarUpdate(this.stars.map(s => ({ x: s.pos.x, y: s.pos.y, active: !s.isDead })));
                    }
                }
            }
        }

        // 2. Projectile collisions
        for (let i = 0; i < activeProjectiles.length; i++) {
            const p = activeProjectiles[i];
            if (!p.active) continue;

            const gridX = Math.floor(p.pos.x / this.spatialCellSize);
            const gridY = Math.floor(p.pos.y / this.spatialCellSize);

            if (gridX >= 0 && gridX < this.spatialGrid.length && gridY >= 0 && gridY < this.spatialGrid[gridX].length) {
                const candidates = this.spatialGrid[gridX][gridY];
                for (let j = 0; j < candidates.length; j++) {
                    const entity = candidates[j];
                    
                    // Basic owner check
                    const isPlayer = entity === this.player;
                    const entityOwnerId = (entity as any).uid || (isPlayer ? 'player' : 'bot');
                    if (p.ownerId === entityOwnerId) continue;
                    
                    const dx = p.pos.x - entity.pos.x;
                    const dy = p.pos.y - entity.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = (p.radius + entity.radius) * (this.isMultiplayer ? 1.2 : 1.0);

                    if (distSq < minDist * minDist) {
                        this.handleProjectileHit(p, entity, dt);
                        if (!p.active) break; // Projectile destroyed
                    }
                }
            }
        }

        // Star collisions (keep simple as they are few or use grid if many)
        this.stars.forEach(star => {
            if (star.isDead) return;
            star.update();
            const dx = playerX - star.pos.x;
            const dy = playerY - star.pos.y;
            const distSq = dx * dx + dy * dy;
            const minDist = (playerR + star.radius) * (this.isMobile ? 1.25 : 1.15);
            if (distSq < minDist * minDist) {
                star.isDead = true;
                this.spawnParticles(star.pos.x, star.pos.y, star.color, 45, 6);
                this.shake.shake(6);
                this.flash.trigger(0.2, star.color);
                this.pool.spawnAbsorption(playerX, playerY, star.pos.x, star.pos.y, star.color, 15);
                triggerGameSfx('collect');
                if (this.onStarCollected) this.onStarCollected(this.stars.indexOf(star));
                if (this.isMultiplayer && this.onStarUpdate) {
                    this.onStarUpdate(this.stars.map(s => ({ x: s.pos.x, y: s.pos.y, active: !s.isDead })));
                }
            }
        });
    }

    private handleProjectileHit(p: Projectile, entity: Player | Bot, dt: number) {
        p.active = false;
        const isPlayer = entity === this.player;
        
        if (isPlayer) {
            if (this.player.powerUps.shield > 0) {
                this.spawnParticles(p.pos.x, p.pos.y, '#00f2ff', 15, 3);
                this.spawnHitMarker(p.pos.x, p.pos.y, '#00f2ff');
            } else {
                this.spawnParticles(p.pos.x, p.pos.y, this.player.color, 20, 4);
                this.shake.shake(12);
                this.player.hitTimer = 200;
                triggerGameSfx('hit');
                
                if (this.isMultiplayer) {
                    if (this.onPlayerHit) this.onPlayerHit((this.player as any).uid, 1, p.ownerId || '');
                } else {
                    this.player.lives--;
                    this.shake.shake(20);
                    this.flash.trigger(0.5, 'rgba(255, 0, 0, 0.6)');
                    this.spawnShockwave(this.player.pos.x, this.player.pos.y, 200, '#ff0000');
                    this.hitStop = 80;
                    
                    if (this.player.lives <= 0) {
                        triggerGameSfx('hit');
                        this.gameOver = true;
                        if (this.onGameOver) this.onGameOver();
                    }
                }
            }
        } else if (entity instanceof Bot) {
            const bot = entity as Bot;
            bot.health--;
            bot.hitTimer = 150;
            this.shake.shake(4);
            this.spawnHitMarker(p.pos.x, p.pos.y, '#ffff00');
            triggerGameSfx('hit');
            this.spawnParticles(p.pos.x, p.pos.y, bot.color, 15, 5);
            
            if (bot.health <= 0) {
                bot.isDead = true;
                this.kills++;
                this.totalKills++;
                this.spawnParticles(bot.pos.x, bot.pos.y, bot.color, 60, 8);
                this.shake.shake(bot.type === 'boss' ? 30 : 15);
                this.flash.trigger(0.3, bot.color);
                this.spawnShockwave(bot.pos.x, bot.pos.y, bot.type === 'boss' ? 400 : 150, bot.color);
                this.hitStop = bot.type === 'boss' ? 150 : 50;
                triggerGameSfx('explosion');
                if (this.onBotKilled) this.onBotKilled(bot.type);
                if (bot.type === 'super_boss') {
                    this.gameOver = true;
                    this.paused = true;
                    if (this.onVictory) this.onVictory();
                }
            }
        } else {
            // Remote Player
            const remote = entity as any; // RemotePlayer
            remote.hitTimer = 200;
            this.spawnParticles(p.pos.x, p.pos.y, remote.color, 15, 3);
            this.spawnHitMarker(p.pos.x, p.pos.y, '#ffffff');
            this.shake.shake(2);
        }
    }

    private draw() {
        this.ctx.fillStyle = '#10051a'; // Darker, theme-consistent base
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'loading') {
            return;
        }

        this.ctx.save();
        
        // Handle resolution scaling for mobile performance
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        const canvasW = this.canvas.width / this.pixelRatio;
        const canvasH = this.canvas.height / this.pixelRatio;

        // Apply Camera Transform
        this.ctx.translate(canvasW / 2, canvasH / 2);
        this.ctx.scale(this.cameraScale, this.cameraScale);
        this.ctx.translate(-this.cameraPos.x, -this.cameraPos.y);

        const viewport = {
            x: this.cameraPos.x - (canvasW / this.cameraScale / 2),
            y: this.cameraPos.y - (canvasH / this.cameraScale / 2),
            w: canvasW / this.cameraScale,
            h: canvasH / this.cameraScale
        };

        this.drawGrid();
        this.shake.apply(this.ctx);

        // Lighting (Optimization: Group glows and skip on low quality)
        if (this.quality !== 'low' && !this.performanceMode) {
            const isHigh = this.quality === 'high' && !this.isMobile;
            
            // Only draw player glow reliably
            Lighting.drawGlow(this.ctx, this.player.pos.x, this.player.pos.y, isHigh ? 80 : 60, this.player.color, isHigh ? 0.2 : 0.1);

            // Culling for stars and other glows
            const glowPadding = 120;
            this.stars.forEach(s => {
                if (!s.isDead && s.pos.x > viewport.x - glowPadding && s.pos.x < viewport.x + viewport.w + glowPadding &&
                    s.pos.y > viewport.y - glowPadding && s.pos.y < viewport.y + viewport.h + glowPadding) {
                    Lighting.drawGlow(this.ctx, s.pos.x, s.pos.y, 60, s.color, 0.1);
                }
            });
        }

        this.shockwaves.forEach(sw => {
            if (sw.active && sw.pos.x > viewport.x - sw.radius && sw.pos.x < viewport.x + viewport.w + sw.radius &&
                sw.pos.y > viewport.y - sw.radius && sw.pos.y < viewport.y + viewport.h + sw.radius) {
                sw.draw(this.ctx);
            }
        });

        this.portals.forEach(p => p.draw(this.ctx, this.quality));
        this.powerUps.forEach(p => {
            if (p.active) p.draw(this.ctx, this.quality);
        });

        const cameraObj = { 
            x: this.cameraPos.x, 
            y: this.cameraPos.y, 
            scale: this.cameraScale, 
            w: canvasW, 
            h: canvasH 
        };

        // Cull and Draw Entities
        const drawPadding = 80;
        this.stars.forEach(s => {
            if (!s.isDead && s.pos.x > viewport.x - drawPadding && s.pos.x < viewport.x + viewport.w + drawPadding &&
                s.pos.y > viewport.y - drawPadding && s.pos.y < viewport.y + viewport.h + drawPadding) {
                s.draw(this.ctx, this.quality);
            }
        });

        this.bots.forEach(bot => {
            if (!bot.isDead && bot.pos.x > viewport.x - drawPadding && bot.pos.x < viewport.x + viewport.w + drawPadding &&
                bot.pos.y > viewport.y - drawPadding && bot.pos.y < viewport.y + viewport.h + drawPadding) {
                bot.draw(this.ctx, cameraObj, this.quality);
            }
        });

        this.remotePlayers.forEach(r => {
             if (r.pos.x > viewport.x - drawPadding && r.pos.x < viewport.x + viewport.w + drawPadding &&
                 r.pos.y > viewport.y - drawPadding && r.pos.y < viewport.y + viewport.h + drawPadding) {
                 r.draw(this.ctx, cameraObj, this.quality);
             }
        });

        this.drawAimAssist();
        this.projectilePool.draw(this.ctx, this.quality, viewport);
        this.hitMarkers.forEach(hm => hm.draw(this.ctx));
        
        // Chromatic Aberration / Ghosting effect for High Quality
        if (this.quality === 'high' && !this.performanceMode && !this.isMobile) {
            const offset = 2 + (this.shake.intensity * 0.8);
            this.ctx.save();
            this.ctx.globalAlpha = Math.min(0.6, 0.3 + (this.shake.intensity * 0.02));
            this.ctx.translate(offset, 0);
            this.player.draw(this.ctx, cameraObj, this.quality);
            this.ctx.translate(-offset * 2, 0);
            this.player.draw(this.ctx, cameraObj, this.quality);
            this.ctx.restore();
        }

        this.player.draw(this.ctx, cameraObj, this.quality);
        this.pool.draw(this.ctx, this.quality, viewport);

        this.ctx.restore();

        this.flash.draw(this.ctx, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
        this.drawSpeedLines();
        this.drawPostProcessing();
    }

    private drawSpeedLines() {
        if (this.quality !== 'high' || this.performanceMode) return;
        const speedSq = this.player.vel.x * this.player.vel.x + this.player.vel.y * this.player.vel.y;
        if (speedSq < 25 && this.player.powerUps.speed <= 0) return;

        const count = this.player.powerUps.speed > 0 ? 30 : 15;
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 1;
        
        const angle = Math.atan2(this.player.vel.y, this.player.vel.x);
        
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 600 + 100;
            const a = angle + (Math.random() - 0.5) * 0.8;
            const x = this.canvas.width / 2 + Math.cos(a) * r;
            const y = this.canvas.height / 2 + Math.sin(a) * r;
            const len = Math.random() * 150 + 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    private drawPostProcessing() {
        if (this.quality === 'low' || this.performanceMode) return;
        
        // Vignette - Stronger and more cinematic
        const grad = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) * 0.9
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // CRT Scanlines - Optimized for mobile by reducing draw call count
        const scanlineOpacity = this.quality === 'high' ? 0.08 : 0.04;
        const step = this.isMobile ? 6 : 3;
        this.ctx.save();
        this.ctx.globalAlpha = scanlineOpacity;
        this.ctx.fillStyle = '#000';
        for (let i = 0; i < this.canvas.height; i += step) {
            this.ctx.fillRect(0, i, this.canvas.width, 1);
        }
        this.ctx.restore();

        // Subtle RGB Split / Chromatic Aberration in High Quality
        if (this.quality === 'high') {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = 0.1;
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(1, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00f';
            this.ctx.fillRect(-1, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    private drawParallaxStars(viewport: { x: number, y: number, w: number, h: number }) {
        if (this.quality !== 'high') return;
        this.ctx.save();
        this.parallaxStars.forEach(s => {
            // Use camera position to offset stars for parallax effect
            let px = (s.x - this.cameraPos.x * s.speed) % WORLD_WIDTH;
            let py = (s.y - this.cameraPos.y * s.speed) % WORLD_HEIGHT;
            if (px < 0) px += WORLD_WIDTH;
            if (py < 0) py += WORLD_HEIGHT;
            
            // Culling: Only draw if within viewport
            if (px > viewport.x - 20 && px < viewport.x + viewport.w + 20 &&
                py > viewport.y - 20 && py < viewport.y + viewport.h + 20) {
                this.ctx.fillStyle = s.color;
                this.ctx.beginPath();
                this.ctx.arc(px, py, s.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.restore();
    }

    private drawSpaceDust(viewport: { x: number, y: number, w: number, h: number }) {
        if (this.quality !== 'high') return;
        this.ctx.save();
        const time = Date.now() / 1000;
        this.spaceDust.forEach(d => {
            d.x = (d.x + d.vx + WORLD_WIDTH) % WORLD_WIDTH;
            d.y = (d.y + d.vy + WORLD_HEIGHT) % WORLD_HEIGHT;
            
            // Culling: Only draw if within viewport
            if (d.x > viewport.x - 20 && d.x < viewport.x + viewport.w + 20 &&
                d.y > viewport.y - 20 && d.y < viewport.y + viewport.h + 20) {
                const alpha = (Math.sin(time + d.x * 0.01) * 0.5 + 0.5) * 0.2;
                this.ctx.fillStyle = d.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.restore();
    }

    private prepareNextLevel() {
        if (this.level >= 50) {
            this.gameOver = true;
            this.paused = true;
            if (this.onVictory) this.onVictory();
            return;
        }

        this.level++;
        this.kills = 0;
        this.killsToNextLevel = Math.min(50, this.level * 5 + 5);
        this.player.level = this.level;
        this.player.skinId = this.level;
        this.stars = [];
        this.bots = [];
        this.projectilePool.clear();
        this.powerUps.forEach(p => p.active = false);
        
        this.player.pos.x = this.canvas.width / 2;
        this.player.pos.y = this.canvas.height / 2;
        this.player.vel.x = 0;
        this.player.vel.y = 0;
        
        this.gameState = 'loading';
        this.loadingTimer = 1500;
        this.loadingProgress = 0;
        if (this.onGameStateChange) this.onGameStateChange('loading');
        
        if (this.onLevelUp) this.onLevelUp(this.level);
    }

    private finalizeNextLevel() {
        // Spawn initial stars for the new level
        for (let i = 0; i < 3; i++) {
            this.spawnStar();
        }

        // Spawn Boss if level is multiple of 5
        if (this.level === 50) {
            this.spawnSuperBoss();
        } else if (this.level % 5 === 0) {
            this.spawnBoss();
        }

        this.starSpawnTimer = 0;
    }

    private spawnShockwave(x: number, y: number, radius: number, color: string) {
        if (this.quality === 'low') return;
        const sw = this.shockwaves.find(s => !s.active) || this.shockwaves[0];
        sw.init(x, y, radius, color);
    }

    private spawnHitMarker(x: number, y: number, color: string = '#ffffff') {
        const marker = this.hitMarkers.find(hm => !hm.active) || this.hitMarkers[0];
        marker.init(x, y, color);
    }

    private spawnBot() {
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0;
        const margin = 100;
        
        if (side === 0) { x = Math.random() * WORLD_WIDTH; y = -margin; }
        else if (side === 1) { x = WORLD_WIDTH + margin; y = Math.random() * WORLD_HEIGHT; }
        else if (side === 2) { x = Math.random() * WORLD_WIDTH; y = WORLD_HEIGHT + margin; }
        else { x = -margin; y = Math.random() * WORLD_HEIGHT; }

        this.bots.push(new Bot(x, y, this.level));
    }

    private spawnBoss() {
        const x = WORLD_WIDTH / 2;
        const y = -200;
        this.bots.push(new Bot(x, y, this.level));
    }

    private spawnSuperBoss() {
        const x = this.canvas.width / 2;
        const y = -300;
        const boss = new Bot(x, y, 50);
        boss.type = 'super_boss';
        boss.radius = 120;
        boss.health = 500;
        boss.maxHealth = 500;
        boss.color = '#ff00ff'; // Magenta / Neon Pink
        boss.glowColor = '#ff00ff';
        this.bots.push(boss);
    }

    loop(time: number) {
        if (!this.isRunning) return;
        
        let dt = time - this.lastTime;
        if (dt > this.maxAccumulator) dt = this.fixedDt; // Cap dt for tab resuming/hiccups
        this.lastTime = time;

        if (this.gameOver) {
            requestAnimationFrame(this.loop);
            return;
        }

        if (!this.paused) {
            this.accumulator += dt;
            
            // Fixed timestep integration for deterministic/smooth physics
            while (this.accumulator >= this.fixedDt) {
                this.update(this.fixedDt, time);
                this.accumulator -= this.fixedDt;
            }
        }

        this.draw();
        requestAnimationFrame(this.loop);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.gameOver = false;
        this.paused = false;
        this.gameState = 'playing';
        this.player.lives = 3;
        this.player.ammo = 2;
        this.kills = 0;
        this.totalKills = 0;
        this.stars = [];
        this.bots = [];
        this.projectilePool.clear();
        
        this.resize();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.isRunning = false;
    }
}
