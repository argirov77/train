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
  return (
    <div className="group flex items-start justify-between rounded border border-slate-800 p-2 text-sm">
      <p>{index + 1}. {question.text}</p>
      <button onClick={() => void onDelete(question.id)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
    </div>
  );
}
