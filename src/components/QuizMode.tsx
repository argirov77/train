import { useState } from 'react';
import type { Question } from '@/types';

interface QuizModeProps {
  questions: Question[];
  recordAttempt: (questionId: string, userAnswer: string, isCorrect: boolean, responseTimeMs?: number) => Promise<void>;
  onClose: () => void;
}

interface AttemptResult {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeMs: number;
}

export function QuizMode({ questions, recordAttempt, onClose }: QuizModeProps) {
  const quizQuestions = questions.filter((q) => q.answer);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [finished, setFinished] = useState(false);

  const q = quizQuestions[current];

  const handleSubmit = async () => {
    if (!q || !answer.trim()) return;
    const timeMs = Date.now() - startTime;
    const isCorrect = answer.trim().toLowerCase() === (q.answer ?? '').trim().toLowerCase();
    const result: AttemptResult = { question: q, userAnswer: answer.trim(), isCorrect, timeMs };
    setResults((prev) => [...prev, result]);
    setShowResult(true);
    await recordAttempt(q.id, answer.trim(), isCorrect, timeMs).catch(() => {});
  };

  const handleNext = () => {
    if (current + 1 >= quizQuestions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setAnswer('');
      setShowResult(false);
      setStartTime(Date.now());
    }
  };

  if (finished) {
    const correct = results.filter((r) => r.isCorrect).length;
    const avgTime = Math.round(results.reduce((sum, r) => sum + r.timeMs, 0) / results.length / 1000);
    return (
      <div className="space-y-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
        <h4 className="font-semibold text-lg">Результаты</h4>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">{correct}/{quizQuestions.length} правильных</span>
          <span className="text-slate-400">~{avgTime} сек среднее</span>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`text-sm p-2 rounded ${r.isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <div className="font-medium">{r.question.text}</div>
              <div className="text-xs mt-1">
                Ваш ответ: <span className={r.isCorrect ? 'text-green-400' : 'text-red-400'}>{r.userAnswer}</span>
                {!r.isCorrect && <span className="text-slate-400 ml-2">Правильно: {r.question.answer}</span>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-700 text-sm hover:bg-slate-600 transition-colors">Закрыть</button>
      </div>
    );
  }

  if (!q) return null;

  const difficultyColors = ['', 'text-green-400', 'text-amber-400', 'text-red-400'];
  const difficultyLabels = ['', 'легкий', 'средний', 'сложный'];

  return (
    <div className="space-y-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Вопрос {current + 1}/{quizQuestions.length}</h4>
        <div className="flex items-center gap-2">
          {q.difficulty && q.difficulty >= 1 && q.difficulty <= 3 && (
            <span className={`text-xs ${difficultyColors[q.difficulty]}`}>{difficultyLabels[q.difficulty]}</span>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
        </div>
      </div>
      <p className="text-sm">{q.text}</p>
      {!showResult ? (
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ваш ответ…"
            className="flex-1 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm transition-colors">Ответить</button>
        </form>
      ) : (
        <div className="space-y-2">
          <div className={`p-2 rounded text-sm ${results[results.length - 1]?.isCorrect ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
            {results[results.length - 1]?.isCorrect ? 'Правильно!' : `Неправильно. Ответ: ${q.answer}`}
          </div>
          {q.explanation && (
            <div className="p-2 rounded bg-slate-800/50 text-xs text-slate-300">{q.explanation}</div>
          )}
          <button onClick={handleNext} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm transition-colors">
            {current + 1 >= quizQuestions.length ? 'Результаты' : 'Далее'}
          </button>
        </div>
      )}
    </div>
  );
}
