import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageSquare, Hash, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  nickname: string;
  timestamp: any;
  role?: string;
}

interface GlobalChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  currentUserUid: string;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
  currentUserUid
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  // Deduplicate before mapping
  const deduplicateItems = <T,>(items: T[], keyExtractor: (item: T, index: number) => string): T[] => {
    if (!items) return [];
    const seen = new Set<string>();
    const result: T[] = [];
    items.forEach((item, index) => {
      const key = keyExtractor(item, index);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    });
    return result;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[#050505] border-l border-white/10 z-[500] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">Global Chat</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">TryHard Academy Network</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                <Hash className="w-12 h-12" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Silêncio na rede...</p>
              </div>
            ) : (
              deduplicateItems(messages, (msg) => msg.id).map((msg) => {
                const isMe = msg.uid === currentUserUid;
                const isAdmin = msg.role === 'admin';
                const isTeacher = msg.role === 'teacher' || msg.role === 'pending-teacher';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${
                        isAdmin ? 'text-red-500' : isTeacher ? 'text-yellow-400' : 'text-white/40'
                      }`}>
                        {msg.nickname}
                        {isAdmin && <span className="ml-1">[ADMIN]</span>}
                        {isTeacher && <span className="ml-1">[MESTRE]</span>}
                      </span>
                    </div>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${
                      isMe 
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-white/5 text-zinc-300 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-900/80 border-t border-white/10">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Transmita sua mensagem..."
                maxLength={200}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl transition-all shadow-lg active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex justify-between items-center px-1">
              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">Pressione ENTER para enviar</p>
              <p className={`text-[8px] font-black uppercase tracking-widest ${input.length >= 180 ? 'text-yellow-400' : 'text-white/20'}`}>
                {input.length}/200
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
