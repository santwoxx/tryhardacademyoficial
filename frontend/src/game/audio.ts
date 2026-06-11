/**
 * TRYHARD ACADEMY - Audio System
 * Background Music + Synthetic Sound Effects (no external downloads)
 */

export type SoundEffect = 
    | 'shoot' 
    | 'explosion' 
    | 'hit' 
    | 'powerup' 
    | 'level_up' 
    | 'victory' 
    | 'death' 
    | 'correct' 
    | 'wrong'
    | 'match_intro'
    | 'countdown_tick';

class AudioManager {
    private static instance: AudioManager;
    private bgm: HTMLAudioElement | null = null;
    private isMuted: boolean = false;
    private volume: number = 0.3;
    private initialized: boolean = false;

    // Synthetic audio context for all SFX (no external files = no network, no CORS, no latency)
    private audioCtx: AudioContext | null = null;

    // BGM playlist is small and user-gesture-activated (avoids autoplay blocks)
    private playlist: string[] = [
        'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/oedipus_wizball_highscore.mp3',
        'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3'
    ];
    private currentTrackIndex: number = 0;

    private constructor() {
        this.isMuted = localStorage.getItem('isMuted') === 'true';
    }

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private ensureCtx(): AudioContext | null {
        if (this.isMuted) return null;
        if (!this.audioCtx) {
            try {
                this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
    }

    playBGM() {
        if (this.isMuted) return;
        const src = this.playlist[this.currentTrackIndex];
        
        if (!this.bgm) {
            this.bgm = new Audio();
            this.bgm.addEventListener('ended', () => {
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                this.playBGM();
            });
        }

        if (this.bgm.src === src) {
            if (this.bgm.paused) {
                this.bgm.play().catch(() => {});
            }
            return;
        }

        this.bgm.pause();
        this.bgm.src = src;
        this.bgm.loop = false;
        this.bgm.volume = this.volume;
        this.bgm.muted = this.isMuted;
        
        this.bgm.play().catch(() => {
            // Handle autoplay policy - retry on first user interaction
            const unlock = () => {
                this.bgm?.play().catch(() => {});
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
                window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('click', unlock, { once: true });
            window.addEventListener('keydown', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true });
        });
    }

    playSound(effect: SoundEffect) {
        if (this.isMuted) return;
        const ctx = this.ensureCtx();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Compact synthesizer: each effect = one oscillator with envelope
        switch (effect) {
            case 'shoot':
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t); osc.stop(t + 0.1);
                break;
            case 'hit':
            case 'explosion':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
                gain.gain.setValueAtTime(0.13, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.start(t); osc.stop(t + 0.15);
                break;
            case 'powerup':
            case 'level_up':
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.linearRampToValueAtTime(880, t + 0.3);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.linearRampToValueAtTime(0.001, t + 0.3);
                osc.start(t); osc.stop(t + 0.3);
                break;
            case 'correct':
            case 'victory':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, t);
                osc.frequency.setValueAtTime(659, t + 0.1);
                osc.frequency.setValueAtTime(784, t + 0.2);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                osc.start(t); osc.stop(t + 0.4);
                break;
            case 'wrong':
            case 'death':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(110, t);
                osc.frequency.exponentialRampToValueAtTime(55, t + 0.3);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.start(t); osc.stop(t + 0.3);
                break;
            case 'match_intro':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
                gain.gain.setValueAtTime(0.01, t);
                gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                osc.start(t); osc.stop(t + 0.6);
                break;
            case 'countdown_tick':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t); osc.stop(t + 0.05);
                break;
        }
    }

    pauseAll() {
        if (this.bgm) this.bgm.pause();
        if (this.audioCtx) this.audioCtx.suspend().catch(() => {});
    }

    resumeAll() {
        if (this.audioCtx) this.audioCtx.resume().catch(() => {});
        if (this.bgm && !this.isMuted) {
            this.bgm.play().catch(() => {});
        }
    }

    setMuted(muted: boolean) {
        this.isMuted = muted;
        localStorage.setItem('isMuted', String(muted));
        if (this.bgm) {
            this.bgm.muted = muted;
        }
        if (muted && this.audioCtx) {
            this.audioCtx.suspend().catch(() => {});
        } else if (this.audioCtx) {
            this.audioCtx.resume().catch(() => {});
        }
    }

    getMuted() {
        return this.isMuted;
    }
}

export const audioManager = AudioManager.getInstance();
