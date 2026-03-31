import type { Status } from '@/types';

const tabs: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'todo', label: 'Не начато' },
  { value: 'progress', label: 'В процессе' },
  { value: 'review', label: 'Повторение' },
  { value: 'done', label: 'Готово' },
];

interface FilterTabsProps {
  current: Status | 'all';
  onChange: (value: Status | 'all') => void;
}

export function FilterTabs({ current, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            current === value
              ? 'bg-blue-600 text-white'
              : 'bg-surface-card text-gray-400 hover:text-gray-200 hover:bg-surface-elevated border border-border'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
