import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, UserPlus, X, Search, BarChart3, Trash2, CheckCircle2, AlertCircle, Trophy, Star, Clock, Users } from 'lucide-react';
import { firestore } from '../firebase';
import { 
  collection, 
  query as fsQuery, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  limit as fsLimit,
  serverTimestamp as fsServerTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

interface Student {
  uid: string;
  nickname: string;
  trophies: number;
  level: number;
  lastUpdate: number;
  email?: string;
  premiumUntil?: number;
}

interface Invitation {
  email: string;
  role: 'student';
  teacherId: string;
  schoolName?: string;
  createdAt: number;
}

export const TeacherDashboard: React.FC<{ teacherId: string; schoolName?: string; onClose: () => void }> = ({ teacherId, schoolName, onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'reports'>('students');

  useEffect(() => {
    // Listen for invitations created by this teacher
    const invitationsRef = collection(firestore, 'invitations');
    const inviteQuery = fsQuery(invitationsRef, where('teacherId', '==', teacherId), fsLimit(100));
    const unsubscribeInvites = onSnapshot(inviteQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data()) as Invitation[];
      setInvitations(list);
    });

    // Listen for actual players linked to this teacher
    const playersRef = collection(firestore, 'players');
    const playersQuery = fsQuery(playersRef, where('teacherId', '==', teacherId), fsLimit(100));
    const unsubscribePlayers = onSnapshot(playersQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(list);
    });

    return () => {
      unsubscribeInvites();
      unsubscribePlayers();
    };
  }, [teacherId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const inviteRef = doc(firestore, 'invitations', newStudentEmail.toLowerCase().trim());
      
      await setDoc(inviteRef, {
        email: newStudentEmail.toLowerCase().trim(),
        role: 'student',
        teacherId,
        schoolName: schoolName || '',
        createdAt: fsServerTimestamp()
      });

      setNewStudentEmail('');
      setSuccess('Aluno autorizado! Ele deve usar este e-mail para entrar.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erro ao autorizar aluno: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvite = async (email: string) => {
    if (!confirm(`Remover autorização para ${email}?`)) return;
    try {
      await deleteDoc(doc(firestore, 'invitations', email.toLowerCase().trim()));
    } catch (err: any) {
      alert('Erro ao remover: ' + err.message);
    }
  };

  const handleGrantPremium = async (student: Student) => {
    if (!confirm(`Conceder 30 dias de acesso ilimitado para ${student.nickname}?`)) return;
    try {
      setLoading(true);
      const now = Date.now();
      const currentPremium = student.premiumUntil || now;
      const baseDate = currentPremium > now ? currentPremium : now;
      const newExpiry = baseDate + (30 * 24 * 60 * 60 * 1000);

      const playerRef = doc(firestore, 'players', student.uid);
      await updateDoc(playerRef, {
        premiumUntil: newExpiry,
        lastUpdate: fsServerTimestamp()
      });
      setSuccess(`Acesso ilimitado concedido para ${student.nickname}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Erro ao conceder acesso: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalTrophies = students.reduce((acc, s) => acc + (s.trophies || 0), 0);
  const avgLevel = students.length > 0 ? (students.reduce((acc, s) => acc + (s.level || 1), 0) / students.length).toFixed(1) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#050505] flex flex-col p-6 overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              Portal do <span className="text-blue-500">Educador</span>
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-1">{schoolName || 'Instituição de Ensino'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Alunos</p>
              <p className="text-xl font-black text-white">{students.length}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Troféus Coletivos</p>
              <p className="text-xl font-black text-white">{totalTrophies}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nível Médio</p>
              <p className="text-xl font-black text-white">{avgLevel}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            Gerenciar Alunos
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            Relatórios de Evolução
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
          {activeTab === 'students' ? (
            <>
              {/* Add Student Form */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    Cadastrar Aluno
                  </h2>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 block">E-mail do Aluno</label>
                      <input 
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="aluno@escola.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                    {error && <div className="p-3 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-xl">{error}</div>}
                    {success && <div className="p-3 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-xl">{success}</div>}
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processando...' : 'Autorizar Aluno'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Invitations List */}
              <div className="lg:col-span-2 flex flex-col overflow-hidden">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-full">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Aguardando Cadastro ({invitations.length})
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {invitations.map((invite) => (
                      <div key={invite.email} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Clock className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-bold text-white/60 uppercase tracking-widest">{invite.email}</span>
                        </div>
                        <button onClick={() => handleRemoveInvite(invite.email)} className="p-2 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {invitations.length === 0 && <p className="text-center text-white/20 text-[10px] font-bold uppercase py-8">Nenhuma autorização pendente</p>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 flex flex-col overflow-hidden">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-full">
                <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Desempenho dos Alunos
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        <th className="px-4 pb-2">Aluno</th>
                        <th className="px-4 pb-2">Nível</th>
                        <th className="px-4 pb-2">Troféus</th>
                        <th className="px-4 pb-2">Última Atividade</th>
                        <th className="px-4 pb-2">Acesso</th>
                        <th className="px-4 pb-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const isPremium = student.premiumUntil && student.premiumUntil > Date.now();
                        return (
                          <tr key={student.uid} className="bg-black/40 group hover:bg-white/5 transition-all">
                            <td className="px-4 py-4 rounded-l-2xl border-y border-l border-white/5">
                              <span className="text-sm font-black text-white uppercase tracking-widest">{student.nickname}</span>
                            </td>
                            <td className="px-4 py-4 border-y border-white/5">
                              <div className="flex items-center gap-2">
                                <Star className="w-3 h-3 text-purple-500" />
                                <span className="text-sm font-black text-purple-500">{student.level || 1}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 border-y border-white/5">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                                <span className="text-sm font-black text-yellow-500">{student.trophies || 0}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 border-y border-white/5">
                              <span className="text-[10px] font-bold text-white/40 uppercase">
                                {student.lastUpdate ? new Date(student.lastUpdate).toLocaleDateString() : '---'}
                              </span>
                            </td>
                            <td className="px-4 py-4 border-y border-white/5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-green-500'} animate-pulse`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-yellow-500' : 'text-green-500'}`}>
                                  {isPremium ? 'Premium (Educador)' : 'Grátis'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 rounded-r-2xl border-y border-r border-white/5">
                              <button 
                                onClick={() => handleGrantPremium(student)}
                                className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-yellow-500/20"
                                title="Conceder +30 dias de Premium"
                              >
                                +30 Dias
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {students.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/10 gap-4">
                      <BarChart3 className="w-16 h-16 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest">Aguardando primeiros alunos entrarem...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
