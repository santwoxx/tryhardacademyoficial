import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, BookOpen } from 'lucide-react';
import { CornerDecoration, deduplicateItems } from '../lib/ui';
import { Question } from '../game/questionEngine';

interface QuestionModalProps {
  showModal: boolean;
  currentQuestion: Question | null;
  feedback: string | null;
  selectedOption: any;
  timeLeft: number;
  combo: number;
  handleAnswer: (opt: any) => void;
}

export function QuestionModal({
  showModal,
  currentQuestion,
  feedback,
  selectedOption,
  timeLeft,
  combo,
  handleAnswer,
}: QuestionModalProps) {
  if (!currentQuestion) return null;

  return (
    <motion.div
      key="math-challenge"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 md:p-4 overflow-y-auto"
      onClick={() => !feedback && handleAnswer(null)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          x: feedback === 'wrong' || feedback === 'timeout' ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ x: { duration: 0.4 } }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm md:max-w-md landscape:max-w-lg bg-gradient-to-b ${
          feedback === 'correct'
            ? 'from-green-950/30 via-black/85 to-black/95 border-green-500/50'
            : feedback === 'wrong' || feedback === 'timeout'
            ? 'from-red-950/30 via-black/85 to-black/95 border-red-500/50'
            : 'from-cyan-950/20 via-black/85 to-black/95 border-cyan-500/40'
        } border-2 rounded-3xl landscape:rounded-2xl p-5 md:p-6 landscape:p-4 backdrop-blur-3xl overflow-hidden shadow-[0_0_60px_rgba(0,242,255,0.15)] my-auto`}
      >
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] rounded-full pointer-events-none ${
          feedback === 'correct' ? 'bg-green-500/30' :
          feedback === 'wrong' || feedback === 'timeout' ? 'bg-red-500/30' : 'bg-cyan-500/20'
        }`} />
        <CornerDecoration className={`${
          feedback === 'correct' ? 'text-green-500/60' :
          feedback === 'wrong' || feedback === 'timeout' ? 'text-red-500/60' : 'text-cyan-400/60'
        } -inset-2`} />

        <div className="relative flex justify-between items-start mb-4 md:mb-5 landscape:mb-2">
          <div className="flex flex-col gap-1.5 landscape:gap-1">
            <div className={`flex items-center gap-1.5 landscape:gap-1 px-2.5 py-1 landscape:px-2 landscape:py-0.5 rounded-full border backdrop-blur-sm w-fit ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 border-green-500/30' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-400' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className={`text-[9px] landscape:text-[8px] font-black uppercase tracking-widest italic ${
                currentQuestion.difficulty === 'easy' ? 'text-green-400' :
                currentQuestion.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {currentQuestion.difficulty === 'easy' ? 'Fácil' :
                 currentQuestion.difficulty === 'medium' ? 'Médio' : 'Crítico'}
              </span>
            </div>
            {currentQuestion.subject && (
              <div className="flex items-center gap-1 text-[8px] landscape:text-[7px] uppercase tracking-widest text-white/40 font-bold px-1">
                <BookOpen className="w-2.5 h-2.5" />
                <span>
                  {currentQuestion.subject === 'math' ? 'Matemática' :
                   currentQuestion.subject === 'portuguese' ? 'Português' :
                   currentQuestion.subject === 'science' ? 'Ciências' :
                   currentQuestion.subject === 'history' ? 'História' :
                   currentQuestion.subject === 'geography' ? 'Geografia' : 'Conhecimento'}
                </span>
              </div>
            )}
          </div>

          <div className="relative w-11 h-11 landscape:w-9 landscape:h-9 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
              <motion.circle
                cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" strokeLinecap="round"
                className={timeLeft <= 3 ? 'text-red-500' : 'text-cyan-400'}
                style={{ filter: `drop-shadow(0 0 4px currentColor)` }}
                strokeDasharray="94.2"
                initial={false}
                animate={{ strokeDashoffset: 94.2 - (94.2 * timeLeft) / 30 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <span className={`relative text-xs landscape:text-[10px] font-black tabular-nums ${
              timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'
            }`}>
              {timeLeft}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {combo > 1 && !feedback && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 8 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 right-1/2 translate-x-1/2 landscape:translate-x-0 landscape:right-4 landscape:top-2 bg-gradient-to-r from-[#bc13fe] to-pink-500 text-white px-3 py-1 landscape:px-2 landscape:py-0.5 rounded-full font-black text-[10px] landscape:text-[9px] shadow-[0_0_20px_rgba(188,19,254,0.6)] border border-white/30 z-20"
            >
              COMBO ×{combo}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative text-center my-4 md:my-6 landscape:my-2">
          <h2 className="text-4xl md:text-5xl landscape:text-3xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(0,242,255,0.3)] leading-tight">
            {currentQuestion.text}
          </h2>
          {currentQuestion.explanation && feedback && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 text-[10px] landscape:text-[9px] font-bold uppercase tracking-wider ${
                feedback === 'correct' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {currentQuestion.explanation}
            </motion.p>
          )}
        </div>

        <div className="relative grid grid-cols-2 landscape:grid-cols-4 gap-2 md:gap-3 landscape:gap-1.5">
          {deduplicateItems(currentQuestion.options || [], (opt) => `option-${currentQuestion.id}-${opt}`, 'QuestionOptions').map((opt, i) => {
            const isCorrect = feedback === 'correct' && opt === currentQuestion.answer;
            const isWrong = feedback === 'wrong' && opt === selectedOption;
            return (
              <motion.button
                key={`option-${currentQuestion.id}-${opt}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !feedback && handleAnswer(opt)}
                disabled={!!feedback}
                className={`relative py-4 md:py-5 landscape:py-2.5 text-lg md:text-2xl landscape:text-base font-black tabular-nums rounded-xl landscape:rounded-lg border-2 transition-all overflow-hidden ${
                  isCorrect
                    ? 'bg-green-500 border-green-400 text-white scale-[1.03] shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                    : isWrong
                    ? 'bg-red-500 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    : feedback && opt === currentQuestion.answer
                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/10 hover:border-cyan-400/50 hover:scale-[1.02]'
                }`}
              >
                {isCorrect && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-white" />}
                {isWrong && <X className="absolute top-1 right-1 w-3 h-3 text-white" />}
                <span className="relative">{opt}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px)',
            backgroundSize: '100% 4px'
          }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
