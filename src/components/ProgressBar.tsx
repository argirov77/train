interface ProgressBarProps {
  done: number;
  total: number;
}

export function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const color =
    percent === 100
      ? 'bg-green-500'
      : percent > 66
        ? 'bg-blue-500'
        : percent > 33
          ? 'bg-amber-500'
          : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 min-w-44">
      <div className="h-2 w-full rounded bg-slate-700 overflow-hidden">
        <div className={`h-2 transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">
        {percent}% {percent === 100 && '✓'}
      </span>
    </div>
  );
}
