import { useState } from 'react';
import { QuestionItem } from '@/components/QuestionItem';
import { QuizMode } from '@/components/QuizMode';
import { SourceItem } from '@/components/SourceItem';
import type { Item, SourceKind } from '@/types';

interface ItemDetailProps {
  item: Item;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  recordAttempt: (questionId: string, userAnswer: string, isCorrect: boolean, responseTimeMs?: number) => Promise<void>;
}

export function ItemDetail({ item, addSource, deleteSource, addQuestion, deleteQuestion, recordAttempt }: ItemDetailProps) {
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceKind, setSourceKind] = useState<SourceKind>('link');
  const [questionText, setQuestionText] = useState('');
  const [quizOpen, setQuizOpen] = useState(false);

  const hasQuizQuestions = item.questions.some((q) => q.answer);

  return (
    <div className="ml-7 mt-2 space-y-3 rounded-lg bg-slate-900/50 border border-slate-800 p-3">
      <div className="space-y-2">
        <h4 className="font-medium">Источники</h4>
        {item.sources.map((source) => <SourceItem key={source.id} source={source} onDelete={deleteSource} />)}
        <form className="grid grid-cols-1 md:grid-cols-4 gap-2" onSubmit={async (e) => {
          e.preventDefault();
          if (!sourceLabel || !sourceUrl) return;
          await addSource(item.id, sourceLabel, sourceUrl, sourceKind);
          setSourceLabel('');
          setSourceUrl('');
        }}>
          <input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="label" />
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 md:col-span-2" placeholder="url" />
          <div className="flex gap-2">
            <select value={sourceKind} onChange={(e) => setSourceKind(e.target.value as SourceKind)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
              <option value="youtube">youtube</option><option value="doc">doc</option><option value="article">article</option><option value="link">link</option>
            </select>
            <button className="px-2 py-1 rounded bg-blue-600">+</button>
          </div>
        </form>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Вопросы для самопроверки</h4>
          {hasQuizQuestions && !quizOpen && (
            <button onClick={() => setQuizOpen(true)} className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-xs font-medium transition-colors">
              Квиз
            </button>
          )}
        </div>
        {quizOpen ? (
          <QuizMode questions={item.questions} recordAttempt={recordAttempt} onClose={() => setQuizOpen(false)} />
        ) : (
          <>
            {item.questions.map((question, index) => (
              <QuestionItem key={question.id} index={index} question={question} onDelete={deleteQuestion} />
            ))}
            <form className="flex gap-2" onSubmit={async (e) => {
              e.preventDefault();
              if (!questionText.trim()) return;
              await addQuestion(item.id, questionText.trim(), item.questions.length);
              setQuestionText('');
            }}>
              <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="Новый вопрос" />
              <button className="px-2 py-1 rounded bg-blue-600">+</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
