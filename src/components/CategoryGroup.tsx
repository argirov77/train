import type { Topic, Category, Status } from '@/types';
import { TopicCard } from './TopicCard';

interface CategoryGroupProps {
  category: Category;
  topics: Topic[];
  onUpdateStatus: (id: string, status: Status) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function CategoryGroup({
  category,
  topics,
  onUpdateStatus,
  onUpdateNotes,
  onDelete,
}: CategoryGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="font-mono text-lg font-semibold text-gray-200">
          {category}
        </h2>
        <span className="bg-surface-elevated text-gray-400 text-xs font-medium px-2 py-0.5 rounded">
          {topics.length}
        </span>
      </div>

      <div className="space-y-2">
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onUpdateStatus={onUpdateStatus}
            onUpdateNotes={onUpdateNotes}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
