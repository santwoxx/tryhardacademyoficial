import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Auth } from 'firebase/auth';

interface BannedScreenProps {
  auth: Auth;
}

export function BannedScreen({ auth }: BannedScreenProps) {
  return (
    <motion.div
      key="banned-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#050505] p-4 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500 mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">Conta Suspensa</h1>
      <p className="text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
        Sua conta foi permanentemente banida da Tryhard Academy devido a violações das regras do jogo ou uso de trapaças.
      </p>
      <button
        onClick={() => auth.signOut()}
        className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
      >
        Sair da Conta
      </button>
    </motion.div>
  );
}
