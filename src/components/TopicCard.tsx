import { useState } from 'react';
import { ItemRow } from '@/components/ItemRow';
import { ProgressBar } from '@/components/ProgressBar';
import type { SourceKind, Topic } from '@/types';

interface TopicCardProps {
  topic: Topic;
  onAddItem: (topicId: string) => void;
  onDeleteTopic: (id: string) => Promise<void>;
  onToggle: (itemId: string, checked: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

export function TopicCard(props: TopicCardProps) {
  const { topic, onAddItem, onDeleteTopic, onToggle, onDeleteItem, addSource, deleteSource, addQuestion, deleteQuestion } = props;
  const [open, setOpen] = useState(false);
  const done = topic.items.filter((item) => item.checked).length;
  const isLocked = Boolean(topic.isLocked);

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${isLocked ? 'border-slate-700 bg-slate-900/20 opacity-80' : 'border-slate-800 bg-slate-900/40'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => !isLocked && setOpen((v) => !v)}
          className={`flex-1 text-left font-medium ${isLocked ? 'cursor-not-allowed text-slate-500' : ''}`}
          title={topic.lockReason}
          disabled={isLocked}
        >
          {isLocked ? '🔒' : open ? '▼' : '▶'} {topic.title}
        </button>
        <ProgressBar done={done} total={topic.items.length} />
        <span className="text-sm text-slate-400">({done}/{topic.items.length})</span>
        <button
          onClick={() => onAddItem(topic.id)}
          className="px-2 py-1 rounded bg-blue-600 text-sm disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          title={topic.lockReason}
          disabled={isLocked}
        >
          + пункт
        </button>
        <button onClick={() => void onDeleteTopic(topic.id)} className="text-red-400">×</button>
      </div>
      {isLocked && topic.lockReason && <p className="text-xs text-amber-300">{topic.lockReason}</p>}
      <div className={`overflow-hidden transition-all duration-300 space-y-2 ${open ? 'max-h-[1500px]' : 'max-h-0'}`}>
        {topic.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onDeleteItem={onDeleteItem}
            addSource={addSource}
            deleteSource={deleteSource}
            addQuestion={addQuestion}
            deleteQuestion={deleteQuestion}
          />
        ))}
      </div>
    </div>
  );
}
