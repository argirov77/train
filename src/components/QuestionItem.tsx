import { useState } from 'react';
import type { Question } from '@/types';

export function QuestionItem({
  index,
  question,
  onDelete,
}: {
  index: number;
  question: Question;
  onDelete: (id: string) => Promise<void>;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const difficultyColors = ['', 'bg-green-500/20 text-green-400', 'bg-amber-500/20 text-amber-400', 'bg-red-500/20 text-red-400'];
  const difficultyLabels = ['', 'легкий', 'средний', 'сложный'];

  return (
    <div className="group rounded border border-slate-800 p-2 text-sm space-y-1">
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1">
          {index + 1}. {question.text}
          {question.difficulty && question.difficulty >= 1 && question.difficulty <= 3 && (
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${difficultyColors[question.difficulty]}`}>
              {difficultyLabels[question.difficulty]}
            </span>
          )}
        </p>
        <div className="flex items-center gap-1">
          {question.answer && (
            <button onClick={() => setShowAnswer((v) => !v)} className="text-xs text-slate-400 hover:text-slate-200">
              {showAnswer ? 'скрыть' : 'ответ'}
            </button>
          )}
          <button onClick={() => void onDelete(question.id)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
        </div>
      </div>
      {showAnswer && question.answer && (
        <div className="ml-4 text-xs space-y-1">
          <div className="text-green-400">Ответ: {question.answer}</div>
          {question.explanation && <div className="text-slate-400">{question.explanation}</div>}
        </div>
      )}
    </div>
  );
}
