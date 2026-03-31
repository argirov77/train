import { useState, useEffect, useRef } from 'react';
import type { Topic, Status } from '@/types';

const statuses: { value: Status; label: string; color: string }[] = [
  { value: 'todo', label: 'Не начато', color: 'bg-gray-600 hover:bg-gray-500' },
  { value: 'progress', label: 'В процессе', color: 'bg-blue-600 hover:bg-blue-500' },
  { value: 'review', label: 'Повторение', color: 'bg-amber-600 hover:bg-amber-500' },
  { value: 'done', label: 'Готово', color: 'bg-emerald-600 hover:bg-emerald-500' },
];

interface DetailPanelProps {
  topic: Topic;
  onUpdateStatus: (id: string, status: Status) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function DetailPanel({ topic, onUpdateStatus, onUpdateNotes, onDelete }: DetailPanelProps) {
  const [localNotes, setLocalNotes] = useState(topic.notes);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalNotes(topic.notes);
  }, [topic.id, topic.notes]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onUpdateNotes(topic.id, value);
    }, 800);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить тему "${topic.name}"?`)) {
      onDelete(topic.id);
    }
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onUpdateStatus(topic.id, value)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              topic.status === value
                ? `${color} text-white ring-2 ring-offset-1 ring-offset-surface-card ring-white/30`
                : 'bg-surface-elevated text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={localNotes}
        onChange={e => handleNotesChange(e.target.value)}
        placeholder="Заметки..."
        rows={3}
        className="w-full bg-surface-primary border border-border rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 resize-y focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
