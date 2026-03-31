import { useState } from 'react';
import type { Topic, Status } from '@/types';
import { DetailPanel } from './DetailPanel';

const statusConfig: Record<Status, { label: string; color: string }> = {
  todo: { label: 'не начато', color: 'bg-gray-500/20 text-gray-400' },
  progress: { label: 'в процессе', color: 'bg-blue-500/20 text-blue-400' },
  review: { label: 'повторение', color: 'bg-amber-500/20 text-amber-400' },
  done: { label: 'готово', color: 'bg-emerald-500/20 text-emerald-400' },
};

const priorityConfig: Record<string, string> = {
  'высокий': 'bg-red-500/20 text-red-400',
  'средний': 'bg-yellow-500/20 text-yellow-400',
  'низкий': 'bg-green-500/20 text-green-400',
};

interface TopicCardProps {
  topic: Topic;
  onUpdateStatus: (id: string, status: Status) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function TopicCard({ topic, onUpdateStatus, onUpdateNotes, onDelete }: TopicCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const status = statusConfig[topic.status];
  const priorityClass = priorityConfig[topic.priority] ?? '';

  return (
    <div
      className={`bg-surface-card border border-border rounded-lg overflow-hidden transition-opacity ${
        topic.status === 'done' ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-surface-elevated/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="font-mono font-medium text-gray-100 truncate">
            {topic.name}
          </div>
          {topic.subtitle && (
            <div className="text-sm text-gray-500 truncate mt-0.5">
              {topic.subtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityClass}`}>
            {topic.priority}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">
            <DetailPanel
              topic={topic}
              onUpdateStatus={onUpdateStatus}
              onUpdateNotes={onUpdateNotes}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
