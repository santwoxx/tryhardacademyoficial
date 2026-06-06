import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserPlus, X, Search, GraduationCap, Trash2, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { firestore } from '../firebase';
import { 
  collection, 
  query as fsQuery, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  limit as fsLimit,
  serverTimestamp as fsServerTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ref, remove } from 'firebase/database';

interface Invitation {
  email: string;
  role: 'teacher' | 'student';
  schoolName?: string;
  createdAt: number;
}

interface PendingTeacher {
  uid: string;
  email?: string;
  nickname: string;
  role: string;
}

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Listen for pending teachers
    const playersRef = collection(firestore, 'players');
    const pendingQuery = fsQuery(playersRef, where('role', '==', 'pending-teacher'), fsLimit(50));
    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as PendingTeacher[];
      setPendingTeachers(list);
    });

    // Listen for approved teachers
    const approvedQuery = fsQuery(playersRef, where('role', '==', 'teacher'), fsLimit(50));
    const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as any[];
      setInvitations(list.map(t => ({ email: t.email || '', role: 'teacher', createdAt: 0, uid: t.uid, nickname: t.nickname } as any)));
    });

    return () => {
      unsubscribePending();
      unsubscribeApproved();
    };
  }, []);

  const handleApproveTeacher = async (teacher: PendingTeacher) => {
    if (!confirm(`Aprovar ${teacher.nickname} (${teacher.email}) como professor?`)) return;
    try {
      setLoading(true);
      const playerRef = doc(firestore, 'players', teacher.uid);
      await updateDoc(playerRef, {
        role: 'teacher',
        lastUpdate: fsServerTimestamp()
      });
      setSuccess('Professor aprovado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erro ao aprovar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefuseTeacher = async (teacher: PendingTeacher) => {
    if (!confirm(`Recusar e excluir a solicitação de ${teacher.nickname}?`)) return;
    try {
      setLoading(true);
      const playerRef = doc(firestore, 'players', teacher.uid);
      await deleteDoc(playerRef);
      setSuccess('Solicitação recusada e excluída.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erro ao recusar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (uid: string, name: string) => {
    if (!confirm(`Remover o cargo de professor de ${name}? ele voltará a ser jogador comum.`)) return;
    try {
      setLoading(true);
      const playerRef = doc(firestore, 'players', uid);
      await updateDoc(playerRef, {
        role: 'player',
        lastUpdate: fsServerTimestamp()
      });
      setSuccess('Professor removido com sucesso.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erro ao remover: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col p-6 overflow-hidden"
    >
      <div className="max-w-4xl w-full mx-auto flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-red-500" />
              Painel <span className="text-red-500">Administrativo</span>
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">Gerenciamento de Professores e Instituições</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden flex-1">
          {/* Pending Approvals */}
          <div className="flex flex-col overflow-hidden">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 overflow-hidden flex flex-col">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-500" />
                Solicitações Pendentes ({pendingTeachers.length})
              </h2>
              
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {pendingTeachers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                    <Timer className="w-12 h-12 opacity-10" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  pendingTeachers.map((teacher) => (
                    <div key={teacher.uid} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 group hover:border-orange-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white uppercase tracking-widest truncate">{teacher.nickname}</p>
                        <p className="text-[10px] text-white/40 font-bold truncate">{teacher.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleRefuseTeacher(teacher)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/10"
                          title="Recusar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleApproveTeacher(teacher)}
                          className="p-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-all border border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                          title="Aprovar"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Approved Teachers List */}
          <div className="flex flex-col overflow-hidden">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-full">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Professores Ativos ({invitations.length})
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {invitations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                    <GraduationCap className="w-12 h-12 opacity-10" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum professor ativo</p>
                  </div>
                ) : (
                  invitations.map((teacher: any) => (
                    <div 
                      key={teacher.uid}
                      className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <GraduationCap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-widest">{teacher.nickname}</p>
                          <p className="text-[10px] font-bold text-white/40 truncate">{teacher.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveTeacher(teacher.uid, teacher.nickname)}
                        className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remover Acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
