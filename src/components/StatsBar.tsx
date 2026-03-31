interface Stats {
  total: number;
  done: number;
  inProgress: number;
  remaining: number;
  progressPercent: number;
}

const cards = [
  { key: 'total' as const, label: 'Всего тем', color: 'text-blue-400' },
  { key: 'inProgress' as const, label: 'В процессе', color: 'text-amber-400' },
  { key: 'done' as const, label: 'Изучено', color: 'text-emerald-400' },
  { key: 'remaining' as const, label: 'Осталось', color: 'text-gray-400' },
];

export function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-3">
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ key, label, color }) => (
          <div
            key={key}
            className="bg-surface-card border border-border rounded-lg p-4 text-center"
          >
            <div className={`text-2xl font-mono font-bold ${color}`}>
              {stats[key]}
            </div>
            <div className="text-sm text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
