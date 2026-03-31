import { ProgressBar } from '@/components/ProgressBar';
import { StreakBadge } from '@/components/StreakBadge';
import type { StreakInfo } from '@/types';

interface HeaderProps {
  done: number;
  total: number;
  streak: StreakInfo;
  onAddSection: () => void;
}

export function Header({ done, total, streak, onAddSection }: HeaderProps) {
  return (
    <header className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Learning System v2</h1>
          <p className="text-sm text-slate-400">Разделы → Темы → Пункты с источниками и вопросами</p>
        </div>
        <button onClick={onAddSection} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm">+ раздел</button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-slate-400">Общий прогресс: {done} из {total}</div>
          <ProgressBar done={done} total={total} />
        </div>
        <StreakBadge streak={streak} />
      </div>
    </header>
  );
}
