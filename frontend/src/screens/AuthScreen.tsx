import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Timer } from 'lucide-react';
import { Auth } from 'firebase/auth';

interface AuthScreenProps {
  playerData: any;
  authError: string | null;
  loading: boolean;
  handleGoogleLogin: () => void;
  handleGuestLogin: () => void;
  auth: Auth;
}

export function AuthScreen({
  playerData,
  authError,
  loading,
  handleGoogleLogin,
  handleGuestLogin,
  auth,
}: AuthScreenProps) {
  return (
    <motion.div
      key="auth-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#050505] overflow-hidden p-4"
    >
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
            src="./logo.png"
            alt="Tryhard Academy Logo"
            className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(188,19,254,0.4)]"
          />
          <h1 className="text-3xl font-black italic text-white tracking-tighter mb-2">
            TRYHARD <span className="text-[#bc13fe]">ACADEMY</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
            Bem-vindo ao Combate
          </p>
        </div>

        {playerData?.role === 'pending-teacher' ? (
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
              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
            >
              Sair da Conta
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center">
            <h2 className="text-white text-center font-bold uppercase tracking-widest text-sm mb-2">Pronto para a Arena?</h2>

            {authError && (
              <div className="w-full flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                <span>{authError}</span>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative w-full py-5 bg-gradient-to-r from-[#bc13fe] to-[#8007cf] hover:from-[#d024ff] hover:to-[#9612eb] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_35px_rgba(188,19,254,0.4)] disabled:opacity-50"
            >
              <Users className="w-5 h-5 text-white animate-pulse" />
              Entrar com o Google
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-4 bg-[#0a0a0a] border border-[#bc13fe]/30 hover:border-[#bc13fe]/70 hover:bg-[#bc13fe]/5 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Entrar em Modo de Teste
            </button>

            <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">
              Acesso exclusivo via login Google ou Modo de Teste
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
