import React, { useEffect, useRef, useState, useCallback, Component, ReactNode } from 'react';
import { Game, Projectile, RemotePlayer, GraphicQuality, Point, SKINS } from './game/engine';
import { audioManager } from './game/audio';
import { Heart, Zap, Settings, Trophy, Users, X, Crown, Timer, Star, AlertCircle, Target, Flag, CheckCircle2, BookOpen, Move, HelpCircle, Plus, Youtube, Lock, RotateCcw, Volume2, VolumeX, ShoppingBag, UserPlus, BarChart3, ShieldCheck, ChevronRight, Search, ArrowLeft, Maximize2, Minimize2, User, Globe, Bell, Trash2, Sword, Download, ArrowRight, MessageSquare, Send, Hash, WifiOff, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, firestore } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query as fsQuery, 
  where, 
  getDocs, 
  collection, 
  serverTimestamp as fsServerTimestamp,
  deleteDoc,
  orderBy as fsOrderBy,
  limit as fsLimit,
  addDoc,
  increment as fsIncrement,
  deleteField
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { MathEngine, Question } from './game/mathEngine';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy loaded components for better performance
const SkinStore = React.lazy(() => import('./components/SkinStore').then(m => ({ default: m.SkinStore })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const GlobalChat = React.lazy(() => import('./components/GlobalChat').then(m => ({ default: m.GlobalChat })));
const MiniMap = React.lazy(() => import('./components/MiniMap').then(m => ({ default: m.MiniMap })));

import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  ref,
  set,
  update,
  onValue,
  off,
  push,
  onChildAdded,
  get,
  child,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  serverTimestamp,
  remove,
  onDisconnect,
  increment,
  runTransaction,
  endAt
} from 'firebase/database';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { Browser } from '@capacitor/browser';
import { AdService } from './services/adService';

interface DatabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleDatabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Basic info without complex objects to avoid circularity/stack issues
  const errInfo = {
    error: errorMessage,
    operationType,
    path,
    userId: auth.currentUser?.uid,
    timestamp: Date.now()
  };

  console.error('Database Error:', errInfo);
  
  // Only throw if it's not a "Maximum call stack size exceeded" to avoid loops
  if (errorMessage.includes('Maximum call stack size exceeded')) {
    console.warn('Suppressed stack overflow error to prevent loop');
    return;
  }

  throw new Error(JSON.stringify({
    ...errInfo,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    }
  }));
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) message = `Firebase Error: ${parsed.error}`;
      } catch (e) {
        message = this.state.error?.message || message;
      }

      return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[1000] p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-red-500/30">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-wider">Sistema Interrompido</h1>
          <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">{message}</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-cyan-500 text-black font-black rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar Aplicativo
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="w-full py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all text-sm"
            >
              Limpar Cache e Sair
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface PlayerData {
  uid: string;
  nickname: string;
  trophies: number;
  level?: number;
  role: 'admin' | 'teacher' | 'student' | 'player' | 'pending-teacher';
  teacherId?: string;
  schoolName?: string;
  lastUpdate: any;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'kills' | 'stars' | 'level' | 'ammo' | 'defeat_type' | 'survive' | 'stars_time';
  botType?: string;
  timeLimit?: number;
  timeLeft?: number;
  completed: boolean;
  reward: number;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Eliminador I', description: 'Elimine 5 oponentes na arena', target: 5, current: 0, type: 'kills', completed: false, reward: 50 },
  { id: 'm2', title: 'Gênio Matemático', description: 'Colete 3 estrelas e resolva os desafios', target: 3, current: 0, type: 'stars', completed: false, reward: 75 },
  { id: 'm3', title: 'Veterano', description: 'Alcance o Nível 5 para provar seu valor', target: 5, current: 0, type: 'level', completed: false, reward: 100 },
  { id: 'm4', title: 'Arsenal Pesado', description: 'Gaste 100 de munição em combate', target: 100, current: 0, type: 'ammo', completed: false, reward: 50 },
  { id: 'm5', title: 'Caçador de Elite', description: 'Derrote 10 bots Avançados (Vermelhos)', target: 10, current: 0, type: 'defeat_type', botType: 'advanced', completed: false, reward: 150 },
  { id: 'm6', title: 'Mestre da Evasão', description: 'Sobreviva por 120 segundos sem morrer', target: 120, current: 0, type: 'survive', completed: false, reward: 125 },
  { id: 'm7', title: 'Flash Matemático', description: 'Colete 5 estrelas em menos de 45 segundos', target: 5, current: 0, type: 'stars_time', timeLimit: 45, timeLeft: 45, completed: false, reward: 200 },
  { id: 'm8', title: 'O Grande Desafio', description: 'Derrote 1 Commander (Boss Final)', target: 1, current: 0, type: 'defeat_type', botType: 'boss', completed: false, reward: 500 },
];

interface HUDConfig {
  joystickMode: 'dynamic' | 'fixed';
  joystickPos: { x: number; y: number };
  shootButtonPos: { x: number; y: number };
  shootButtonSize: number;
}

const DEFAULT_HUD_CONFIG: HUDConfig = {
  joystickMode: 'fixed',
  joystickPos: { x: 120, y: -120 }, // Moved further to corner
  shootButtonPos: { x: -120, y: -120 }, // Moved further to corner
  shootButtonSize: 140,
};

const CornerDecoration = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-current" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-current" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-current" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-current" />
  </div>
);

// Helper to ensure unique keys and log duplicates
const deduplicateItems = <T,>(items: T[], keyExtractor: (item: T, index: number) => string, listName: string): T[] => {
  if (!items) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  items.forEach((item, index) => {
    const key = keyExtractor(item, index);
    if (seen.has(key)) {
      console.error(`[REACT KEY COLLISION] List: ${listName}, Key: ${key}. This will cause rendering issues.`);
    } else {
      seen.add(key);
      result.push(item);
    }
  });
  return result;
};

interface GameHUDProps {
  stats: { lives: number; ammo: number; kills: number; level: number };
  currentLevel: number;
  engineState: 'playing' | 'transition' | 'loading';
  loadingProgress: number;
  killFeed: any[];
  room: any;
  missions: Mission[];
  currentMissionIndex: number;
  missionProgressFeedback: any;
  showMissionComplete: boolean;
  activePowerUps: string[];
  isTouch: boolean;
  hudConfig: HUDConfig;
  joystickActive: boolean;
  joystickPos: { x: number; y: number } | null;
  joystickHandlePos: { x: number; y: number };
  isShootingMobile: boolean;
  isCustomizingHUD: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setIsCustomizingHUD: (v: boolean) => void;
  setHudConfig: React.Dispatch<React.SetStateAction<HUDConfig>>;
  setShowSettings: (v: boolean) => void;
  onExit: () => void;
  gameRef: React.RefObject<Game | null>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const GameHUD = React.memo<GameHUDProps>(({
  stats,
  currentLevel,
  engineState,
  loadingProgress,
  killFeed,
  room,
  missions,
  currentMissionIndex,
  missionProgressFeedback,
  showMissionComplete,
  activePowerUps,
  isTouch,
  hudConfig,
  joystickActive,
  joystickPos,
  joystickHandlePos,
  isShootingMobile,
  isCustomizingHUD,
  isFullscreen,
  toggleFullscreen,
  setIsCustomizingHUD,
  setHudConfig,
  setShowSettings,
  onExit,
  gameRef,
  canvasRef
}) => {
  return (
    <>
      <AnimatePresence>
        {engineState === 'transition' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[100] pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="text-center relative"
            >
              <div className="absolute -inset-20 bg-cyan-500/20 blur-[100px] rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 border border-cyan-500/20 rounded-full border-dashed"
              />
              <motion.h2 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl font-black text-white mb-4 tracking-tighter italic drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                NÍVEL CONCLUÍDO
              </motion.h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-cyan-500/50" />
                <p className="text-3xl text-cyan-400 font-bold uppercase tracking-[0.3em] font-mono">NÍVEL {currentLevel + 1}</p>
                <div className="h-px w-12 bg-cyan-500/50" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {engineState === 'loading' && (
          <LoadingScreen progress={loadingProgress} level={currentLevel + 1} />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-[100] pointer-events-none opacity-40 hover:opacity-100 transition-opacity flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Gato Galudo</span>
        </div>
      </div>

      <div className="fixed top-44 right-4 z-40 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {deduplicateItems(killFeed, (k) => `kill-${k.id}`, 'KillFeed').map((kill) => (
            <motion.div
              key={`kill-${kill.id}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
            >
              <span className="text-cyan-400 font-bold">{kill.killer}</span>
              <Target size={14} className="text-white/40" />
              <span className="text-orange-500 font-bold">{kill.victim}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!room && (
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed top-[140px] left-6 landscape:top-5 landscape:left-auto landscape:right-6 landscape:scale-75 landscape:origin-top-right z-50 flex flex-col gap-2 pointer-events-none"
        >
          <div className="hud-card min-w-[200px] !py-3 !px-4 bg-black/60 landscape:bg-black/40 border-cyan-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-90 landscape:opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Missão Ativa</span>
              </div>
              {missions[currentMissionIndex].type === 'stars_time' && (
                <div className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
                  <Timer className="w-3 h-3 text-red-400" />
                  <span className="text-[9px] font-mono font-bold text-red-400">{missions[currentMissionIndex].timeLeft}s</span>
                </div>
              )}
            </div>
            <div className="text-xs font-black text-white mb-1 tracking-tight">{missions[currentMissionIndex].title}</div>
            <div className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-2">{missions[currentMissionIndex].description}</div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(0,242,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (missions[currentMissionIndex].current / missions[currentMissionIndex].target) * 100)}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
              </div>
              <span className="text-[10px] font-black text-white italic tabular-nums">
                {missions[currentMissionIndex].current}
                <span className="text-white/30 mx-0.5">/</span>
                {missions[currentMissionIndex].target}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {missionProgressFeedback && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed top-[260px] left-6 z-50 pointer-events-none"
          >
            <div className="bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-3 shadow-lg">
              <div className="w-1 h-6 bg-cyan-400 rounded-full" />
              <div>
                <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Progresso</div>
                <div className="text-[10px] font-bold text-white">+{missionProgressFeedback.current}/{missionProgressFeedback.target}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMissionComplete && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-[#00f2ff] via-[#bc13fe] to-[#00f2ff] p-[2px] rounded-2xl shadow-[0_0_60px_rgba(0,242,255,0.5)] bg-[length:200%_auto] animate-gradient-x">
              <div className="bg-black/90 backdrop-blur-xl px-10 py-6 rounded-2xl flex flex-col items-center relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"
                />
                <div className="flex items-center gap-4 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Trophy className="w-10 h-10 text-[#ffea00] drop-shadow-[0_0_15px_rgba(255,234,0,0.6)]" />
                  </motion.div>
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">MISSÃO CONCLUÍDA!</h2>
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-1" />
                  </div>
                </div>
                <p className="text-[#00f2ff] text-sm font-black uppercase tracking-[0.3em] mt-2">RECOMPENSA: +{missions[currentMissionIndex].reward} TROFÉUS</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ui-overlay flex flex-col gap-3 !top-6 !left-6 landscape:!top-3 landscape:!left-3 landscape:scale-90 landscape:origin-top-left">
        <div className={`flex items-center gap-4 ${isTouch && room ? 'max-md:gap-2' : ''}`}>
          <div className="hud-card !py-2 !px-4 bg-black/80 flex items-center gap-4">
            <div className={`relative group ${isTouch && room ? 'max-md:hidden' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center border-2 border-white/30 shadow-[0_0_20px_rgba(0,242,255,0.3)] relative z-10 overflow-hidden">
                <span className="text-white font-black text-lg italic relative z-10 drop-shadow-lg">{stats.level}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {deduplicateItems([1, 2, 3], (val) => `life-bar-${val}`, 'HUDLifeBars').map((val) => (
                    <motion.div 
                      key={`life-bar-${val}`} 
                      animate={{ 
                        scale: val <= stats.lives ? 1 : 0.9,
                        opacity: val <= stats.lives ? 1 : 0.2
                      }}
                      className={`w-5 h-2 rounded-sm transition-all duration-300 ${val <= stats.lives ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/10">
                  <motion.div 
                    className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.4)]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(stats.ammo / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 border-l border-white/10 pl-4 ${isTouch && room ? 'max-md:hidden' : ''}`}>
              <div className="text-right">
                <div className="text-[10px] font-black text-white italic tabular-nums">{stats.kills} KILLS</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
            >
              <Settings size={18} />
            </button>

            <button 
              onClick={onExit}
              className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all pointer-events-auto group relative"
            >
              <ArrowLeft size={18} />
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[8px] font-black uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Sair
              </div>
            </button>

            <button 
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <AnimatePresence>
            {deduplicateItems(activePowerUps, (type) => `powerup-${type}`, 'ActivePowerUps').map((type) => (
              <motion.div
                key={`powerup-${type}`}
                initial={{ scale: 0, x: -20, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, x: -20, opacity: 0 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                  type === 'shield' ? 'bg-blue-500/20 border-blue-400 text-blue-400' :
                  type === 'rapid' ? 'bg-orange-500/20 border-orange-400 text-orange-400' :
                  type === 'speed' ? 'bg-green-500/20 border-green-400 text-green-400' :
                  'bg-purple-500/20 border-purple-400 text-purple-400'
                }`}
              >
                <span className="font-black text-xs uppercase tracking-tighter">
                  {type === 'shield' ? 'S' : type === 'rapid' ? 'R' : type === 'speed' ? 'V' : 'T'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ touchAction: 'none' }} />

      <React.Suspense fallback={null}>
        <MiniMap game={gameRef.current} visible={!!room} />
      </React.Suspense>

      {isTouch && !isCustomizingHUD && (
        <>
          {(hudConfig.joystickMode === 'fixed' || (joystickActive && joystickPos)) && (
            <div 
              className="fixed pointer-events-none z-[150]"
              style={{ 
                left: hudConfig.joystickMode === 'fixed' 
                  ? (hudConfig.joystickPos.x < 0 ? window.innerWidth + hudConfig.joystickPos.x : hudConfig.joystickPos.x)
                  : (joystickPos?.x || 0), 
                top: hudConfig.joystickMode === 'fixed'
                  ? (hudConfig.joystickPos.y < 0 ? window.innerHeight + hudConfig.joystickPos.y : hudConfig.joystickPos.y)
                  : (joystickPos?.y || 0),
                transform: 'translate(-50%, -50%)',
                opacity: hudConfig.joystickMode === 'fixed' && !joystickActive ? 0.5 : 1
              }}
            >
              <div className="w-24 h-24 rounded-full border-2 border-[#00f2ff]/30 bg-black/40 backdrop-blur-sm flex items-center justify-center relative">
                <div className="absolute inset-[-8px] rounded-full border border-[#00f2ff]/5 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-[#00f2ff]/10" />
                <div className="absolute w-1 h-1 rounded-full bg-[#00f2ff]/40" />
                
                <motion.div 
                  className="w-12 h-12 rounded-full bg-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.6)] flex items-center justify-center"
                  animate={{ x: joystickHandlePos.x, y: joystickHandlePos.y }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                </motion.div>
              </div>
            </div>
          )}

          <div 
            className="fixed z-[150] pointer-events-none"
            style={{
              left: hudConfig.shootButtonPos.x < 0 ? window.innerWidth + hudConfig.shootButtonPos.x : hudConfig.shootButtonPos.x,
              top: hudConfig.shootButtonPos.y < 0 ? window.innerHeight + hudConfig.shootButtonPos.y : hudConfig.shootButtonPos.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div 
              className={`rounded-full border-4 flex items-center justify-center transition-all ${
                isShootingMobile ? 'bg-[#bc13fe] border-white scale-110 shadow-[0_0_30px_rgba(188,19,254,0.6)]' : 'bg-[#bc13fe]/20 border-[#bc13fe] scale-100'
              }`}
              style={{ width: hudConfig.shootButtonSize, height: hudConfig.shootButtonSize }}
              animate={{ scale: isShootingMobile ? 1.1 : 1 }}
            >
              <Zap className={`w-8 h-8 ${isShootingMobile ? 'text-white' : 'text-[#bc13fe]'}`} />
            </motion.div>
          </div>
        </>
      )}

      {isCustomizingHUD && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Grid Overlay for alignment */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <div className="absolute top-0 left-0 w-full p-8 bg-gradient-to-b from-black/80 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Comandos Mobile</h2>
              <p className="text-[#bc13fe] text-[10px] uppercase tracking-[0.5em] font-black animate-pulse">Modo de Edição Ativo</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  setHudConfig((prev: any) => ({
                    ...prev,
                    joystickMode: prev.joystickMode === 'dynamic' ? 'fixed' : 'dynamic'
                  }));
                }}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  hudConfig.joystickMode === 'fixed' ? 'bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {hudConfig.joystickMode === 'fixed' ? <Lock className="w-3 h-3" /> : <Move className="w-3 h-3" />}
                Joystick: {hudConfig.joystickMode === 'fixed' ? 'Fixo' : 'Dinâmico'}
              </button>
              
              <button 
                onClick={() => setHudConfig(DEFAULT_HUD_CONFIG)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
              
              <button 
                onClick={() => {
                  const saved = localStorage.getItem('hudConfig');
                  if (saved) setHudConfig(JSON.parse(saved));
                  else setHudConfig(DEFAULT_HUD_CONFIG);
                  setIsCustomizingHUD(false);
                }}
                className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Cancelar
              </button>
              
              <button 
                onClick={() => {
                  localStorage.setItem('hudConfig', JSON.stringify(hudConfig));
                  setIsCustomizingHUD(false);
                  audioManager.playSound('correct');
                }}
                className="px-8 py-2.5 bg-[#bc13fe] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_40px_rgba(188,19,254,0.4)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-3 h-3" />
                Salvar Layout
              </button>
            </div>
          </div>

          <div className="relative w-[calc(100%-2rem)] h-[calc(100%-120px)] border-2 border-dashed border-white/5 rounded-[3rem] mt-20 flex items-center justify-center">
             <div className="text-white/5 text-4xl font-black uppercase tracking-[1em] pointer-events-none select-none">Preview Arena</div>
             
             {/* Joystick Drag Target */}
             <motion.div
               drag
               dragMomentum={false}
               dragElastic={0}
               onDragEnd={(_, info) => {
                 // Calculate final position relative to edges
                 const x = hudConfig.joystickPos.x < 0 ? window.innerWidth + hudConfig.joystickPos.x : hudConfig.joystickPos.x;
                 const y = hudConfig.joystickPos.y < 0 ? window.innerHeight + hudConfig.joystickPos.y : hudConfig.joystickPos.y;
                 
                 const newXAbs = x + info.offset.x;
                 const newYAbs = y + info.offset.y;
                 
                 // Normalize back to current corner preference
                 setHudConfig((prev: any) => ({
                   ...prev,
                   joystickPos: { 
                     x: prev.joystickPos.x < 0 ? newXAbs - window.innerWidth : newXAbs,
                     y: prev.joystickPos.y < 0 ? newYAbs - window.innerHeight : newYAbs
                   }
                 }));
               }}
               style={{ 
                 left: hudConfig.joystickPos.x < 0 ? window.innerWidth + hudConfig.joystickPos.x : hudConfig.joystickPos.x,
                 top: hudConfig.joystickPos.y < 0 ? window.innerHeight + hudConfig.joystickPos.y : hudConfig.joystickPos.y,
                 position: 'absolute',
                 transform: 'translate(-50%, -50%)',
                 cursor: 'grab'
               }}
               className="w-32 h-32 rounded-full border-4 border-cyan-400 group flex items-center justify-center bg-cyan-400/20 backdrop-blur-sm shadow-[0_0_50px_rgba(0,242,255,0.2)]"
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9, cursor: 'grabbing' }}
             >
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-cyan-400">Analógico</div>
               <Move className="w-8 h-8 text-cyan-400" />
               <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-20" />
             </motion.div>

             {/* Shoot Button Drag Target */}
             <motion.div
               drag
               dragMomentum={false}
               dragElastic={0}
               onDragEnd={(_, info) => {
                 const x = hudConfig.shootButtonPos.x < 0 ? window.innerWidth + hudConfig.shootButtonPos.x : hudConfig.shootButtonPos.x;
                 const y = hudConfig.shootButtonPos.y < 0 ? window.innerHeight + hudConfig.shootButtonPos.y : hudConfig.shootButtonPos.y;
                 
                 const newXAbs = x + info.offset.x;
                 const newYAbs = y + info.offset.y;

                 setHudConfig((prev: any) => ({
                   ...prev,
                   shootButtonPos: { 
                     x: prev.shootButtonPos.x < 0 ? newXAbs - window.innerWidth : newXAbs,
                     y: prev.shootButtonPos.y < 0 ? newYAbs - window.innerHeight : newYAbs
                   }
                 }));
               }}
               style={{ 
                 left: hudConfig.shootButtonPos.x < 0 ? window.innerWidth + hudConfig.shootButtonPos.x : hudConfig.shootButtonPos.x,
                 top: hudConfig.shootButtonPos.y < 0 ? window.innerHeight + hudConfig.shootButtonPos.y : hudConfig.shootButtonPos.y,
                 position: 'absolute',
                 transform: 'translate(-50%, -50%)',
                 cursor: 'grab',
                 width: hudConfig.shootButtonSize,
                 height: hudConfig.shootButtonSize
               }}
               className="rounded-full border-4 border-[#bc13fe] flex items-center justify-center bg-[#bc13fe]/20 backdrop-blur-sm shadow-[0_0_50px_rgba(188,19,254,0.2)]"
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9, cursor: 'grabbing' }}
             >
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-[#bc13fe]">Botão de Tiro</div>
               <Zap className="w-10 h-10 text-[#bc13fe]" />
               <div className="absolute inset-0 rounded-full border border-[#bc13fe]/30 animate-pulse opacity-20" />
             </motion.div>
          </div>
          
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Dica: Posicione os controles onde for mais confortável para seus polegares</span>
          </div>
        </motion.div>
      )}
    </>
  );
});

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const [userTypeSelection, setUserTypeSelection] = useState<'player' | 'teacher' | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [gameState, setGameState] = useState<'auth' | 'menu' | 'playing' | 'lobby' | 'admin-panel' | 'teacher-panel'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'set-nickname'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showMissionsMenu, setShowMissionsMenu] = useState(false);
  const [currentSkinId, setCurrentSkinId] = useState<number | string>(() => {
    const saved = localStorage.getItem('selectedSkinId');
    if (saved) {
      return isNaN(parseInt(saved)) ? saved : parseInt(saved);
    }
    return 1;
  });
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isLevel50Victory, setIsLevel50Victory] = useState(false);
  const [killFeed, setKillFeed] = useState<{ id: string; killer: string; victim: string; time: number }[]>([]);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [hudConfig, setHudConfig] = useState<HUDConfig>(() => {
    const saved = localStorage.getItem('hudConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all required properties exist
        if (parsed && parsed.joystickPos && parsed.shootButtonPos) {
          return { ...DEFAULT_HUD_CONFIG, ...parsed };
        }
      } catch (e) {
        console.error("Failed to parse hudConfig", e);
      }
    }
    return DEFAULT_HUD_CONFIG;
  });
  const [isCustomizingHUD, setIsCustomizingHUD] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [stats, setStats] = useState({ lives: 3, ammo: 100, kills: 0, level: 1 });
  const [highScore, setHighScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [engineState, setEngineState] = useState<'playing' | 'transition' | 'loading'>('playing');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [nickname, setNickname] = useState('');
  const [trophies, setTrophies] = useState(0);
  const [quality, setQuality] = useState<GraphicQuality>((localStorage.getItem('quality') as GraphicQuality) || 'high');
  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [lobbyFilterMode, setLobbyFilterMode] = useState<'all' | 'ffa' | 'teams'>('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [matchmakingStatus, setMatchmakingStatus] = useState<string>('');
  const [playerData, setPlayerData] = useState<any>(null);
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number } | null>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickHandlePos, setJoystickHandlePos] = useState({ x: 0, y: 0 });
  const [isShootingMobile, setIsShootingMobile] = useState(false);
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionProgressFeedback, setMissionProgressFeedback] = useState<{ title: string; current: number; target: number } | null>(null);
  
  // Ad Tracking & Session
  const [sessionStartTime] = useState(Date.now());
  const [matchCount, setMatchCount] = useState(() => {
    const saved = localStorage.getItem('matchCount');
    return saved ? parseInt(saved) : 0;
  });
  const [totalTimePlayed, setTotalTimePlayed] = useState(() => {
    const saved = localStorage.getItem('totalTimePlayed');
    return saved ? parseInt(saved) : 0;
  });
  const [adsWatched, setAdsWatched] = useState(() => {
    const saved = localStorage.getItem('adsWatched');
    return saved ? parseInt(saved) : 0;
  });
  const [matchesSinceLastAd, setMatchesSinceLastAd] = useState(0);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);
  const winAwardedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(() => audioManager.getMuted());
  
  const lastSyncTimeRef = useRef<number>(0);
  const lastSentStateRef = useRef<{ pos: Point; vel: Point; angle: number; lives: number; ammo: number } | null>(null);
  const matchmakingActiveRef = useRef(false);
  const networkTickRef = useRef<any>(null);
  const serverTimeOffsetRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const highScoreRef = useRef<number>(0);

  const lastChatCountRef = useRef<number>(0);

  const [isOnline, setIsOnline] = useState(true);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [hasNewChatMessages, setHasNewChatMessages] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // App Initialization Splash Logic
  useEffect(() => {
    let progress = 0;
    const startTime = Date.now();
    const MIN_SPLASH_TIME = 2500; // Minimum 2.5s for a polished feel

    const interval = setInterval(() => {
      // Natural slow-down as it gets closer to 90%
      const increment = Math.max(1, (90 - progress) / 10);
      progress = Math.min(95, progress + Math.random() * increment);
      setSplashProgress(progress);
    }, 150);

    // Monitor for readiness (Auth check completion + Min time)
    const checkReadiness = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (isAuthChecked && elapsed >= MIN_SPLASH_TIME) {
        setSplashProgress(100);
        setTimeout(() => {
          setIsSplashActive(false);
          clearInterval(checkReadiness);
        }, 300);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(checkReadiness);
    };
  }, [isAuthChecked]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('matchCount', matchCount.toString());
  }, [matchCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimePlayed(prev => {
        const newVal = prev + 1;
        if (newVal % 10 === 0) { // Save every 10 seconds to reduce I/O
           localStorage.setItem('totalTimePlayed', newVal.toString());
        }
        return newVal;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("Para instalar, use a opção 'Adicionar à tela de início' do seu navegador.");
    }
  };

  const toggleFullscreen = () => {
    const doc = document as any;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const el = doc.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };

  const requestLandscape = async () => {
    if (!isTouch) return;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch((e: any) => console.warn("Orientation lock denied:", e));
      }
    } catch (err) {
      console.warn("Landscape request failed:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Background music management
  useEffect(() => {
    audioManager.init();
    audioManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    audioManager.playBGM();
  }, [gameState]);

  // Audio Unlock on first interaction
  useEffect(() => {
    // Sync server time offset
    const offsetRef = ref(db, '.info/serverTimeOffset');
    const offsetUnsubscribe = onValue(offsetRef, (snap) => {
      serverTimeOffsetRef.current = snap.val() || 0;
    });

    // Monitor connection state
    const connectedRef = ref(db, '.info/connected');
    const connectedUnsubscribe = onValue(connectedRef, (snap) => {
      setIsOnline(snap.val() === true);
    });

    return () => {
      offsetUnsubscribe();
      connectedUnsubscribe();
    };
  }, []);

  // Sync quality to game instance, localStorage and Firebase
  useEffect(() => {
    localStorage.setItem('quality', quality);
    if (gameRef.current) {
      gameRef.current.setQuality(quality);
    }
    
    // Persist to Firebase if logged in and online
    if (user && isOnline) {
      const playerRef = doc(firestore, 'players', user.uid);
      updateDoc(playerRef, { 
        quality: quality,
        lastUpdate: fsServerTimestamp()
      }).catch(error => handleDatabaseError(error, OperationType.UPDATE, `players/${user.uid}`));
    }
  }, [quality, user]);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.player.skinId = currentSkinId;
    }
    localStorage.setItem('selectedSkinId', currentSkinId.toString());
    
    // Persist to Firebase if logged in and online
    if (user && isOnline) {
      const playerRef = doc(firestore, 'players', user.uid);
      updateDoc(playerRef, { 
        selectedSkinId: currentSkinId,
        lastUpdate: fsServerTimestamp()
      }).catch(error => handleDatabaseError(error, OperationType.UPDATE, `players/${user.uid}`));
    }
  }, [currentSkinId, user]);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        if (!isOnline) {
          // If offline but was logged in, just go to menu
          setGameState('menu');
          setIsAuthChecked(true);
          return;
        }
        const playerRef = doc(firestore, 'players', u.uid);
        let currentOpPath = `players/${u.uid}`;
        try {
          const playerSnap = await getDoc(playerRef);
          
          // Check for role invitation if new user or no role
          let role = 'player';
          let teacherId = null;
          let schoolName = null;
          
          if (u.email) {
            currentOpPath = `invitations`;
            const invitationRef = doc(firestore, 'invitations', u.email.toLowerCase().trim());
            const invitationSnap = await getDoc(invitationRef);
            if (invitationSnap.exists()) {
              const inviteData = invitationSnap.data();
              role = inviteData.role;
              teacherId = inviteData.teacherId || null;
              schoolName = inviteData.schoolName || null;
            }
          }

          if (u.email === "natanmarinhocanalyt@gmail.com") {
            role = 'admin';
          }

          currentOpPath = `players/${u.uid}`;
          if (!playerSnap.exists()) {
            // If no selection and no invitation, wait for selection
            if (!userTypeSelection && role === 'player' && u.email !== "natanmarinhocanalyt@gmail.com") {
              setGameState('auth');
              return;
            }

            // New user initialization
            const initialRole = userTypeSelection === 'teacher' ? 'pending-teacher' : role;
            const initialNick = authNickname || (u.displayName ? u.displayName.split(' ')[0].substring(0, 15) : u.email?.split('@')[0].substring(0, 15) || 'Player');
            const newPlayerData = {
              uid: u.uid,
              nickname: initialNick,
              trophies: 0,
              level: 1,
              role: initialRole,
              teacherId,
              schoolName,
              lastUpdate: fsServerTimestamp()
            };
            await setDoc(playerRef, newPlayerData);
            
            // Shadow write to RTDB for compatibility with RTDB rules
            if (isOnline) {
              const userRef = ref(db, `players/${u.uid}`);
              set(userRef, newPlayerData).catch(e => console.warn("RTDB shadow write failed:", e));
            }

            setPlayerData(newPlayerData);
            setNickname(initialNick);
            setTrophies(0);
            
            if (initialRole === 'pending-teacher') {
              setGameState('auth');
            } else {
              setGameState('menu');
            }
          } else {
            const data = playerSnap.data() as any;
            
            // Update role if it changed via invitation but not yet in player doc
            if (role !== 'player' && (data.role === 'player' || data.role === 'pending-teacher')) {
              await updateDoc(playerRef, { role, teacherId, schoolName });
              
              // Shadow update RTDB
              if (isOnline) {
                const userRef = ref(db, `players/${u.uid}`);
                update(userRef, { role, teacherId, schoolName }).catch(e => console.warn("RTDB shadow update failed:", e));
              }

              data.role = role;
              data.teacherId = teacherId;
              data.schoolName = schoolName;
            }

            setPlayerData(data);
            if (data.nickname) setNickname(data.nickname);
            if (data.trophies !== undefined) setTrophies(data.trophies);
            if (data.level !== undefined) {
              setCurrentLevel(data.level);
              setStats(prev => ({ ...prev, level: data.level }));
            }
            if (data.selectedSkinId !== undefined) {
              setCurrentSkinId(data.selectedSkinId);
            }
            if (data.quality !== undefined) {
              setQuality(data.quality);
            }
            if (data.highScore !== undefined) {
              setHighScore(data.highScore);
              highScoreRef.current = data.highScore;
            }
            
            if (data.role === 'pending-teacher') {
              setGameState('auth');
            } else {
              setGameState('menu');
            }
          }
        } catch (error) {
          handleDatabaseError(error, OperationType.GET, currentOpPath);
        }
      } else {
        setUser(null);
        setPlayerData(null);
        if (isOnline) {
          setGameState('auth');
        } else {
          setGameState('menu');
        }
        // Do not reset userTypeSelection here, otherwise the selection screen loops
      }
      setIsAuthChecked(true);
    });

    return unsubscribe;
  }, [userTypeSelection]);

  // Prevent double-tap zoom on mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Notification listener
  useEffect(() => {
    if (!user) return;
    const notificationsRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notificationList = Object.entries(data).map(([id, val]: [string, any]) => ({
          ...val,
          id
        })).sort((a, b) => b.time - a.time);
        
        // Show browser notification if permitted and new
        if (notificationList.length > notifications.length && !showNotifications) {
          const latest = notificationList[0];
          if (Notification.permission === 'granted') {
            new Notification(latest.title, { body: latest.message });
          }
          audioManager.playSound('correct'); // Use 'correct' sound for notification
        }
        
        setNotifications(notificationList);
      } else {
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Option to save preference or just log
        console.log('Notification permission granted');
      }
    }
  };

  // Leaderboard listener
  useEffect(() => {
    if (!user) return;
    const playersRef = collection(firestore, 'players');
    const leaderboardQuery = fsQuery(playersRef, fsOrderBy('trophies', 'desc'), fsLimit(10));
    
    const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as PlayerData[];
      
      // Check if current user reached Top 1
      if (list.length > 0 && user && list[0].uid === user.uid) {
        if (leaderboard.length > 0 && leaderboard[0].uid !== user.uid) {
           // User just reached Top 1!
           const notificationRef = push(ref(db, `notifications/${user.uid}`));
           set(notificationRef, {
             type: 'ranked',
             title: 'DOMINAÇÃO TOTAL!',
             message: 'VOCÊ SE TORNOU O TOP 1 RANKED DA ACADEMY! MANTENHA SUA COROA!',
             time: serverTimestamp()
           });
           audioManager.playSound('victory');
        }
      }
      
      setLeaderboard(list);
    }, (error) => {
      handleDatabaseError(error, OperationType.LIST, 'players');
    });
    return () => unsubscribe();
  }, [user]);

  // Real-time Player Data Sync listener
  useEffect(() => {
    if (!user) return;
    const playerRef = doc(firestore, 'players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.trophies !== undefined) setTrophies(data.trophies);
        if (data.level !== undefined) {
          setCurrentLevel(data.level);
          setStats(prev => ({ ...prev, level: data.level }));
        }
        setPlayerData(prev => ({ ...prev, ...data }));
      }
    }, (error) => {
      handleDatabaseError(error, OperationType.GET, `players/${user.uid}`);
    });
    return () => unsubscribe();
  }, [user]);

  // Lobby rooms listener (Firestore)
  useEffect(() => {
    if (gameState !== 'lobby' || !user) {
      if (gameState !== 'lobby') setRooms([]); // Clear rooms when not in lobby
      return;
    }
    
    setLoadingRooms(true);
    const roomsRef = collection(firestore, 'rooms');
    let roomsQuery;
    
    // Optimized queries aligned with firestore.indexes.json
    if (lobbyFilterMode === 'all') {
      roomsQuery = fsQuery(
        roomsRef, 
        where('status', '==', 'waiting'), 
        fsOrderBy('createdAt', 'desc'), 
        fsLimit(15) // Limit slightly reduced for faster initial load
      );
    } else {
      roomsQuery = fsQuery(
        roomsRef, 
        where('status', '==', 'waiting'), 
        where('mode', '==', lobbyFilterMode),
        fsOrderBy('createdAt', 'desc'), 
        fsLimit(15)
      );
    }
    
    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        playerIds: Object.keys((doc.data() as any).players || {})
      }));
      
      const uniqueRooms = deduplicateItems(roomsData, (r: any) => `sync-room-${r.id}`, 'RoomsSync');
      setRooms(uniqueRooms);
      setLoadingRooms(false);
    }, (error) => {
      setLoadingRooms(false);
      // Index missing error handling (Expert level log)
      if ((error as any).code === 'failed-precondition') {
        console.warn("Lobby Error: This query requires a composite index. Check firestore.indexes.json for the required config.");
      }
      handleDatabaseError(error, OperationType.LIST, 'rooms');
    });
    
    return () => unsubscribe();
  }, [gameState, user, lobbyFilterMode]);

  // Helper for mobile feedback
  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
  };

  useEffect(() => {
    Network.getStatus().then(status => setIsOnline(status.connected));
    const netListener = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
      if (!status.connected) {
        // Fallback: pause game if online room
        if (gameState === 'playing' && room) {
          if (gameRef.current) gameRef.current.paused = true;
          alert('Conexão perdida. Tentando reconectar...');
        }
      }
    });

    // Handle back button (Capacitor)
    const backListener = CapApp.addListener('backButton', () => {
      triggerHaptic();
      if (gameState === 'playing') {
        // In game? Show exit confirmation or go back
        if (gameRef.current) gameRef.current.stop();
        setGameState('menu');
      } else if (gameState === 'lobby') {
        setGameState('menu');
      } else if (gameState === 'menu' || gameState === 'auth') {
        // Exit app if on main screens
        CapApp.exitApp();
      } else {
        setGameState('menu');
      }
    });

    // Pause/Resume background tasks (Audio)
    const pauseListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        audioManager.resumeAll();
      } else {
        audioManager.pauseAll();
      }
    });

    return () => {
      netListener.then(l => l.remove());
      backListener.then(l => l.remove());
      pauseListener.then(l => l.remove());
    };
  }, [gameState, room]);

  useEffect(() => {
    // Initialize AdMob
    if (isOnline) {
      AdService.init();
    }

    // Check for Daily Reward
    const lastReward = localStorage.getItem('lastRewardClaim');
    const today = new Date().toDateString();
    if (lastReward !== today && user && isOnline) {
       setShowDailyReward(true);
    }
  }, [user, isOnline]);

  // Global Chat listener
  useEffect(() => {
    if (!user) return;
    const chatRef = collection(firestore, 'global_chat');
    const chatQuery = fsQuery(chatRef, fsOrderBy('timestamp', 'desc'), fsLimit(50));
    
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      setChatMessages(messages);
      
      // If we got a new message and chat is not open, show notification badge
      // We use a ref to track the previous count to avoid dependency loop with showGlobalChat
      if (messages.length > lastChatCountRef.current) {
        setHasNewChatMessages(true);
      }
      lastChatCountRef.current = messages.length;
    }, (error) => {
      handleDatabaseError(error, OperationType.LIST, 'global_chat');
    });
    
    return () => unsubscribe();
  }, [user]); // Removed showGlobalChat for performance (avoid resubscribing)

  // Room waiting listener (Firestore)
  useEffect(() => {
    if (gameState !== 'lobby' || !user || !room) return;
    
    const roomDocRef = doc(firestore, 'rooms', room.id);
    const unsubscribe = onSnapshot(roomDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRoom(null);
        return;
      }
      const data = snapshot.data();
      const players = data.players || {};
      const newRoom = { ...data, id: room.id, playerIds: Object.keys(players) };
      setRoom(newRoom);
      
      if (data.status === 'playing') {
        setGameState('playing');
        // Initial RTDB gameplay data sync
        const playerGameplayRef = ref(db, `rooms/${room.id}/players/${user.uid}`);
        update(playerGameplayRef, {
          uid: user.uid,
          nickname: nickname,
          status: 'alive',
          lives: 3,
          ammo: 2,
          pos: { x: Math.random() * 800 + 100, y: Math.random() * 600 + 100 }
        });
      }
    });
    
    return () => unsubscribe();
  }, [gameState, user, room?.id, nickname]);

  const dismissNotification = (id: string) => {
    if (!user) return;
    remove(ref(db, `notifications/${user.uid}/${id}`)).catch(err => console.error('Failed to dismiss notification:', err));
  };

  const NotificationCenter = ({ notifications, onClose }: { notifications: any[], onClose: () => void }) => (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="hud-card w-80 max-h-[400px] flex flex-col gap-4 bg-black/95 backdrop-blur-2xl border-white/10"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Centro de Comando</h3>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest uppercase">
            Silêncio no rádio...
          </div>
        ) : (
          deduplicateItems(notifications, (n) => `notif-${n.id}`, 'NotificationsHUD').map(n => (
            <div key={n.id} className="hud-card !p-3 !border-l-4 border-l-cyan-500 bg-white/5 group relative overflow-hidden">
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 rounded-lg bg-cyan-400/10">
                  {n.type === 'challenge' ? <Sword className="w-4 h-4 text-cyan-400" /> : <Bell className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{n.title}</div>
                  <div className="text-[9px] text-white/60 leading-relaxed">{n.message}</div>
                  <div className="text-[8px] text-white/30 mt-2 uppercase font-bold">{new Date(n.time).toLocaleTimeString()}</div>
                </div>
                <button 
                  onClick={() => dismissNotification(n.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  const handleChallenge = (targetUid: string, targetName: string) => {
    if (!user || !db || user.uid === targetUid) return;
    
    const notificationRef = push(ref(db, `notifications/${targetUid}`));
    set(notificationRef, {
      type: 'challenge',
      title: 'DESAFIO X1!',
      message: `${nickname} te desafiou para um combate matemático na arena!`,
      from: user.uid,
      fromName: nickname,
      time: serverTimestamp()
    }).then(() => {
      audioManager.playSound('correct');
    }).catch(err => {
      handleDatabaseError(err, OperationType.WRITE, `notifications/${targetUid}`);
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      if (authMode === 'register' || authMode === 'set-nickname') {
        if (!authNickname || authNickname.length < 3) {
          throw new Error('Nickname deve ter pelo menos 3 caracteres');
        }
        
        let u = auth.currentUser;
        if (authMode === 'register') {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          u = userCredential.user;
        }

      if (u && isOnline) {
        const playerDocRef = doc(firestore, 'players', u.uid);
        if (authMode === 'register' || authMode === 'set-nickname') {
          await updateDoc(playerDocRef, {
            nickname: authNickname,
            lastUpdate: fsServerTimestamp()
          });
          setNickname(authNickname);
        }
          // We don't setGameState('menu') here anymore, 
          // we let onAuthStateChanged handle it based on the profile data
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = error.message;
      if (error.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        message = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Senha incorreta.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = `O login por e-mail/senha não está habilitado no Firebase Console para o projeto "${firebaseConfig.projectId}". Verifique se este é o ID do projeto onde você ativou o recurso.`;
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Login error:", error);
      let message = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        message = 'O login pelo Google não está habilitado no Firebase Console. Por favor, habilite-o em Authentication > Sign-in method.';
      }
      setAuthError(message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGameState('auth');
      setUser(null);
      setNickname('');
      setTrophies(0);
      setPlayerData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Persist skin selection
  useEffect(() => {
    if (user && currentSkinId && isOnline) {
       const playerRef = doc(firestore, 'players', user.uid);
       updateDoc(playerRef, { selectedSkinId: currentSkinId }).catch(() => {});
       
       // Shadow update RTDB
       const rtRef = ref(db, `players/${user.uid}`);
       update(rtRef, { selectedSkinId: currentSkinId }).catch(() => {});
    }
  }, [currentSkinId, user, isOnline]);

  const awardTrophies = useCallback(async (amount: number) => {
    if (!user || !isOnline) {
      if (!isOnline) {
        setTrophies(prev => prev + amount);
        setPlayerData((prev: any) => ({ ...prev, trophies: (prev?.trophies || 0) + amount }));
      }
      return;
    }
    
    const playerFsRef = doc(firestore, 'players', user.uid);
    const playerRtRef = ref(db, `players/${user.uid}`);
    
    try {
      // Award in Firestore (Master source for ranking)
      await updateDoc(playerFsRef, {
        trophies: fsIncrement(amount),
        lastUpdate: fsServerTimestamp()
      });
      
      // Award in RTDB (For real-time lobby visibility)
      await update(playerRtRef, {
        trophies: increment(amount)
      });
    } catch (error) {
      console.error("Error awarding trophies:", error);
    }
  }, [user, isOnline]);

  useEffect(() => {
    if (showModal || showGameOver || gameState !== 'playing') {
      if (gameRef.current) gameRef.current.setShooting(false);
      setIsShootingMobile(false);
    }
  }, [showModal, showGameOver, gameState]);

  const syncNetworkState = useCallback(() => {
    if (gameRef.current && gameRef.current.isMultiplayer && user && room) {
      const player = gameRef.current.player;
      const now = Date.now();
      
      const currentState = {
        pos: { x: Number(player.pos?.x?.toFixed(1)) || 0, y: Number(player.pos?.y?.toFixed(1)) || 0 },
        vel: { x: Number(player.vel?.x?.toFixed(1)) || 0, y: Number(player.vel?.y?.toFixed(1)) || 0 },
        angle: Number(player.angle?.toFixed(2)) || 0,
        lives: player.lives || 0,
        ammo: player.ammo || 0,
        nickname: nickname || 'Player',
        trophies: trophies || 0,
        skinId: player.skinId
      };

      // Anti-spam: Adaptive sync rate
      const lastState = lastSentStateRef.current;
      const isMoving = Math.abs(currentState.vel.x) > 0.1 || Math.abs(currentState.vel.y) > 0.1;
      
      const significantChange = !lastState ||
        Math.abs(currentState.pos.x - lastState.pos.x) > 2.0 ||
        Math.abs(currentState.pos.y - lastState.pos.y) > 2.0 ||
        Math.abs(currentState.vel.x - lastState.vel.x) > 0.5 ||
        Math.abs(currentState.vel.y - lastState.vel.y) > 0.5 ||
        Math.abs(currentState.angle - lastState.angle) > 0.15 ||
        currentState.lives !== lastState.lives ||
        currentState.ammo !== lastState.ammo ||
        currentState.skinId !== (lastState as any).skinId;

      const timeSinceLastSync = now - lastSyncTimeRef.current;
      
      // Idle: sync every 500ms
      // Moving: sync every 60ms or on significant change (min 30ms)
      const syncThreshold = isMoving ? 60 : 500;
      const minSyncInterval = 30; // Up to 33 times per second for high precision

      if ((significantChange && timeSinceLastSync > minSyncInterval) || timeSinceLastSync > syncThreshold) {
        const syncStart = Date.now();
        lastSyncTimeRef.current = now;
        lastSentStateRef.current = currentState as any;
        
        const playerRef = ref(db, `rooms/${room.id}/players/${user.uid}`);
        update(playerRef, {
          ...currentState,
          lastUpdate: serverTimestamp()
        }).catch(() => {});
      }
    }
  }, [user, room, nickname, trophies]);

  const updateStats = useCallback(() => {
    if (gameRef.current && gameRef.current.player) {
      setStats({
        lives: gameRef.current.player.lives || 0,
        ammo: gameRef.current.player.ammo || 0,
        kills: gameRef.current.totalKills || 0,
        level: gameRef.current.level || 1
      });

      // Update active power-ups
      const active = [];
      const p = gameRef.current.player.powerUps;
      if (p) {
        if (p.shield > 0) active.push('shield');
        if (p.rapid > 0) active.push('rapid');
        if (p.speed > 0) active.push('speed');
        if (p.triple > 0) active.push('triple');
      }
      setActivePowerUps(active);

      if (gameRef.current.gameState === 'loading') {
        setLoadingProgress(gameRef.current.loadingProgress);
      }

      // Update Missions Progress (Offline only)
      if (!gameRef.current.isMultiplayer) {
        setMissions(prev => {
          const currentMission = prev[currentMissionIndex];
          if (!currentMission || currentMission.completed) return prev;

          let newProgress = currentMission.current;
          if (currentMission.type === 'kills') newProgress = gameRef.current!.kills;
          if (currentMission.type === 'level') newProgress = gameRef.current!.level;
          // stars and ammo are updated in their respective callbacks

          if (newProgress >= currentMission.target && !currentMission.completed) {
            setShowMissionComplete(true);
            const reward = currentMission.reward || 10;
            awardTrophies(reward);
            
            setTimeout(() => setShowMissionComplete(false), 4000);
            
            // Move to next mission after a delay
            setTimeout(() => {
              setCurrentMissionIndex(idx => Math.min(idx + 1, prev.length - 1));
            }, 5000);

            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress, completed: true } : m);
          }

          if (newProgress !== currentMission.current) {
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress } : m);
          }
          return prev;
        });
      }
    }
  }, [currentMissionIndex]);

  // Refs for callbacks to keep useEffect stable
  const updateStatsRef = useRef(updateStats);
  const syncNetworkStateRef = useRef(syncNetworkState);
  const userRef = useRef(user);
  const roomRef = useRef(room);
  const nicknameRef = useRef(nickname);
  const trophiesRef = useRef(trophies);
  const playerDataRef = useRef(playerData);
  const currentLevelRef = useRef(currentLevel);

  useEffect(() => { updateStatsRef.current = updateStats; }, [updateStats]);
  useEffect(() => { syncNetworkStateRef.current = syncNetworkState; }, [syncNetworkState]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { roomRef.current = room; }, [room]);
  useEffect(() => { nicknameRef.current = nickname; }, [nickname]);
  useEffect(() => { trophiesRef.current = trophies; }, [trophies]);
  useEffect(() => { playerDataRef.current = playerData; }, [playerData]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  // Multi-user competitive match state monitor
  useEffect(() => {
    if (gameState !== 'playing' || !user || !room) return;
    
    // FFA Win Condition: Only 1 alive player remains
    if (room.mode === 'ffa') {
      const alivePlayers = Object.entries(room.players || {}).filter(([pid, p]: [string, any]) => p.status === 'alive');
      if (alivePlayers.length === 1 && !winAwardedRef.current) {
        const winnerId = alivePlayers[0][0];
        if (winnerId === user.uid) {
          winAwardedRef.current = true;
          setShowVictory(true);
          awardTrophies(25); // Competitive win reward
          audioManager.playSound('victory');
          
          // Finalize room record
          const roomDocRef = doc(firestore, 'rooms', room.id);
          updateDoc(roomDocRef, {
            status: 'finished',
            winnerId: user.uid
          });
        }
      }
    }
    
    // 2v2 Win Condition: One team entirely dead
    if (room.mode === 'teams') {
      const teamA = Object.entries(room.players || {}).filter(([pid, p]: [string, any]) => p.team === 'A');
      const teamB = Object.entries(room.players || {}).filter(([pid, p]: [string, any]) => p.team === 'B');
      
      const teamAAlive = teamA.some(([pid, p]: [string, any]) => p.status === 'alive');
      const teamBAlive = teamB.some(([pid, p]: [string, any]) => p.status === 'alive');
      
      if ((!teamAAlive || !teamBAlive) && !winAwardedRef.current) {
        const winnerTeam = teamAAlive ? 'A' : 'B';
        const myTeam = room.players?.[user.uid]?.team;
        
        if (myTeam === winnerTeam) {
          winAwardedRef.current = true;
          setShowVictory(true);
          awardTrophies(15); // Team win reward
          audioManager.playSound('victory');
        } else {
          winAwardedRef.current = true;
          setShowGameOver(true);
          audioManager.playSound('death');
        }

        if (room.hostId === user.uid) {
          const roomDocRef = doc(firestore, 'rooms', room.id);
          updateDoc(roomDocRef, {
            status: 'finished',
            winnerTeam: winnerTeam
          });
        }
      }
    }

    // Sync local engine status with Firestore truth
    if (gameRef.current && room.players?.[user.uid]) {
      gameRef.current.player.status = room.players[user.uid].status;
      gameRef.current.player.team = room.players[user.uid].team;
    }
  }, [room, gameState, user]);

  useEffect(() => {
    if (!canvasRef.current || gameState !== 'playing') return;

    const game = new Game(canvasRef.current);
    const isMobileDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0) || window.innerWidth < 1024;
    game.isMobile = isMobileDevice;
    setIsTouch(isMobileDevice);
    gameRef.current = game;
    
    const currentUser = userRef.current;
    const currentRoom = roomRef.current;

    if (currentUser) {
      game.setQuality(quality);
      game.player.skinId = currentSkinId;
      (game.player as any).uid = currentUser.uid;
      (game.player as any).nickname = nicknameRef.current;
      (game.player as any).trophies = playerDataRef.current?.trophies || 0;
      
      if (currentRoom && currentRoom.players && currentRoom.players[currentUser.uid]) {
        const pData = currentRoom.players[currentUser.uid];
        // Ensure lives are set correctly from room data, defaulting to 3
        game.player.lives = pData.lives !== undefined ? pData.lives : 3;
        game.player.ammo = pData.ammo !== undefined ? pData.ammo : 2;
        
        // Reset game over state if we are just starting
        game.gameOver = false;
        setShowGameOver(false);
        setShowVictory(false);
      }
    }

    game.onPlayerHit = (victimId, damage, killerId) => {
      const currentRoom = roomRef.current;
      const currentUser = userRef.current;
      if (game.isMultiplayer && currentRoom && currentUser) {
        // Only the victim is responsible for updating their own state
        if (victimId === currentUser.uid) {
          const newLives = Math.max(0, game.player.lives - (damage || 1));
          
          // Only update if lives actually changed
          if (newLives !== game.player.lives) {
            game.player.lives = newLives;
            if (newLives > 0) audioManager.playSound('hit');
            
            // Sync lives to Firebase
            const victimRef = ref(db, `rooms/${currentRoom.id}/players/${victimId}`);
            update(victimRef, { lives: newLives }).catch(() => {});
            
            // If died, report kill and award trophies
            if (newLives <= 0) {
              game.gameOver = true;
              setShowGameOver(true);
              audioManager.playSound('death');
              
              // Sync status to RTDB (Authoritative for engine)
              const playerRtRef = ref(db, `rooms/${currentRoom.id}/players/${victimId}`);
              runTransaction(playerRtRef, (p) => {
                if (p) p.status = 'dead';
                return p;
              });

              // Sync status to Firestore for match termination logic
              const roomDocRef = doc(firestore, 'rooms', currentRoom.id);
              updateDoc(roomDocRef, {
                [`players.${victimId}.status`]: 'dead'
              });
              
              // Report kill
              const victimName = nicknameRef.current || 'Unknown';
              const killerName = game.remotePlayers.get(killerId || '')?.nickname || (killerId === currentUser.uid ? victimName : 'Unknown');
              
              const killRef = ref(db, `rooms/${currentRoom.id}/kills`);
              push(killRef, {
                killer: killerName,
                victim: victimName,
                timestamp: serverTimestamp()
              });
              
              // Award trophies to killer (+3)
              if (killerId && killerId !== currentUser.uid) {
                // Award in current room (RTDB)
                const killerRef = ref(db, `rooms/${currentRoom.id}/players/${killerId}`);
                update(killerRef, { trophies: increment(3) });
                
                // Award globally in Firestore/RTDB if it's the current local player
                // (Server-side/Authoritative killed notification would be better, but this works for client-auth)
                if (killerId === currentUser.uid) {
                  awardTrophies(3);
                }
              }
            }
          }
        }
      }
    };

    game.onBotKilled = (type) => {
      if (!game.isMultiplayer) {
        setMissions(prev => {
          const currentMission = prev[currentMissionIndex];
          if (currentMission && currentMission.type === 'defeat_type' && currentMission.botType === type && !currentMission.completed) {
            const newProgress = currentMission.current + 1;
            if (newProgress < currentMission.target) {
              setMissionProgressFeedback({ title: currentMission.title, current: newProgress, target: currentMission.target });
              setTimeout(() => setMissionProgressFeedback(null), 2000);
            }
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress } : m);
          }
          return prev;
        });
      }
    };

    game.onStarCollected = (index) => {
      let q = MathEngine.getInstance().generateQuestion(undefined, currentLevelRef.current);
      
      // Safety fallback: ensure a question is ALWAYS generated
      if (!q) {
        q = {
          id: `fallback-${Date.now()}`,
          text: '2 + 2 = ?',
          options: [3, 4, 5, 6],
          answer: 4,
          difficulty: 'easy',
          explanation: 'Básico!'
        };
      }

      const skin = SKINS.find(s => s.id === currentSkinId);
      const multiplier = (skin && skin.responseTimeMultiplier) ? skin.responseTimeMultiplier : 1;
      const baseTime = q.difficulty === 'hard' ? 10 : q.difficulty === 'medium' ? 8 : 6;

      setCurrentQuestion(q);
      setSelectedOption(null);
      setFeedback(null);
      setTimeLeft(baseTime * multiplier);
      setShowModal(true);
      
      // Pause game in offline mode
      if (!game.isMultiplayer) {
        game.paused = true;
      } else if (index !== undefined && index !== -1) {
        // Sync star collection in multiplayer
        const starRef = ref(db, `rooms/${currentRoom.id}/stars/${index}`);
        update(starRef, { active: false }).catch(() => {});
      }

      // Update mission progress for stars
      if (!game.isMultiplayer) {
        setMissions(prev => {
          const currentMission = prev[currentMissionIndex];
          if (currentMission && (currentMission.type === 'stars' || currentMission.type === 'stars_time') && !currentMission.completed) {
            const newProgress = currentMission.current + 1;
            if (newProgress < currentMission.target) {
              setMissionProgressFeedback({ title: currentMission.title, current: newProgress, target: currentMission.target });
              setTimeout(() => setMissionProgressFeedback(null), 2000);
            }
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress } : m);
          }
          return prev;
        });
      }
    };

    game.onShoot = (projectile) => {
      
      // Update mission progress for ammo (shots fired)
      if (!game.isMultiplayer) {
        setMissions(prev => {
          const currentMission = prev[currentMissionIndex];
          if (currentMission && currentMission.type === 'ammo' && !currentMission.completed) {
            const newProgress = currentMission.current + 1;
            if (newProgress % 10 === 0 && newProgress < currentMission.target) {
              setMissionProgressFeedback({ title: currentMission.title, current: newProgress, target: currentMission.target });
              setTimeout(() => setMissionProgressFeedback(null), 2000);
            }
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress } : m);
          }
          return prev;
        });
      }

      const currentRoom = roomRef.current;
      const currentUser = userRef.current;
      if (currentRoom && currentUser) {
        const projectilesRef = ref(db, `rooms/${currentRoom.id}/projectiles`);
        const newProjRef = push(projectilesRef);
        set(newProjRef, {
          pos: { x: Number(projectile.pos.x.toFixed(1)), y: Number(projectile.pos.y.toFixed(1)) },
          vel: { x: Number(projectile.vel.x.toFixed(1)), y: Number(projectile.vel.y.toFixed(1)) },
          angle: Number(projectile.angle.toFixed(3)),
          ownerId: projectile.ownerId || currentUser.uid,
          ownerType: projectile.owner || 'player',
          timestamp: serverTimestamp()
        }).catch(error => handleDatabaseError(error, OperationType.WRITE, `rooms/${currentRoom.id}/projectiles/${newProjRef.key}`));
        
        // Auto-delete projectile doc after 2 seconds to keep DB clean
        setTimeout(() => remove(newProjRef).catch(() => {}), 2000);
      }
    };

    game.onGameOver = async () => {
      const now = Date.now();
      const duration = Math.floor((now - gameStartTimeRef.current) / 1000);
      setSurvivalTime(duration);
      
      setShowGameOver(true);
      const currentUser = userRef.current;
      const currentRoom = roomRef.current;
      
      // Ad increment logic & persistence
      setMatchCount(prev => {
        const next = prev + 1;
        localStorage.setItem('matchCount', next.toString());
        return next;
      });

      // Natural Ad Trigger removed as per user request to block ads inside matches
      // setTimeout(() => triggerAd(), 1000);

      // Update High Score if needed
      if (stats.kills > highScoreRef.current) {
        setHighScore(stats.kills);
        highScoreRef.current = stats.kills;
        if (currentUser) {
          const playerRef = doc(firestore, 'players', currentUser.uid);
          updateDoc(playerRef, { highScore: stats.kills }).catch(() => {});
        }
      }

      if (game.isMultiplayer && currentUser && currentRoom) {
        // Update trophies: -1 on defeat
        const playerRef = doc(firestore, 'players', currentUser.uid);
        const newTrophies = Math.max(0, trophiesRef.current - 1);
        try {
          await updateDoc(playerRef, { trophies: newTrophies });
          setTrophies(newTrophies);
          // Also update room status to end if needed, or just leave
          remove(ref(db, `rooms/${currentRoom.id}/players/${currentUser.uid}`));
        } catch (error) {
          handleDatabaseError(error, OperationType.UPDATE, `players/${currentUser.uid}`);
        }
      }
    };

    if (currentRoom && currentUser) {
      game.isMultiplayer = true;
      game.isHost = currentRoom.playerIds[0] === currentUser.uid;

      // Listen for local player lives from Firebase in multiplayer
      const myLivesRef = ref(db, `rooms/${currentRoom.id}/players/${currentUser.uid}/lives`);
      const livesUnsubscribe = onValue(myLivesRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteLives = snapshot.val();
          if (game.player.lives !== remoteLives) {
            game.player.lives = remoteLives;
            if (remoteLives <= 0 && !game.gameOver) {
              // Double check if game actually started to avoid instant defeat bug
              if (game.isRunning) {
                game.gameOver = true;
                game.onGameOver?.();
              }
            }
          }
        }
      });

      // Listen for ALL players in the room
      const roomPlayersRef = ref(db, `rooms/${currentRoom.id}/players`);
      const playersUnsubscribe = onValue(roomPlayersRef, (snapshot) => {
        if (!snapshot.exists()) {
          setGameState('menu');
          setRoom(null);
          return;
        }
        const playersData = snapshot.val();
        for (const uid in playersData) {
          if (uid !== currentUser.uid) {
            const data = playersData[uid];
            let remote = game.remotePlayers.get(uid);
            if (!remote) {
              remote = new RemotePlayer(uid, data.nickname || 'Opponent', data.trophies || 0, data.pos?.x || 0, data.pos?.y || 0);
              game.remotePlayers.set(uid, remote);
            }
            
            // Update remote player data
            remote.updateFromRemote(data);

            // Victory condition: If other player is dead
            // Only check if game is running and we are not already in game over
            if (game.isRunning && data.lives <= 0 && !game.gameOver) {
              game.gameOver = true;
              game.paused = true;
              setIsLevel50Victory(false);
              setShowVictory(true);
              // Update trophies: +3 on victory
              const playerRef = doc(firestore, 'players', currentUser.uid);
              const newTrophies = trophiesRef.current + 3;
              updateDoc(playerRef, { trophies: newTrophies }).then(() => {
                setTrophies(newTrophies);
              });
            }
          }
        }
        // Remove players that left
        let playerLeft = false;
        game.remotePlayers.forEach((_, uid) => {
          if (!playersData[uid]) {
            game.remotePlayers.delete(uid);
            playerLeft = true;
          }
        });

        // If we are in a match and an opponent left, and we are the only one left, we win
        // Only trigger if game was already running to avoid lobby issues
        if (game.isRunning && gameState === 'playing' && playerLeft && game.remotePlayers.size === 0 && !game.gameOver) {
          game.gameOver = true;
          game.paused = true;
          setIsLevel50Victory(false);
          setShowVictory(true);
          // Update trophies: +3 on victory
          const playerRef = doc(firestore, 'players', currentUser.uid);
          const newTrophies = trophiesRef.current + 3;
          updateDoc(playerRef, { trophies: newTrophies }).then(() => {
            setTrophies(newTrophies);
          });
        }
      });

      // Listen for projectiles
      const startTime = Date.now();
      const projectilesRef = ref(db, `rooms/${currentRoom.id}/projectiles`);
      const projectilesUnsubscribe = onChildAdded(projectilesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Ignore old projectiles (older than 1s before join)
          // serverTimestamp() might be slightly different, so we use a safe margin
          if (data.timestamp && data.timestamp < startTime - 2000) return;

          // Only spawn if it's NOT our own projectile
          if (data.ownerId !== currentUser.uid) {
            const currentServerTime = Date.now() + serverTimeOffsetRef.current;
            const latency = data.timestamp ? Math.max(0, currentServerTime - data.timestamp) : 0;
            game.spawnRemoteProjectile(data, latency);
          }
        }
      });

      // Listen for stars
      const starsRef = ref(db, `rooms/${currentRoom.id}/stars`);
      const starsUnsubscribe = onValue(starsRef, (snapshot) => {
        if (snapshot.exists()) {
          const starsData = snapshot.val();
          if (Array.isArray(starsData)) {
            starsData.forEach((data: any, i: number) => {
              if (data) {
                game.updateStarFromRemote(i, data);
              }
            });
          }
        }
      });

      // Listen for powerups
      const powerUpsRef = ref(db, `rooms/${currentRoom.id}/powerups`);
      const powerUpsUnsubscribe = onValue(powerUpsRef, (snapshot) => {
        if (snapshot.exists()) {
          const powerUpsData = snapshot.val();
          if (Array.isArray(powerUpsData)) {
            powerUpsData.forEach((data: any, i: number) => {
              if (data) {
                game.updatePowerUpFromRemote(i, data);
              }
            });
          }
        }
      });

      // Listen for kills
      const killsRef = ref(db, `rooms/${currentRoom.id}/kills`);
      const killsUnsubscribe = onChildAdded(killsRef, (snapshot) => {
        const data = snapshot.val();
        // Ignore old kills
        if (data.timestamp && data.timestamp < Date.now() - 5000) return;
        
        const kill = {
          id: snapshot.key!,
          killer: data.killer,
          victim: data.victim,
          time: Date.now()
        };
        setKillFeed(prev => {
          if (prev.some(k => k.id === kill.id)) return prev;
          return [kill, ...prev].slice(0, 5);
        });
        
        // Auto-remove from feed after 5 seconds
        setTimeout(() => {
          setKillFeed(prev => prev.filter(k => k.id !== kill.id));
        }, 5000);
      });

      // Host updates
      if (game.isHost) {
        let lastStarSync = 0;
        game.onStarUpdate = (stars) => {
          const now = Date.now();
          if (now - lastStarSync > 500) { // Sync stars every 500ms
            lastStarSync = now;
            // Sync stars
            set(ref(db, `rooms/${currentRoom.id}/stars`), stars).catch(error => handleDatabaseError(error, OperationType.WRITE, `rooms/${currentRoom.id}/stars`));
            
            // Sync powerups
            const powerUpsData = game.powerUps.map(p => ({
              x: p.pos.x,
              y: p.pos.y,
              type: p.type,
              active: p.active,
              color: p.color
            }));
            set(ref(db, `rooms/${currentRoom.id}/powerups`), powerUpsData).catch(error => handleDatabaseError(error, OperationType.WRITE, `rooms/${currentRoom.id}/powerups`));
          }
        };
        // Clear old projectiles when starting
        remove(projectilesRef);
      }

      // Cleanup listeners
      (game as any)._multiplayerCleanup = () => {
        livesUnsubscribe();
        playersUnsubscribe();
        projectilesUnsubscribe();
        starsUnsubscribe();
        powerUpsUnsubscribe();
        killsUnsubscribe();
        
        // Remove self from room on exit
        remove(ref(db, `rooms/${currentRoom.id}/players/${currentUser.uid}`));
        // If room is empty, delete it
        get(roomPlayersRef).then(snap => {
          const players = snap.val();
          if (!snap.exists() || !players || Object.keys(players).length === 0) {
            remove(ref(db, `rooms/${currentRoom.id}`));
          }
        });
      };
    }

    game.onLevelUp = (level) => {
      setCurrentLevel(level);
      setStats(prev => ({ ...prev, level }));
      
      // Persist level to Firebase
      if (currentUser) {
        const playerRef = doc(firestore, 'players', currentUser.uid);
        updateDoc(playerRef, { 
          level: level,
          lastUpdate: fsServerTimestamp()
        }).catch(error => handleDatabaseError(error, OperationType.UPDATE, `players/${currentUser.uid}`));
      }
    };

    game.onGameStateChange = (state) => {
      setEngineState(state);
    };

    game.onLoadingUpdate = (progress) => {
      setLoadingProgress(progress);
    };

    game.onSyncNetwork = () => syncNetworkStateRef.current();

    game.onVictory = () => {
      audioManager.playSound('victory');
      awardTrophies(50); // Win level 50 victory bonus
      setIsLevel50Victory(true);
      setShowVictory(true);
    };

    game.start();
    setGameStartTime(Date.now());
    gameStartTimeRef.current = Date.now();

    const handleResize = () => game.resize();
    const handleOrientation = () => {
      // Small timeout to allow browser to update window dimensions correctly
      setTimeout(() => game.resize(), 100);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        game.paused = true;
      } else {
        game.paused = false;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const statsInterval = setInterval(() => updateStatsRef.current(), 100);

    // Host-only projectile cleanup
    let cleanupInterval: any = null;
    if (gameState === 'playing' && currentRoom && currentUser && currentRoom.hostId === currentUser.uid) {
      cleanupInterval = setInterval(() => {
        const projectilesRef = ref(db, `rooms/${currentRoom.id}/projectiles`);
        const now = Date.now() + serverTimeOffsetRef.current;
        
        get(query(projectilesRef, orderByChild('timestamp'), endAt(now - 3000))).then(snap => {
          if (snap.exists()) {
            const updates: any = {};
            snap.forEach(child => {
              updates[child.key!] = null;
            });
            update(projectilesRef, updates);
          }
        }).catch(() => {});
      }, 3000);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(statsInterval);
      if (cleanupInterval) clearInterval(cleanupInterval);
      game.stop();
      if ((game as any)._multiplayerCleanup) (game as any)._multiplayerCleanup();
    };
  }, [gameState]);

  // Multiplayer Winner Detection
  useEffect(() => {
    if (gameState !== 'playing' || !room || !user || !gameRef.current || !gameRef.current.isMultiplayer || gameRef.current.paused) return;
    
    const players = room.players || {};
    const playerIds = Object.keys(players);
    if (playerIds.length < 2) return;
    
    const alivePlayers = playerIds.filter(id => players[id].lives > 0);
    
    if (alivePlayers.length === 1 && alivePlayers[0] === user.uid && gameRef.current.player.lives > 0) {
      if (!winAwardedRef.current) {
        winAwardedRef.current = true;
        awardTrophies(25); // Victory reward
        audioManager.playSound('victory');
        setShowVictory(true);
        gameRef.current.paused = true;
      }
    }
    
    if (alivePlayers.length > 1) {
      winAwardedRef.current = false;
    }
  }, [room, user, gameState, awardTrophies]);

  // Mission Timers (Offline only)
  useEffect(() => {
    if (gameState !== 'playing' || !gameRef.current || gameRef.current.isMultiplayer || gameRef.current.paused) return;

    const timer = setInterval(() => {
      setMissions(prev => {
        const currentMission = prev[currentMissionIndex];
        if (!currentMission || currentMission.completed) return prev;

        if (currentMission.type === 'survive') {
          const newProgress = currentMission.current + 1;
          if (newProgress >= currentMission.target) {
            setShowMissionComplete(true);
            setTimeout(() => setShowMissionComplete(false), 4000);
            setTimeout(() => {
              setCurrentMissionIndex(idx => Math.min(idx + 1, prev.length - 1));
            }, 5000);
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress, completed: true } : m);
          }
          return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: newProgress } : m);
        }

        if (currentMission.type === 'stars_time') {
          const newTimeLeft = Math.max(0, (currentMission.timeLeft || 0) - 1);
          if (newTimeLeft === 0 && currentMission.current < currentMission.target) {
            // Reset mission if time runs out
            return prev.map((m, i) => i === currentMissionIndex ? { ...m, current: 0, timeLeft: currentMission.timeLimit } : m);
          }
          return prev.map((m, i) => i === currentMissionIndex ? { ...m, timeLeft: newTimeLeft } : m);
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentMissionIndex]);

  // User data and syncing
  useEffect(() => {
    if (!user) return;
    
    const playerRef = doc(firestore, 'players', user.uid);
    const unsubscribe = onSnapshot(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlayerData(data);
        setTrophies(data.trophies || 0);
        setNickname(data.nickname || '');
        highScoreRef.current = data.highScore || 0;
        setHighScore(data.highScore || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Global Audio Unlocker for Mobile/Chrome
  useEffect(() => {
    const unlockAudio = () => {
      audioManager.init();
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('mousedown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    
    return () => {
      window.removeEventListener('mousedown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const recordMatch = async () => {
    return true; // No limits
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !user || !nickname) return;
    
    const text = chatInput.trim().substring(0, 200);
    setChatInput('');
    
    try {
      await addDoc(collection(firestore, 'global_chat'), {
        text,
        uid: user.uid,
        nickname: nickname,
        timestamp: fsServerTimestamp(),
        role: playerData?.role || 'player'
      });
      audioManager.playSound('correct');
    } catch (error) {
      handleDatabaseError(error, OperationType.CREATE, 'global_chat');
    }
  };

  // Reconnection logic
  useEffect(() => {
    const lastRoomId = localStorage.getItem('lastRoomId');
    if (lastRoomId && user && gameState === 'menu') {
      const roomRef = ref(db, `rooms/${lastRoomId}`);
      get(roomRef).then(snapshot => {
        if (snapshot.exists() && snapshot.val().status === 'playing') {
          // Check if I'm still in the room
          const myPlayerRef = ref(db, `rooms/${lastRoomId}/players/${user.uid}`);
          get(myPlayerRef).then(pSnap => {
            if (pSnap.exists()) {
              const data = snapshot.val();
              const players = data.players || {};
              setRoom({ id: lastRoomId, ...data, playerIds: Object.keys(players) });
              setGameState('playing');
            } else {
              localStorage.removeItem('lastRoomId');
            }
          });
        } else {
          localStorage.removeItem('lastRoomId');
        }
      });
    }
  }, [user, gameState]);

  const handleStartMultiplayerGame = async () => {
    if (!user || !room || room.hostId !== user.uid) return;
    
    // Check if all players are ready and teams are balanced if in team mode
    const players = room.players || {};
    const playerIds = Object.keys(players);
    const allReady = playerIds.every(pid => players[pid].ready || pid === user.uid);
    
    if (!allReady) {
      alert("Todos os jogadores precisam estar prontos!");
      return;
    }

    setLoading(true);
    try {
      // Trigger fullscreen on user gesture
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const el = document.documentElement as any;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      }
      
      const roomDocRef = doc(firestore, 'rooms', room.id);
      await updateDoc(roomDocRef, { 
        status: 'playing',
        lastUpdate: fsServerTimestamp()
      });
      
      const roomRtRef = ref(db, `rooms/${room.id}`);
      await update(roomRtRef, { status: 'playing' });
    } catch (error) {
      console.error("Error starting match:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!user || !room) return;
    const isReady = room.players?.[user.uid]?.ready || false;
    try {
      const roomDocRef = doc(firestore, 'rooms', room.id);
      await updateDoc(roomDocRef, {
        [`players.${user.uid}.ready`]: !isReady
      });
    } catch (error) {
      console.error("Error toggling ready:", error);
    }
  };

  const handleToggleTeam = async () => {
    if (!user || !room || room.mode !== 'teams') return;
    const currentTeam = room.players?.[user.uid]?.team || 'A';
    const nextTeam = currentTeam === 'A' ? 'B' : 'A';
    try {
      const roomDocRef = doc(firestore, 'rooms', room.id);
      await updateDoc(roomDocRef, {
        [`players.${user.uid}.team`]: nextTeam
      });
    } catch (error) {
      console.error("Error toggling team:", error);
    }
  };

  const handleToggleMode = async () => {
    if (!user || !room || room.hostId !== user.uid) return;
    const nextMode = room.mode === 'ffa' ? 'teams' : 'ffa';
    try {
      const roomDocRef = doc(firestore, 'rooms', room.id);
      await updateDoc(roomDocRef, {
        mode: nextMode
      });
      const roomRtRef = ref(db, `rooms/${room.id}`);
      await update(roomRtRef, { mode: nextMode });
    } catch (error) {
      console.error("Error toggling mode:", error);
    }
  };

  const handleRateApp = async () => {
    const confirm = window.confirm("Gostando do TryHard Academy? Avalie-nos na Play Store!");
    if (confirm) {
      await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.tryhard.academy' });
    }
  };

  const handleRevive = async () => {
    const reward = await AdService.showRewardedAd();
    if (reward !== null) {
      if (gameRef.current) {
        gameRef.current.player.lives = 3;
        gameRef.current.paused = false;
        setShowGameOver(false);
        setGameState('playing');
        triggerHaptic();
      }
    }
  };

  const claimDailyReward = async () => {
    if (!user) return;
    const playerRef = doc(firestore, 'players', user.uid);
    await updateDoc(playerRef, {
      trophies: fsIncrement(50)
    });
    localStorage.setItem('lastRewardClaim', new Date().toDateString());
    setShowDailyReward(false);
    audioManager.playSound('victory');
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    if (room) {
      alert("Você já está em uma sala!");
      return;
    }
    setLoading(true);
    try {
      const roomsRef = collection(firestore, 'rooms');
      const newRoomRef = doc(roomsRef);
      const roomId = newRoomRef.id;
      
      const newRoom = {
        status: 'waiting',
        hostId: user.uid,
        mode: 'ffa',
        createdAt: fsServerTimestamp(),
        playerCount: 1,
        players: {
          [user.uid]: {
            nickname: nickname || 'Player',
            status: 'alive',
            team: 'none',
            ready: true // Host is always ready
          }
        }
      };
      
      await setDoc(newRoomRef, newRoom);
      
      // Initialize RTDB state and set up onDisconnect
      const roomRtRef = ref(db, `rooms/${roomId}`);
      const now = Date.now();
      await set(roomRtRef, {
        playerCount: 1,
        status: 'waiting',
        hostId: user.uid,
        mode: 'ffa',
        createdAt: now
      });
      
      const playerRtRef = ref(db, `rooms/${roomId}/players/${user.uid}`);
      await set(playerRtRef, { 
        nickname: nickname || 'Player', 
        status: 'alive' 
      });
      
      // Cleanup on disconnect
      onDisconnect(playerRtRef).remove();
      onDisconnect(ref(db, `rooms/${roomId}/playerCount`)).set(increment(-1));
      
      setRoom({ ...newRoom, id: roomId, playerIds: [user.uid] });
      setGameState('lobby');
    } catch (error) {
      handleDatabaseError(error, OperationType.CREATE, 'rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;
    if (room) {
      alert("Você já está em uma sala! Saia da sala atual primeiro.");
      return;
    }
    setLoading(true);
    try {
      const roomRtRef = ref(db, `rooms/${roomId}`);
      
      // Transactional Join
      const result = await runTransaction(roomRtRef, (roomData) => {
        if (!roomData) return null;
        if (roomData.status !== 'waiting') return; // Cannot join started game
        if ((roomData.playerCount || 0) >= 4) return; // Full
        
        if (!roomData.players) roomData.players = {};
        if (roomData.players[user.uid]) return; // Already in
        
        roomData.playerCount = (roomData.playerCount || 0) + 1;
        roomData.players[user.uid] = {
          nickname: nickname || 'Player',
          status: 'alive'
        };
        
        return roomData;
      });

      if (!result.committed) {
        alert("Não foi possível entrar na sala. Ela pode estar cheia ou já ter iniciado.");
        return;
      }

      // Sync Firestore for UI compatibility
      const roomDocRef = doc(firestore, 'rooms', roomId);
      await updateDoc(roomDocRef, {
        playerCount: result.snapshot.val().playerCount,
        [`players.${user.uid}`]: {
          nickname: nickname || 'Player',
          status: 'alive',
          team: (result.snapshot.val().mode === 'teams') ? 'A' : 'none',
          ready: false
        }
      });

      // Setup Disconnect Cleanup
      const playerRtRef = ref(db, `rooms/${roomId}/players/${user.uid}`);
      onDisconnect(playerRtRef).remove();
      onDisconnect(ref(db, `rooms/${roomId}/playerCount`)).set(increment(-1));
      
      const updatedData = result.snapshot.val();
      setRoom({ 
        id: roomId, 
        ...updatedData, 
        playerIds: Object.keys(updatedData.players || {}) 
      });
    } catch (error) {
      handleDatabaseError(error, OperationType.UPDATE, `rooms/${roomId}`);
      alert("Erro ao entrar na sala. Verifique sua conexão ou se a sala ainda existe.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room || !user) return;
    try {
      const roomsRtRef = ref(db, `rooms/${room.id}`);
      
      // Transactional Leave
      await runTransaction(roomsRtRef, (roomData) => {
        if (!roomData || !roomData.players) return roomData;
        
        if (roomData.players[user.uid]) {
          delete roomData.players[user.uid];
          roomData.playerCount = Math.max(0, (roomData.playerCount || 1) - 1);
        }
        
        // If host leaves and it's empty or we want to delete it
        if (roomData.hostId === user.uid && roomData.playerCount === 0) {
          return null; // Deletes the room in RTDB
        }
        
        return roomData;
      });

      // Sync Firestore
      const roomDocRef = doc(firestore, 'rooms', room.id);
      if (room.hostId === user.uid) {
        await deleteDoc(roomDocRef);
      } else {
        const currentPlayers = { ...room.players };
        delete currentPlayers[user.uid];
        await updateDoc(roomDocRef, { 
          players: currentPlayers,
          playerCount: fsIncrement(-1)
        });
      }
      
      // Cancel onDisconnect since we left normally
      onDisconnect(ref(db, `rooms/${room.id}/players/${user.uid}`)).cancel();
      onDisconnect(ref(db, `rooms/${room.id}/playerCount`)).cancel();
      
      setRoom(null);
    } catch (error) {
      console.error("Leave Room Error:", error);
    }
  };
  const handleStartGame = async () => {
    // Unblock audio
    audioManager.init();
    audioManager.playBGM();
    
    setRoom(null);
    setGameState('playing');
    setEngineState('playing');
    
    // Attempt fullscreen immediately on user gesture
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleMultiplayer = async () => {
    if (!user) return;
    setGameState('lobby');
    setRoom(null);
  };

  const saveSettings = async () => {
    localStorage.setItem('quality', quality);
    if (gameRef.current) {
      gameRef.current.setQuality(quality);
    }
    
    // Persist to Firebase if logged in
    if (user) {
      const playerRef = doc(firestore, 'players', user.uid);
      try {
        await updateDoc(playerRef, { 
          quality: quality,
          lastUpdate: fsServerTimestamp()
        });
      } catch (error) {
        handleDatabaseError(error, OperationType.UPDATE, `players/${user.uid}`);
      }
    }
    
    setShowSettings(false);
  };

  const handleRestart = async () => {
    setGamesPlayed(prev => prev + 1);
    
    // Interstitial Ad logic (every 4 deaths)
    if ((gamesPlayed + 1) % 4 === 0) {
      AdService.showInterstitial();
    }

    // Rating logic
    if (gamesPlayed === 5) {
      handleRateApp();
    }

    if (gameRef.current) {
      gameRef.current.reset();
      setShowGameOver(false);
      setGameStartTime(Date.now());
      gameStartTimeRef.current = Date.now();
      updateStats();
      
      if (gameRef.current.isMultiplayer && user && room) {
        // If multiplayer, maybe just go back to menu for now or re-match
        setGameState('menu');
      }
    }
  };

  const handleAnswer = (option: number | null) => {
    if (!currentQuestion || !gameRef.current) return;

    setSelectedOption(option);
    const isCorrect = option === currentQuestion.answer;
    const isTimeout = option === null;

    if (isCorrect) {
      setFeedback('correct');
      audioManager.playSound('correct');
      
      // Generate particles for success
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: `success-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        color: ['#00f2ff', '#bc13fe', '#22c55e'][Math.floor(Math.random() * 3)]
      }));
      setParticles(newParticles);
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Bonus based on combo
      const ammoBonus = 3;
      gameRef.current.player.ammo += ammoBonus;
      
      // Visual feedback for ammo gain
      const ammoParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: `ammo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        color: '#ffea00' // Yellow for ammo
      }));
      setParticles(prev => {
        if (!prev) return ammoParticles;
        const existingIds = new Set(prev.filter(p => p).map(p => p.id));
        const uniqueNew = ammoParticles.filter(p => p && !existingIds.has(p.id));
        return [...prev, ...uniqueNew].filter(p => p).slice(-50);
      });
      
      if (currentQuestion) {
        MathEngine.getInstance().recordPerformance(true, currentQuestion.difficulty);
      }
    } else {
      setFeedback(isTimeout ? 'timeout' : 'wrong');
      audioManager.playSound('wrong');
      setCombo(0);
      gameRef.current.player.lives -= 1;
      
      if (currentQuestion) {
        MathEngine.getInstance().recordPerformance(false, currentQuestion.difficulty);
      }
    }

    // Sync state immediately in multiplayer
    if (gameRef.current.isMultiplayer && room && user) {
      const playerRef = ref(db, `rooms/${room.id}/players/${user.uid}`);
      update(playerRef, {
        lives: gameRef.current.player.lives,
        ammo: gameRef.current.player.ammo,
        lastUpdate: serverTimestamp()
      }).catch(error => {
        console.error("Multiplayer sync error:", error);
        // We don't throw here to avoid interrupting the game flow
      });
    }

    const finishAnswer = () => {
      setFeedback(null);
      setParticles([]);
      setShowModal(false);
      if (gameRef.current) {
        if (gameRef.current.player.lives <= 0) {
          gameRef.current.gameOver = true;
          setShowGameOver(true);
        } else {
          gameRef.current.paused = false;
        }
      }
      updateStats();
    };

    if (gameRef.current.isMultiplayer && isCorrect) {
      finishAnswer();
    } else {
      setTimeout(finishAnswer, isCorrect ? 1000 : 3000);
    }
  };

  // Timer effect for MathModal
  useEffect(() => {
    let timer: any;
    if (showModal && !feedback && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(null); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showModal, feedback, timeLeft]);

  const handleJoystick = (clientX: number, clientY: number, basePos: { x: number; y: number }) => {
    if (!gameRef.current || !basePos) return;

    const dx = clientX - basePos.x;
    const dy = clientY - basePos.y;
    const maxRadius = 50;

    const mag = Math.sqrt(dx * dx + dy * dy);
    const normalizedX = dx / (mag || 1);
    const normalizedY = dy / (mag || 1);

    const finalMag = Math.min(mag, maxRadius);
    const moveX = normalizedX * finalMag;
    const moveY = normalizedY * finalMag;

    setJoystickHandlePos({ x: moveX, y: moveY });

    // Send to game engine (normalized -1 to 1)
    const inputX = moveX / maxRadius;
    const inputY = moveY / maxRadius;
    
    // Apply deadzone
    if (mag < 5) {
      gameRef.current.setJoystickInput(0, 0);
    } else {
      gameRef.current.setJoystickInput(inputX, inputY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameRef.current && !showModal && gameState === 'playing') {
      gameRef.current.setShooting(true, e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.updateMousePos(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (gameRef.current) {
      gameRef.current.setShooting(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showModal || gameState !== 'playing' || isCustomizingHUD) return;
    
    // Prevent default browser behavior (zoom, scroll)
    if (e.cancelable) e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      // Check if touching shoot button
      const shootBtnX = hudConfig.shootButtonPos.x < 0 ? window.innerWidth + hudConfig.shootButtonPos.x : hudConfig.shootButtonPos.x;
      const shootBtnY = hudConfig.shootButtonPos.y < 0 ? window.innerHeight + hudConfig.shootButtonPos.y : hudConfig.shootButtonPos.y;
      const distToShoot = Math.sqrt((touch.clientX - shootBtnX)**2 + (touch.clientY - shootBtnY)**2);
      
      // Increased buffer from 20 to 50 for easier touch
      if (distToShoot < hudConfig.shootButtonSize / 2 + 50) {
        setIsShootingMobile(true);
        if (gameRef.current) gameRef.current.setShooting(true, touch.clientX, touch.clientY);
        continue;
      }

      const isLeftHalf = touch.clientX < window.innerWidth / 2;

      // Joystick only on left half
      if (isLeftHalf && !joystickActive) {
        if (hudConfig.joystickMode === 'fixed') {
          const joyX = hudConfig.joystickPos.x < 0 ? window.innerWidth + hudConfig.joystickPos.x : hudConfig.joystickPos.x;
          const joyY = hudConfig.joystickPos.y < 0 ? window.innerHeight + hudConfig.joystickPos.y : hudConfig.joystickPos.y;
          
          setJoystickPos({ x: joyX, y: joyY });
          setJoystickActive(true);
          setJoystickHandlePos({ x: 0, y: 0 });
          handleJoystick(touch.clientX, touch.clientY, { x: joyX, y: joyY });
        } else {
          setJoystickPos({ x: touch.clientX, y: touch.clientY });
          setJoystickActive(true);
          setJoystickHandlePos({ x: 0, y: 0 });
        }
      } else if (!isLeftHalf) {
        // Right half can still be used for aiming if not touching the button directly
        // but we'll let the dedicated button handle the shooting state
        if (gameRef.current) {
          gameRef.current.updateMousePos(touch.clientX, touch.clientY);
        }
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || isCustomizingHUD) return;

    // Prevent default browser behavior (zoom, scroll)
    if (e.cancelable) e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      // Find if this touch is the joystick touch
      if (joystickActive && joystickPos) {
        const isLeftHalf = touch.clientX < window.innerWidth / 2;
        if (isLeftHalf) {
          handleJoystick(touch.clientX, touch.clientY, joystickPos);
        }
      } 
      
      if (touch.clientX >= window.innerWidth / 2) {
        // Aiming on right half
        if (gameRef.current) {
          gameRef.current.updateMousePos(touch.clientX, touch.clientY);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isCustomizingHUD) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      // Check if released shoot button
      const shootBtnX = hudConfig.shootButtonPos.x < 0 ? window.innerWidth + hudConfig.shootButtonPos.x : hudConfig.shootButtonPos.x;
      const shootBtnY = hudConfig.shootButtonPos.y < 0 ? window.innerHeight + hudConfig.shootButtonPos.y : hudConfig.shootButtonPos.y;
      const distToShoot = Math.sqrt((touch.clientX - shootBtnX)**2 + (touch.clientY - shootBtnY)**2);
      
      if (distToShoot < hudConfig.shootButtonSize / 2 + 40) {
        setIsShootingMobile(false);
        if (gameRef.current) gameRef.current.setShooting(false);
      }

      if (joystickActive && joystickPos && touch.clientX < window.innerWidth / 2) {
        setJoystickActive(false);
        setJoystickPos(null);
        setJoystickHandlePos({ x: 0, y: 0 });
        if (gameRef.current) gameRef.current.setJoystickInput(0, 0);
      }
    }

    if (e.touches.length === 0) {
      setJoystickActive(false);
      setJoystickPos(null);
      setIsShootingMobile(false);
      setJoystickHandlePos({ x: 0, y: 0 });
      if (gameRef.current) {
        gameRef.current.setJoystickInput(0, 0);
        gameRef.current.setShooting(false);
      }
    }
  };

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {isSplashActive && (
          <LoadingScreen progress={splashProgress} level={1} />
        )}
        {showDailyReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-zinc-900 border border-yellow-400/30 rounded-3xl p-10 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
              <div className="relative z-10">
                <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,234,0,0.5)]" />
                <h2 className="text-3xl font-black text-white italic mb-2 tracking-tighter">RECOMPENSA DIÁRIA</h2>
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed uppercase font-bold tracking-widest">Você recebeu um bônus por voltar hoje!</p>
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-6 mb-8">
                  <span className="text-white font-black text-4xl block">+50</span>
                  <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">Troféus de Bônus</span>
                </div>
                <button 
                  onClick={claimDailyReward}
                  className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_10px_30px_rgba(255,234,0,0.2)]"
                >
                  RESGATAR AGORA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        id="game-container"
        className="font-sans selection:bg-cyan-500 selection:text-black overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="noise-overlay" />
        <div className="crt-overlay" />
        <div className="scanline-moving" />
        
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-[1000] opacity-30" />
        <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-[1000] opacity-30" />

        <AnimatePresence mode="wait">
        {gameState === 'auth' && (
          <motion.div 
            key="auth-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#050505] overflow-hidden p-4"
          >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="w-full h-full" style={{ 
                backgroundImage: 'linear-gradient(rgba(0, 242, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl"
            >
              <div className="text-center mb-8">
                <img 
                  src="https://i.ibb.co/Lzc34Y2G/a9baf465-f1bb-4dca-960a-b0e057f3565a.png" 
                  alt="Tryhard Academy Logo" 
                  className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(188,19,254,0.4)]"
                  referrerPolicy="no-referrer"
                />
                <h1 className="text-3xl font-black italic text-white tracking-tighter mb-2">
                  TRYHARD <span className="text-[#bc13fe]">ACADEMY</span>
                </h1>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
                  {authMode === 'login' ? 'Bem-vindo de volta' : (authMode === 'register' ? 'Crie sua conta' : 'Escolha seu Nickname')}
                </p>
              </div>

              {(!userTypeSelection && !playerData) ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-white text-center font-bold mb-4 uppercase tracking-widest text-sm">Pronto para começar?</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setUserTypeSelection('player');
                    }}
                    className="group relative w-full py-6 bg-[#bc13fe] border-2 border-[#bc13fe]/20 rounded-2xl flex flex-col items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(188,19,254,0.2)] cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                    <Zap className="w-8 h-8 text-white relative z-10 pointer-events-none" />
                    <span className="font-black uppercase tracking-widest text-xl text-white relative z-10 pointer-events-none italic">Jogar agora</span>
                    <span className="text-[10px] text-white/60 uppercase font-bold relative z-10 pointer-events-none">Entre no universo Tryhard Academy</span>
                  </button>

                  <button 
                    onClick={() => {
                      setUserTypeSelection('player');
                      setAuthMode('login');
                    }}
                    className="mt-4 text-white/10 hover:text-white/30 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Portal do Atleta
                  </button>
                </div>
              ) : playerData?.role === 'pending-teacher' ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-500/30">
                    <Timer className="w-10 h-10 text-orange-500 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Aguardando Aprovação</h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Seu cadastro de professor foi recebido! <br/>
                    O administrador do jogo precisa aprovar seu acesso antes que você possa gerenciar seus alunos.
                  </p>
                  <button 
                    onClick={() => auth.signOut()}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    {(!user || authMode !== 'set-nickname') && (
                      <button 
                        onClick={() => user ? auth.signOut() : setUserTypeSelection(null)}
                        className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                        Área de Acesso
                      </h2>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        {authMode === 'login' ? 'Faça seu login' : authMode === 'register' ? 'Crie sua conta' : 'Escolha seu apelido'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {(authMode === 'register' || authMode === 'set-nickname') && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Nickname (Permanente)</label>
                        <input 
                          type="text" 
                          value={authNickname}
                          onChange={(e) => setAuthNickname(e.target.value.slice(0, 15))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#bc13fe] transition-all"
                          placeholder="Seu nick no jogo..."
                          required
                        />
                      </div>
                    )}
                    {authMode !== 'set-nickname' && (
                      <>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">E-mail</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#bc13fe] transition-all"
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Senha</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-[#bc13fe] transition-all"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </>
                    )}

                    {authError && (
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#bc13fe] text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processando...' : (authMode === 'login' ? 'Entrar' : (authMode === 'register' ? 'Registrar' : 'Confirmar Nickname'))}
                    </button>
                  </form>

                  {authMode !== 'set-nickname' && (
                    <div className="mt-6 flex flex-col gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-[#0a0a0a] px-4 text-white/20">Ou</span></div>
                      </div>

                      <button 
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                      >
                        <Users className="w-5 h-5 text-[#4285F4]" />
                        Google Login
                      </button>

                      <button 
                        onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                        className="text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-all text-center"
                      >
                        {authMode === 'login' ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça Login'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {gameState === 'menu' && (
          <motion.div 
            key="main-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_center,_#0f0a1a_0%,_#050505_100%)] overflow-y-auto custom-scrollbar"
          >
            {/* Minimalist Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bc13fe]/5 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Top Navigation - Ultra Minimal for Mobile */}
            <div className="w-full px-4 pt-4 pb-2 flex justify-between items-center z-50 md:absolute md:top-0 md:left-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <User size={14} className="text-white/40" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white italic tracking-tighter leading-none">{nickname || 'CONECTANDO...'}</span>
                  <span className="text-[6px] font-bold uppercase tracking-widest text-[#bc13fe]">NV {currentLevel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
                <Trophy size={10} className="text-yellow-400" />
                <span className="text-white text-[10px] font-black italic tabular-nums">{trophies}</span>
              </div>

              <button 
                onClick={() => setShowSettings(true)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40"
              >
                <Settings size={14} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col items-center justify-center px-4 py-4 md:py-0">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-6 md:mb-12"
              >
                <h1 className="text-3xl md:text-8xl font-black uppercase tracking-tighter text-white italic leading-[0.8]">
                  TRYHARD<br/>
                  <span className="text-[#bc13fe] drop-shadow-[0_0_30px_rgba(188,19,254,0.3)]">ACADEMY</span>
                </h1>
              </motion.div>

              <div className="w-full max-w-md flex flex-col gap-3">
                {/* PRIMARY: ONLINE */}
                <button 
                  onClick={() => { 
                    handleMultiplayer(); 
                    requestLandscape(); 
                    triggerHaptic();
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="relative h-24 md:h-40 bg-[#bc13fe] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(188,19,254,0.15)] flex flex-col justify-center items-center group active:scale-95 transition-all"
                >
                  <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white/10 rotate-12" />
                  <span className="relative z-10 text-white text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">JOGAR ONLINE</span>
                  <span className="relative z-10 text-white/60 text-[8px] md:text-xs font-bold uppercase tracking-[0.3em] mt-1">Sessões Multiplayer</span>
                </button>

                {/* SECONDARY: PRATICAR */}
                <button 
                  onClick={() => { handleStartGame(); requestLandscape(); triggerHaptic(); }}
                  className="h-16 md:h-24 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                  <Zap size={20} className="text-white/20" />
                  <span className="text-white text-xl md:text-3xl font-black italic tracking-tighter uppercase">PRATICAR</span>
                </button>

                {/* HUB ACTIONS - Icon Based Horizontal Dock on Mobile */}
                <div className="flex items-center justify-between gap-1 md:gap-4 mt-2">
                  <button onClick={() => setShowStore(true)} className="flex-1 aspect-square md:aspect-auto md:h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all">
                    <ShoppingBag size={14} className="text-[#bc13fe] md:w-[20px]" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase text-white/40">Loja</span>
                  </button>
                  <button onClick={() => setShowRewardAdModal(true)} className="flex-1 min-w-[80px] aspect-square md:aspect-auto md:h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all">
                    <BarChart3 size={14} className="text-cyan-400 md:w-[20px]" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase text-white/40">Carreira</span>
                  </button>
                  <button onClick={() => { setShowGlobalChat(true); setHasNewChatMessages(false); }} className="flex-1 min-w-[80px] aspect-square md:aspect-auto md:h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 relative hover:bg-white/10 transition-all">
                    <MessageSquare size={14} className="text-green-500 md:w-[20px]" />
                    <span className="text-[7px] md:text-[10px] font-black uppercase text-white/40">Chat</span>
                    {hasNewChatMessages && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Simple Footer */}
            <div className="w-full p-6 flex justify-between items-center opacity-30">
              <button onClick={() => setShowTutorial(true)} className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={10} /> MANUAL
              </button>
              <button 
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <ShieldCheck size={10} /> PRIVACIDADE
              </button>
              <button onClick={() => setShowLeaderboard(true)} className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                <Crown size={10} /> RANKING
              </button>
            </div>



            
            {!isOnline && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-500 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] z-[100]">
                <WifiOff size={14} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Modo Offline</span>
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'admin-panel' && (
          <motion.div
            key="admin-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <React.Suspense fallback={null}>
              <AdminDashboard onClose={() => setGameState('menu')} />
            </React.Suspense>
          </motion.div>
        )}

      </AnimatePresence>

      <React.Suspense fallback={null}>
          <GlobalChat 
            isOpen={showGlobalChat}
            onClose={() => setShowGlobalChat(false)}
            messages={chatMessages}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={sendChatMessage}
            currentUserUid={user?.uid || ''}
          />
          
          <SkinStore 
            isOpen={showStore}
            onClose={() => setShowStore(false)}
            currentLevel={currentLevel}
            currentSkinId={currentSkinId}
            onSelectSkin={setCurrentSkinId}
            isPremium={playerData?.role === 'admin' || playerData?.role === 'teacher'}
          />
      </React.Suspense>

      {gameState === 'playing' && (
        <GameHUD 
          stats={stats}
          currentLevel={currentLevel}
          engineState={engineState}
          loadingProgress={loadingProgress}
          killFeed={killFeed}
          room={room}
          missions={missions}
          currentMissionIndex={currentMissionIndex}
          missionProgressFeedback={missionProgressFeedback}
          showMissionComplete={showMissionComplete}
          activePowerUps={activePowerUps}
          isTouch={isTouch}
          hudConfig={hudConfig}
          joystickActive={joystickActive}
          joystickPos={joystickPos}
          joystickHandlePos={joystickHandlePos}
          isShootingMobile={isShootingMobile}
          isCustomizingHUD={isCustomizingHUD}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          setIsCustomizingHUD={setIsCustomizingHUD}
          setHudConfig={setHudConfig}
          setShowSettings={setShowSettings}
          onExit={() => {
            if (gameRef.current) {
              gameRef.current.stop();
            }
            setGameState('menu');
            setRoom(null);
          }}
          gameRef={gameRef}
          canvasRef={canvasRef}
        />
      )}

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            key="level-up-notification"
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.5, y: -100, opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-b from-[#bc13fe] to-[#7a00ff] p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(188,19,254,0.5)] border-4 border-white/20">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Trophy className="w-24 h-24 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-white text-6xl font-black uppercase tracking-tighter italic">NÍVEL {currentLevel}!</h2>
              <p className="text-white/80 text-sm uppercase tracking-[0.4em] mt-2 font-bold">Dificuldade Aumentada</p>
            </div>
          </motion.div>
        )}

        {gameState === 'lobby' && (
          <motion.div 
            key="lobby-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl p-6"
          >
            <div className="w-full max-w-2xl bg-zinc-900/50 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-900/80">
                <div className="flex-1">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Multiplayer <span className="text-[#00f2ff]">Lobby</span></h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-1">Escolha uma sala ou crie a sua</p>
                  
                  {/* Expert Filter Logic */}
                  {!room && (
                    <div className="flex gap-2 mt-4">
                      {['all', 'ffa', 'teams'].map((m) => (
                        <button 
                          key={`filter-${m}`}
                          onClick={() => setLobbyFilterMode(m as any)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            lobbyFilterMode === m 
                            ? 'bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          {m === 'all' ? 'TODAS' : m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!room && (
                  <button 
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#00f2ff] hover:bg-[#00d8e6] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Sala
                  </button>
                )}
              </div>

                <div className="flex-1 overflow-y-auto p-6 min-h-[400px] max-h-[60vh] custom-scrollbar">
                  {loadingRooms ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                      <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Sintonizando Frequências...</p>
                    </div>
                  ) : room ? (
                  <div className="flex flex-col items-center justify-center w-full space-y-6">
                    {/* Room Header with Mode Selection for Host */}
                    <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-3">
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Modo de Jogo</div>
                      <div className="flex items-center gap-4">
                        {room.hostId === user.uid ? (
                          <button 
                            onClick={handleToggleMode}
                            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 transition-all group"
                          >
                            <Globe className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="text-white font-black uppercase italic tracking-tighter text-lg">
                              {room.mode === 'ffa' ? 'FREE FOR ALL' : 'TEAM DEATHMATCH (2V2)'}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/5">
                            <Hash className="w-5 h-5 text-white/20" />
                            <span className="text-white/60 font-black uppercase italic tracking-tighter text-lg">
                              {room.mode === 'ffa' ? 'FREE FOR ALL' : 'TEAM DEATHMATCH (2V2)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {deduplicateItems(room.playerIds, (pid) => `lobby-p-${pid}`, 'LobbyPlayerList').map((pid: string) => {
                        const pState = room.players?.[pid];
                        const isMe = pid === user.uid;
                        return (
                          <div key={`lobby-p-${pid}`} className={`p-4 rounded-2xl border transition-all ${isMe ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${pState?.ready ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                                <span className="text-white font-black uppercase tracking-widest text-xs truncate max-w-[120px]">
                                  {pState?.nickname || 'Explorador'}
                                </span>
                              </div>
                              {pState?.ready && (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              )}
                            </div>

                            <div className="flex gap-2">
                              {room.mode === 'teams' ? (
                                <button
                                  disabled={!isMe}
                                  onClick={handleToggleTeam}
                                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    pState?.team === 'A' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                                  }`}
                                >
                                  TIME {pState?.team || 'A'}
                                </button>
                              ) : (
                                <div className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/40 text-center uppercase tracking-widest">
                                  SOLO
                                </div>
                              )}
                              
                              {isMe && pid !== room.hostId && (
                                <button
                                  onClick={handleToggleReady}
                                  className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    pState?.ready ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white border border-white/20'
                                  }`}
                                >
                                  {pState?.ready ? 'PRONTO' : 'PREPARAR'}
                                </button>
                              )}
                              
                              {pid === room.hostId && (
                                <div className="flex-1 py-2 rounded-lg bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-[9px] font-black text-center uppercase tracking-widest">
                                  HOST
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {/* Empty Slots */}
                      {Array.from({ length: 4 - room.playerIds.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center border-dashed">
                          <span className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">Aguardando...</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 w-full pt-4">
                      {room.hostId === user.uid && (
                        <button 
                          onClick={handleStartMultiplayerGame}
                          disabled={loading || room.playerIds.length < 2}
                          className="flex-1 bg-[#00f2ff] hover:bg-[#00d8e6] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                        >
                          INICIAR COMBATE
                        </button>
                      )}
                      <button 
                        onClick={handleLeaveRoom}
                        className={`${room.hostId === user.uid ? 'w-20' : 'flex-1'} bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 border border-red-500/20`}
                      >
                        {room.hostId === user.uid ? <Trash2 className="w-6 h-6 mx-auto" /> : 'ABANDONAR SALA'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rooms.length > 0 ? (
                      deduplicateItems(rooms, (r) => `room-${r.id}`, 'LobbyRooms').map((r) => (
                        <motion.div 
                          key={`room-${r.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#00f2ff]/10 rounded-xl flex items-center justify-center border border-[#00f2ff]/20">
                              <Users className="w-6 h-6 text-[#00f2ff]" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold uppercase tracking-wider">Sala de {r.players?.[r.hostId]?.nickname || 'Jogador'}</h4>
                              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">{r.playerIds.length}/4 Jogadores</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleJoinRoom(r.id)}
                            disabled={loading}
                            className="bg-white/10 hover:bg-[#00f2ff] hover:text-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
                          >
                            Entrar
                          </button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                          <Users className="w-6 h-6 text-white/20" />
                        </div>
                        <h3 className="text-white/40 font-bold uppercase tracking-widest text-sm">Nenhuma sala disponível</h3>
                        <p className="text-white/20 text-[10px] uppercase tracking-widest mt-2">Seja o primeiro a criar uma!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!room && (
              <button 
                onClick={() => setGameState('menu')}
                className="mt-8 text-white/30 hover:text-white text-[10px] uppercase tracking-widest border border-white/10 p-2 px-8 rounded-full transition-all"
              >
                Voltar ao Menu
              </button>
            )}
          </motion.div>
        )}

        {showTutorial && (
          <motion.div 
            key="tutorial-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[100px]" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[100px]" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tighter italic">
                    TUTORIAL <span className="text-purple-500">TRYHARD</span>
                  </h2>
                  <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-white/50 border border-white/10">
                    PASSO {tutorialStep + 1} DE 6
                  </div>
                </div>

                <div className="min-h-[200px] flex flex-col justify-center">
                  {tutorialStep === 0 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <h3 className="text-xl font-bold text-white mb-4">Bem-vindo à Tryhard Academy!</h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Prepare-se para uma experiência intensa onde matemática e reflexos se encontram. 
                        Vamos te ensinar o básico para você dominar a arena.
                      </p>
                    </motion.div>
                  )}

                  {tutorialStep === 1 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                        <Move className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Movimentação</h3>
                      <p className="text-zinc-400 leading-relaxed mb-4">
                        {isTouch ? 
                          "Use o joystick no lado esquerdo da tela para mover sua nave pela arena." : 
                          "Use as teclas WASD ou as setas do teclado para mover sua nave."}
                      </p>
                      <div className="flex gap-2">
                        {isTouch ? (
                          <div className="px-3 py-1 bg-white/5 rounded-md text-xs font-mono text-purple-400 border border-purple-500/20">JOYSTICK ESQUERDO</div>
                        ) : (
                          deduplicateItems(['W', 'A', 'S', 'D'], (k) => `tutorial-wasd-${k}`, 'TutorialWASD').map((k) => (
                            <div key={`tutorial-wasd-${k}`} className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center text-xs font-mono text-purple-400 border border-purple-500/20">{k}</div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {tutorialStep === 2 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
                        <Target className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Mira e Disparo</h3>
                      <p className="text-zinc-400 leading-relaxed mb-4">
                        {isTouch ? 
                          "Toque e segure em qualquer lugar do lado direito da tela para atirar na direção do toque." : 
                          "Use o mouse para mirar e clique (ou segure) para disparar seus projéteis."}
                      </p>
                      <div className="px-3 py-1 bg-white/5 rounded-md text-xs font-mono text-cyan-400 border border-cyan-500/20 inline-block">
                        {isTouch ? "TOQUE LADO DIREITO" : "MOUSE + CLIQUE"}
                      </div>
                    </motion.div>
                  )}

                  {tutorialStep === 3 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30">
                        <Star className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Desafio Matemático</h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Colete as <span className="text-yellow-400 font-bold">Estrelas Douradas</span> para ganhar munição e bônus. 
                        Ao coletar uma, um desafio matemático surgirá. Responda rápido para ganhar o bônus de combo!
                      </p>
                    </motion.div>
                  )}

                  {tutorialStep === 4 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
                        <Zap className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Power-ups</h3>
                      <p className="text-zinc-400 leading-relaxed mb-4">
                        Fique atento aos itens que aparecem na arena:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">S</div>
                          <span className="text-zinc-300">Escudo</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">R</div>
                          <span className="text-zinc-300">Tiro Rápido</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">V</div>
                          <span className="text-zinc-300">Velocidade</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">T</div>
                          <span className="text-zinc-300">Tiro Triplo</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tutorialStep === 5 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                        <Trophy className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Pronto para a Batalha!</h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Vença seus oponentes, suba de nível e conquiste o topo do leaderboard. 
                        Boa sorte, Tryharder!
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="mt-10 flex gap-4">
                  {tutorialStep > 0 && (
                    <button 
                      onClick={() => setTutorialStep(prev => prev - 1)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all"
                    >
                      VOLTAR
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (tutorialStep < 5) {
                        setTutorialStep(prev => prev + 1);
                      } else {
                        setShowTutorial(false);
                        setTutorialStep(0);
                      }
                    }}
                    className="flex-[2] py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition-all"
                  >
                    {tutorialStep === 5 ? "COMEÇAR AGORA" : "PRÓXIMO"}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowTutorial(false);
                  setTutorialStep(0);
                }}
                className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div 
            key="settings-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">Ajustes</h2>
                <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-white/50" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Seu Nickname (Permanente)</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold tracking-widest opacity-70">
                    {nickname || 'Carregando...'}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#ffea00]" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Troféus</span>
                  </div>
                  <span className="text-white font-black tracking-widest">{trophies}</span>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#00f2ff]" />}
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Áudio</span>
                  </div>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30'
                    }`}
                  >
                    {isMuted ? 'Mudo' : 'Ligado'}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Qualidade Gráfica</label>
                  <div className="grid grid-cols-3 gap-2">
                    {deduplicateItems(['low', 'medium', 'high'] as GraphicQuality[], (q) => `quality-opt-${q}`, 'GraphicQualityOptions').map((q) => (
                      <button
                        key={`quality-opt-${q}`}
                        onClick={() => setQuality(q)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          quality === q 
                            ? 'bg-[#bc13fe] border-[#bc13fe] text-white shadow-[0_0_15px_rgba(188,19,254,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {q === 'low' ? 'Baixo' : q === 'medium' ? 'Médio' : 'Alto'}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowSettings(false);
                    setIsCustomizingHUD(true);
                  }}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
                >
                  <Move className="w-5 h-5 text-[#00f2ff] group-hover:rotate-12 transition-transform" />
                  Configurar HUD Mobile
                </button>

                <button 
                  onClick={saveSettings}
                  className="w-full py-4 bg-[#bc13fe] text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(188,19,254,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Salvar Alterações
                </button>

                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      setShowPrivacyPolicy(true);
                    }}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                    <ShieldCheck className="w-5 h-5 text-white/40" />
                    Política de Privacidade
                  </button>

                  <button
                    onClick={handleInstallClick}
                    className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-cyan-500/20 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Aplicativo
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Sair da Conta
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPrivacyPolicy && (
          <motion.div 
            key="privacy-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-[#bc13fe] flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" />
                  Privacidade
                </h2>
                <button onClick={() => setShowPrivacyPolicy(false)}><X className="w-5 h-5 text-white/50 hover:text-white transition-colors" /></button>
              </div>

              <div className="overflow-y-auto pr-4 custom-scrollbar text-zinc-400 space-y-6 text-sm leading-relaxed">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-white font-black uppercase text-xs mb-2 tracking-widest">Política de Privacidade – Tryhard Academy</h3>
                  <p>Este aplicativo pode coletar informações básicas para funcionamento, incluindo:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Identificadores de dispositivo</li>
                    <li>Dados de uso do aplicativo</li>
                    <li>Dados de interação com anúncios</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <section>
                    <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Uso dos Dados</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Melhorar a experiência do usuário</li>
                      <li>Garantir funcionamento do multiplayer</li>
                      <li>Exibir anúncios relevantes</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Serviços de Terceiros</h4>
                    <p>Utilizamos Google Firebase e Google AdMob. Estes serviços podem coletar dados conforme suas próprias políticas.</p>
                  </section>

                  <section>
                    <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1 text-[#bc13fe]">Segurança</h4>
                    <p>Não coletamos dados pessoais sensíveis. O usuário pode interromper o uso do app a qualquer momento.</p>
                  </section>

                  <section className="pt-4 border-t border-white/5">
                    <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Contato</h4>
                    <p className="text-[#bc13fe] font-mono break-all text-xs">natanmarinhocontanegociosofc@gmail.com</p>
                  </section>
                </div>
              </div>

              <button 
                onClick={() => setShowPrivacyPolicy(false)}
                className="mt-8 w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all border-[#bc13fe]/20"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </motion.div>
        )}

        {showLeaderboard && (
          <motion.div 
            key="leaderboard-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-[#ffea00]" />
                  Ranking Global
                </h2>
                <button onClick={() => setShowLeaderboard(false)}><X className="w-5 h-5 text-white/50" /></button>
              </div>

              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {deduplicateItems(leaderboard, (player) => `leaderboard-entry-${player.uid}`, 'Leaderboard').map((player, i) => {
                      const playerSkin = SKINS.find(s => s.id === player.selectedSkinId) || SKINS[0];
                      return (
                        <div 
                          key={`leaderboard-entry-${player.uid}`}
                          className={`flex items-center justify-between p-4 rounded-2xl border ${player.uid === user?.uid ? 'bg-[#bc13fe]/10 border-[#bc13fe]/50' : 'bg-white/5 border-white/5'}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-black ${i < 3 ? 'text-[#ffea00]' : 'text-white/30'}`}>#{i + 1}</span>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                               <div 
                                 className="w-4 h-4" 
                                 style={{ 
                                   backgroundColor: playerSkin.color,
                                   boxShadow: `0 0 10px ${playerSkin.glowColor}`,
                                   borderRadius: playerSkin.shape === 'circle' ? '50%' : '2px',
                                   transform: playerSkin.shape === 'star' ? 'rotate(45deg)' : 'none'
                                 }}
                               />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white tracking-widest uppercase">{player.nickname}</span>
                              <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Nível {player.level || 1}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-3 h-3 text-[#00f2ff]" />
                              <span className="text-sm font-black text-[#00f2ff]">{player.trophies}</span>
                            </div>
                            {player.uid !== user?.uid && (
                              <button 
                                onClick={() => handleChallenge(player.uid, player.nickname)}
                                className="text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 transition-all flex items-center gap-1"
                              >
                                <Sword className="w-2 h-2" /> X1
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showVictory && (
          <motion.div 
            key="victory-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/60 border border-yellow-400/30 p-12 rounded-[2rem] w-full max-w-lg text-center backdrop-blur-md relative"
            >
              <CornerDecoration className="text-yellow-400 -inset-4 opacity-100" />
              
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative inline-block mb-8">
                  <div className="absolute -inset-8 bg-yellow-400/20 blur-[50px] rounded-full animate-pulse" />
                  <Trophy className="w-32 h-32 text-[#ffea00] relative drop-shadow-[0_0_30px_rgba(255,234,0,0.8)]" />
                </div>
              </motion.div>

              <motion.h2 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-[#ffea00] text-7xl font-black uppercase tracking-tighter mb-4 italic drop-shadow-[0_0_15px_rgba(255,234,0,0.5)]"
              >
                {isLevel50Victory ? 'LENDA DA ARENA' : 'VITÓRIA TOTAL'}
              </motion.h2>
              
              <div className="flex flex-col gap-2 mb-10">
                <p className="text-white font-black uppercase tracking-[0.5em] text-xs">Simulação Concluída com Sucesso</p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-12 max-w-xs mx-auto">
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="bg-[#ffea00]/10 border border-[#ffea00]/30 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(255,234,0,0.2)]"
                >
                  <Trophy className="w-12 h-12 text-[#ffea00] mb-3" />
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Recompensa de Vitória</span>
                  <span className="text-white font-black text-4xl italic">+{isLevel50Victory ? 50 : 25} <span className="text-[#ffea00] text-sm">TROFÉUS</span></span>
                </motion.div>
              </div>

              <button
                onClick={() => {
                  setShowVictory(false);
                  setGameState('menu');
                }}
                className="game-btn-primary w-full py-6 text-xl bg-yellow-400 !text-black hover:bg-yellow-300 shadow-[0_0_40px_rgba(255,234,0,0.4)]"
              >
                RETORNAR À BASE
              </button>
            </motion.div>
            
            {/* Celebration Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={`v-particle-${i}`}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: window.innerHeight + 10,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: -100,
                    rotate: 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                  className="absolute w-2 h-2 bg-yellow-400/40 rounded-sm"
                />
              ))}
            </div>
          </motion.div>
        )}

        {showGameOver && (
          <motion.div 
            key="game-over-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-black/40 border border-red-500/40 p-12 rounded-[2rem] w-full max-w-md text-center backdrop-blur-xl relative"
            >
              <CornerDecoration className="text-red-500 -inset-4 opacity-100" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

              <div className="inline-block px-4 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8 italic">
                Sinal de Vida Perdido
              </div>

              <h2 className="text-red-500 text-7xl font-black uppercase tracking-tighter italic mb-10 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                GAME<br/><span className="text-white">OVER</span>
              </h2>
              
              <div className="flex flex-col gap-3 mb-12">
                {[
                  { label: 'Oponentes Abatidos', val: stats.kills, icon: Target, color: 'text-cyan-400' },
                  { label: 'Tempo em Combate', val: `${survivalTime}s`, icon: Timer, color: 'text-yellow-400' },
                  { label: 'Pontuação Máxima', val: highScore, icon: Trophy, color: 'text-[#bc13fe]' }
                ].map((stat, i) => (
                  <div key={i} className="hud-card !bg-black/60 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-white italic tabular-nums">{stat.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleRevive}
                  className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(234,179,8,0.3)] flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5 fill-black" />
                  REVIVER COM ANÚNCIO
                </button>

                <button
                  onClick={handleRestart}
                  className="game-btn-danger py-6 text-xl shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                >
                  <Zap className="w-6 h-6 fill-white" />
                  REINICIAR SEQUÊNCIA
                </button>

                <button
                  onClick={() => {
                    setShowGameOver(false);
                    setGameState('menu');
                    setShowStore(true);
                  }}
                  className="game-btn-secondary py-5 text-xs text-[#bc13fe] border-[#bc13fe]/30"
                >
                  <ShoppingBag className="w-5 h-5" />
                  PERSONALIZAR AGENTE
                </button>

                <button
                  onClick={() => {
                    setShowGameOver(false);
                    setGameState('menu');
                  }}
                  className="text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.4em] mt-2 underline decoration-red-500/30 underline-offset-8"
                >
                  SAIR PARA O LOGOUT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showModal && currentQuestion && (
          <motion.div 
            key="math-challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                x: feedback === 'wrong' || feedback === 'timeout' ? [0, -10, 10, -10, 10, 0] : 0
              }}
              className={`relative bg-black/40 border-2 ${
                feedback === 'correct' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 
                feedback === 'wrong' || feedback === 'timeout' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 
                'border-cyan-400 shadow-[0_0_50px_rgba(0,242,255,0.3)]'
              } p-10 rounded-[2rem] w-full max-w-md backdrop-blur-3xl overflow-hidden`}
            >
              <CornerDecoration className={`${
                feedback === 'correct' ? 'text-green-500' : 
                feedback === 'wrong' || feedback === 'timeout' ? 'text-red-500' : 'text-cyan-400'
              } -inset-4 opacity-100`} />

              {/* Header */}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/5">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-400' : 
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/60 italic">Nível de Ameaça: 
                    <span className="text-white ml-2">
                       {currentQuestion.difficulty === 'easy' ? 'MÍNIMO' : 
                        currentQuestion.difficulty === 'medium' ? 'MÉDIO' : 'CRÍTICO'}
                    </span>
                  </span>
                </div>

                <div className={`flex flex-col items-end`}>
                  <div className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Backup Timer</div>
                  <div className={`text-xl font-black tabular-nums tracking-tighter ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </div>
                </div>
              </div>

              {/* Combo Multiplier */}
              <AnimatePresence>
                {combo > 1 && !feedback && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 12 }}
                    className="absolute top-12 right-12 bg-[#bc13fe] text-white px-4 py-2 rounded-xl font-black text-sm shadow-[0_0_20px_rgba(188,19,254,0.5)] border border-white/20 z-20"
                  >
                    COMBO X{combo}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mb-10">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4 opacity-40 italic underline decoration-cyan-400/30 underline-offset-4">Desafio de Processamento</div>
                <h2 className="text-6xl md:text-7xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {deduplicateItems(currentQuestion?.options || [], (opt) => `option-${currentQuestion?.id}-${opt}`, 'QuestionOptions').map((opt) => (
                  <button
                    key={`option-${currentQuestion?.id}-${opt}`}
                    onClick={() => !feedback && handleAnswer(opt)}
                    disabled={!!feedback}
                    className={`game-btn py-6 text-2xl font-black tabular-nums transition-all ${
                      feedback === 'correct' && opt === currentQuestion?.answer ? 'bg-green-500 border-green-400 text-white scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)]' :
                      feedback === 'wrong' && opt === selectedOption ? 'bg-red-500 border-red-500 text-white animate-shake shadow-[0_0_30px_rgba(239,68,68,0.5)]' :
                      'bg-black/60 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              
              {/* Scanline Effect in Modal */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px)',
                  backgroundSize: '100% 4px'
                }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isTouch && (
        <div className="fixed inset-0 z-[140] pointer-events-none" />
      )}
      {showMissionsMenu && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-zinc-900/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <Flag className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Missões <span className="text-cyan-400">Offline</span></h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-1">Complete desafios para ganhar troféus</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMissionsMenu(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 max-h-[60vh] custom-scrollbar">
              {deduplicateItems(missions, (m) => `mission-menu-${m.id}`, 'MissionsMenu').map((mission, index) => (
                <div 
                  key={`mission-menu-${mission.id}`}
                  className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                    mission.completed 
                      ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                      : index === currentMissionIndex 
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,255,0.1)]' 
                        : 'bg-white/5 border-white/10 grayscale opacity-40'
                  }`}
                >
                  {index === currentMissionIndex && !mission.completed && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                  )}
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-black uppercase tracking-tight ${mission.completed ? 'text-green-400' : 'text-white'}`}>
                          {mission.title}
                        </h3>
                        {mission.completed && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {index === currentMissionIndex && !mission.completed && (
                          <span className="px-2 py-0.5 bg-cyan-400 text-black text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">Ativa</span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4">{mission.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            className={`h-full ${mission.completed ? 'bg-green-500' : 'bg-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.4)]'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-white italic tabular-nums">
                          {mission.current}/{mission.target}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col items-end gap-2">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Recompensa</div>
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                        <Trophy className="w-4 h-4 text-[#ffea00]" />
                        <span className="text-sm font-black text-white">+{mission.reward}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-zinc-900/80 border-t border-white/10 flex justify-center">
              <button 
                onClick={() => {
                  setShowMissionsMenu(false);
                  handleStartGame();
                }}
                className="bg-cyan-400 hover:bg-cyan-300 text-black px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.3)]"
              >
                Jogar Agora
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed top-24 right-4 md:right-8 z-[200]">
            <NotificationCenter notifications={notifications} onClose={() => setShowNotifications(false)} />
          </div>
        )}

        {showRewardAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[3rem] w-full max-w-lg shadow-[0_0_80px_rgba(188,19,254,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-[#bc13fe] to-yellow-400" />
              
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3 italic">
                  <BarChart3 className="w-6 h-6 text-[#bc13fe]" />
                  Painel de Controle
                </h2>
                <button 
                  onClick={() => setShowRewardAdModal(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-white/50 hover:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { label: 'Tempo Jogado', value: `${Math.floor(totalTimePlayed / 60)}m ${totalTimePlayed % 60}s`, color: 'text-cyan-400', icon: Timer },
                  { label: 'Partidas', value: matchCount, color: 'text-purple-400', icon: ShieldCheck },
                  { label: 'Anúncios', value: adsWatched, color: 'text-yellow-400', icon: Star },
                  { label: 'Sessão', value: `${Math.floor((Date.now() - sessionStartTime) / 60000)}m`, color: 'text-orange-400', icon: Zap }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-1">
                    <div className="flex items-center gap-2 opacity-30">
                      <stat.icon className="w-3 h-3" />
                      <span className="text-[7px] font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className={`text-xl font-black italic ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-b from-[#bc13fe]/10 to-transparent border border-[#bc13fe]/20 p-8 rounded-[2rem] text-center relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#bc13fe]/20 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                  
                  <p className="text-[#bc13fe] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Recompensa Patrocinada</p>
                  <p className="text-white/70 text-xs mb-8 font-medium leading-relaxed">
                    Assista a um vídeo curto para ativar o **BÔNUS 2X** de XP e Troféus na sua próxima simulação!
                  </p>
                  
                  <button 
                    onClick={() => {
                      alert("SINAL 2X ATIVADO: Suas próximas recompensas serão duplicadas!");
                      setShowRewardAdModal(false);
                      // In a real implementation, you'd set a boolean state 'is2XActive'
                    }}
                    className="w-full py-5 bg-[#bc13fe] text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(188,19,254,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 group"
                  >
                    <Star className="w-6 h-6 fill-white group-hover:rotate-180 transition-transform duration-500" />
                    Ativar Bônus 2X
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
