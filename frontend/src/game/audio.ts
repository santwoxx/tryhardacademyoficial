/**
 * TRYHARD ACADEMY - Audio System
 * Handles Background Music and Sound Effects
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
    | 'wrong';

class AudioManager {
    private static instance: AudioManager;
    private bgm: HTMLAudioElement | null = null;
    private sounds: Map<SoundEffect, HTMLAudioElement[]> = new Map();
    private isMuted: boolean = false;
    private volume: number = 0.3;
    private sfxVolume: number = 0.4;
    private initialized: boolean = false;

    private playlist: string[] = [
        'https://image2url.com/r2/default/audio/1775610117548-903bdd15-f2f9-41fe-b533-c8ed3fe24f9a.mp3',
        'https://image2url.com/r2/default/audio/1775610150368-03a915af-cb07-46b2-b6ad-9469eb700dac.mp3'
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

    private soundUrls: Record<SoundEffect, string> = {
        shoot: 'https://cdn.pixabay.com/audio/2022/02/10/audio_fc068e214d.mp3', // Simple laser/blip
        explosion: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5e2f7f90f2.mp3',
        hit: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c36940a045.mp3',
        powerup: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
        level_up: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c5df006b53.mp3',
        victory: 'https://cdn.pixabay.com/audio/2021/11/25/audio_91b1626f30.mp3',
        death: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3cd0301e7e.mp3',
        correct: 'https://cdn.pixabay.com/audio/2022/03/10/audio_783cd3a602.mp3',
        wrong: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3cd0301e7e.mp3'
    };

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Pre-load common sounds (pool of 5 for each to allow overlapping)
        const effects: SoundEffect[] = [
            'shoot', 'explosion', 'hit', 'powerup', 
            'level_up', 'victory', 'death', 'correct', 'wrong'
        ];

        effects.forEach(effect => {
            const pool: HTMLAudioElement[] = [];
            for (let i = 0; i < 5; i++) {
                const audio = new Audio();
                audio.src = this.soundUrls[effect];
                audio.preload = 'auto';
                pool.push(audio);
            }
            this.sounds.set(effect, pool);
        });
    }

    playBGM() {
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
        this.bgm.loop = false; // We handle looping manually via 'ended' event
        this.bgm.volume = this.volume;
        this.bgm.muted = this.isMuted;
        
        this.bgm.play().catch(() => {
            // Handle autoplay policy
            const unlock = () => {
                this.bgm?.play().catch(() => {});
                window.removeEventListener('click', unlock);
                window.removeEventListener('keydown', unlock);
            };
            window.addEventListener('click', unlock);
            window.addEventListener('keydown', unlock);
        });
    }

    playSound(effect: SoundEffect) {
        if (this.isMuted) return;

        const pool = this.sounds.get(effect);
        if (!pool || pool.length === 0) {
            // Lazy load if not initialized for some reason
            this.init();
            return;
        }

        // Find an available audio element in the pool
        // Optimization: pick the first one that is paused or has ended
        const audio = pool.find(a => a.paused || a.ended) || pool[0];
        
        try {
            audio.currentTime = 0;
            audio.volume = this.sfxVolume;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // console.log("Audio play blocked", error);
                });
            }
        } catch (e) {
            // console.warn("Audio playback error", e);
        }
    }

    pauseAll() {
        if (this.bgm) this.bgm.pause();
        this.sounds.forEach(pool => {
            pool.forEach(audio => {
                if (!audio.paused) audio.pause();
            });
        });
    }

    resumeAll() {
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
    }

    getMuted() {
        return this.isMuted;
    }
}

export const audioManager = AudioManager.getInstance();
