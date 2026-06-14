import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Crown, Star } from 'lucide-react';
import { Auth } from 'firebase/auth';
import { Firestore, doc, getDoc } from 'firebase/firestore';

interface TimeLimitScreenProps {
  handleBuyVip: () => void;
  user: any;
  isOnline: boolean;
  setGameState: (state: any) => void;
  setPlayerData: (data: any) => void;
  setPaymentReturnToast: (toast: { type: 'success' | null }) => void;
  auth: Auth;
  firestore: Firestore;
}

export function TimeLimitScreen({
  handleBuyVip,
  user,
  isOnline,
  setGameState,
  setPlayerData,
  setPaymentReturnToast,
  auth,
  firestore,
}: TimeLimitScreenProps) {
  return (
    <motion.div
      key="time-limit-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#050505] p-4 text-center overflow-y-auto"
    >
      <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500 mb-6 animate-pulse">
        <Timer className="w-12 h-12 text-yellow-500" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-4">Tempo Esgotado</h1>
      <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
        Você atingiu o limite de <span className="text-white font-black">30 minutos diários</span> gratuitos.<br/><br/>
        Assine o plano <span className="text-[#bc13fe] font-black uppercase">Tryhard VIP</span> (R$ 14,90/mês) para jogar <span className="text-yellow-400 font-black">ilimitado</span> todos os dias!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-md mb-8">
        {[
          { icon: Timer, label: 'Tempo Ilimitado' },
          { icon: Crown, label: 'Selo VIP' },
          { icon: Star, label: 'Skins Exclusivas' }
        ].map((b, i) => (
          <div key={i} className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <b.icon className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleBuyVip}
          className="w-full py-4 bg-gradient-to-r from-[#bc13fe] to-[#8007cf] text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(188,19,254,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5 text-yellow-300" />
          ASSINAR VIP - R$ 14,90/mês
        </button>
        <button
          onClick={async () => {
            if (user && isOnline) {
              try {
                const snap = await getDoc(doc(firestore, 'players', user.uid));
                if (snap.exists() && (snap.data() as any).isVIP) {
                  setPlayerData(snap.data() as any);
                  setGameState('menu');
                  setPaymentReturnToast({ type: 'success' });
                  return;
                }
              } catch (e) { /* silent */ }
            }
            setGameState('menu');
          }}
          className="w-full py-3 bg-white/5 border border-white/10 text-white/80 rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer text-sm"
        >
          Já sou VIP? Verificar
        </button>
        <button
          onClick={() => auth.signOut()}
          className="w-full py-3 bg-transparent text-white/30 hover:text-white/60 transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
        >
          Sair da Conta
        </button>
      </div>
    </motion.div>
  );
}
