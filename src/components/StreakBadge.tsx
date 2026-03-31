import type { StreakInfo } from '@/types';

interface StreakBadgeProps {
  streak: StreakInfo;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const { current, longest, today } = streak;
  let style = 'bg-slate-800 text-slate-300';
  let fire = '🔥';
  if (current >= 30) {
    style = 'bg-red-500/20 text-red-300 animate-pulse';
    fire = '🔥🔥🔥';
  } else if (current >= 7) {
    style = 'bg-orange-500/20 text-orange-300';
    fire = '🔥🔥';
  } else if (current >= 1) {
    style = today ? 'bg-orange-400/20 text-orange-200' : 'bg-orange-500/20 text-orange-300';
  }

  return (
    <div className={`rounded-xl border border-slate-700 px-3 py-2 ${style}`}>
      {current === 0 ? (
        <div>
          <div className="text-sm">🔥 0 дней</div>
          <div className="text-xs text-slate-400">начни сегодня</div>
        </div>
      ) : (
        <div>
          <div className="text-sm font-semibold">{fire} {current} дней подряд</div>
          {longest > current && <div className="text-xs text-slate-400">Рекорд: {longest}</div>}
        </div>
      )}
    </div>
  );
}
