import { ProgressBar } from '@/components/ProgressBar';
import { StreakBadge } from '@/components/StreakBadge';
import type { StreakInfo } from '@/types';

interface HeaderProps {
  done: number;
  total: number;
  streak: StreakInfo;
  onToggleSidebar: () => void;
}

export function Header({ done, total, streak, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Learning System v2</h1>
            <p className="text-sm text-slate-400">Разделы → Темы → Пункты с источниками и вопросами</p>
          </div>
        </div>
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
