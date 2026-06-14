import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, X, CheckCircle2, Globe, Hash, Trash2, Zap, MessageSquare } from 'lucide-react';
import { deduplicateItems } from '../lib/ui';

interface LobbyScreenProps {
  room: any;
  rooms: any[];
  loadingRooms: boolean;
  lobbyFilterMode: string;
  setLobbyFilterMode: (m: any) => void;
  handleCreateRoom: () => void;
  handleToggleMode: () => void;
  handleToggleReady: () => void;
  handleToggleTeam: () => void;
  handleLeaveRoom: () => void;
  handleKickPlayer: (pid: string) => void;
  handleStartMultiplayerGame: () => void;
  beginGameWithRotationCheck: (cb: () => void) => void;
  requestLandscape: () => void;
  handleJoinRoom: (rid: string) => void;
  handleQuickJoin: () => void;
  user: any;
  loading: boolean;
  setGameState: (s: any) => void;
}

export function LobbyScreen({
  room,
  rooms,
  loadingRooms,
  lobbyFilterMode,
  setLobbyFilterMode,
  handleCreateRoom,
  handleToggleMode,
  handleToggleReady,
  handleToggleTeam,
  handleLeaveRoom,
  handleKickPlayer,
  handleStartMultiplayerGame,
  beginGameWithRotationCheck,
  requestLandscape,
  handleJoinRoom,
  handleQuickJoin,
  user,
  loading,
  setGameState,
}: LobbyScreenProps) {
  return (
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

            {!room && (
              <div className="flex gap-2 mt-4">
                {['all', 'ffa', 'teams', 'coop'].map((m) => (
                  <button
                    key={`filter-${m}`}
                    onClick={() => setLobbyFilterMode(m)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      lobbyFilterMode === m
                        ? 'bg-[#00f2ff] border-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {m === 'all' ? 'TODAS' : m === 'coop' ? 'CO-OP' : m.toUpperCase()}
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
                        {room.mode === 'ffa' ? 'FREE FOR ALL' : room.mode === 'teams' ? 'TEAM DEATHMATCH (2V2)' : 'SALA ABERTA (CO-OP)'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/5">
                      <Hash className="w-5 h-5 text-white/20" />
                      <span className="text-white/60 font-black uppercase italic tracking-tighter text-lg">
                        {room.mode === 'ffa' ? 'FREE FOR ALL' : room.mode === 'teams' ? 'TEAM DEATHMATCH (2V2)' : 'SALA ABERTA (CO-OP)'}
                      </span>
                    </div>
                  )}
                </div>
                {room.mode === 'coop' && (
                  <div className="text-[10px] text-green-400/60 font-bold uppercase tracking-[0.2em] text-center py-2 px-4 bg-green-500/5 rounded-xl border border-green-500/10 w-full">
                    🌱 Modo Livre — Sem vencedores nem perdedores. Apenas jogue e se divirta!
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {deduplicateItems(room.playerIds, (pid: string) => `lobby-p-${pid}`, 'LobbyPlayerList').map((pid: string) => {
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
                        {room.mode === 'coop' ? (
                          <div className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-[9px] font-black text-green-400 text-center uppercase tracking-widest">
                            CO-OP
                          </div>
                        ) : room.mode === 'teams' ? (
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

                        {isMe && pid !== room.hostId && room.mode !== 'coop' && (
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

                        {room.hostId === user.uid && !isMe && (
                          <button
                            onClick={() => handleKickPlayer(pid)}
                            className="px-2 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {Array.from({ length: 4 - room.playerIds.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="relative h-[92px] p-4 rounded-2xl border border-white/5 bg-zinc-950/40 flex flex-col items-center justify-center overflow-hidden"
                  >
                    <div className="absolute w-[140px] h-[140px] border border-cyan-400/5 rounded-full animate-glow-pulse flex items-center justify-center pointer-events-none">
                      <div className="w-[80px] h-[80px] border border-[#bc13fe]/5 rounded-full" />
                    </div>
                    <div
                      className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-[#00f2ff]/5 via-transparent to-transparent animate-radar pointer-events-none"
                      style={{ transformOrigin: 'top left', marginTop: '-100%', marginLeft: '-100%' }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400/70"
                      >
                        PROCURANDO ATLETA...
                      </motion.div>
                      <span className="text-[7px] text-white/25 uppercase font-mono tracking-widest">SLOT DISPONÍVEL</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 w-full pt-4">
                {room.hostId === user.uid && (
                  <button
                    onClick={() => beginGameWithRotationCheck(() => { handleStartMultiplayerGame(); requestLandscape(); })}
                    disabled={loading || (room.mode !== 'coop' && room.playerIds.length < 2)}
                    className="flex-1 bg-[#00f2ff] hover:bg-[#00d8e6] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                  >
                    {room.mode === 'coop' ? 'ABRIR SALA' : 'INICIAR COMBATE'}
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
              {rooms.length > 0 && !room && (
                <button
                  onClick={handleQuickJoin}
                  disabled={loading}
                  className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f2ff]/20 to-[#bc13fe]/20 hover:from-[#00f2ff]/30 hover:to-[#bc13fe]/30 border border-[#00f2ff]/30 hover:border-[#00f2ff]/50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 group"
                >
                  <Zap className="w-4 h-4 text-[#00f2ff] group-hover:animate-pulse" />
                  ENTRADA RÁPIDA
                  <span className="text-[8px] text-white/30 normal-case font-normal ml-2">({rooms.length} salas disponíveis)</span>
                </button>
              )}
              {rooms.length > 0 ? (
                deduplicateItems(rooms, (r: any) => `room-${r.id}`, 'LobbyRooms').map((r: any) => (
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
                        <h4 className="text-white font-bold uppercase tracking-wider">
                          {r.players?.[r.hostId]?.nickname || 'Jogador'}'s Sala
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-white/30 text-[10px] uppercase tracking-widest">
                            {r.playerIds.length}/4 Jogadores
                          </span>
                          <span className="text-[8px] text-white/20">|</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            r.mode === 'ffa' ? 'text-red-400' : r.mode === 'teams' ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {r.mode === 'ffa' ? 'FFA' : r.mode === 'teams' ? '2V2' : 'CO-OP'}
                          </span>
                        </div>
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
  );
}
