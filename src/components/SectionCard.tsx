import { useState } from 'react';
import { ProgressBar } from '@/components/ProgressBar';
import { TopicCard } from '@/components/TopicCard';
import type { Section, SourceKind } from '@/types';

interface SectionCardProps {
  section: Section;
  onAddTopic: (sectionId: string) => void;
  onAddItem: (topicId: string) => void;
  onDeleteSection: (id: string) => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onToggle: (itemId: string, checked: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

export function SectionCard(props: SectionCardProps) {
  const { section, onAddTopic, onAddItem, onDeleteSection, onDeleteTopic, onToggle, onDeleteItem, addSource, deleteSource, addQuestion, deleteQuestion } = props;
  const [open, setOpen] = useState(false);

  const items = section.topics.flatMap((topic) => topic.items);
  const done = items.filter((item) => item.checked).length;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen((v) => !v)} className="flex-1 text-left font-semibold">{open ? '▼' : '▶'} {section.title}</button>
        <ProgressBar done={done} total={items.length} />
        <span className="text-sm text-slate-400">({done}/{items.length})</span>
        <button onClick={() => onAddTopic(section.id)} className="px-2 py-1 rounded bg-blue-600 text-sm">+ тема</button>
        <button onClick={() => void onDeleteSection(section.id)} className="text-red-400">×</button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 mt-3 space-y-2 ${open ? 'max-h-[2000px]' : 'max-h-0'}`}>
        {section.topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onAddItem={onAddItem}
            onDeleteTopic={onDeleteTopic}
            onToggle={onToggle}
            onDeleteItem={onDeleteItem}
            addSource={addSource}
            deleteSource={deleteSource}
            addQuestion={addQuestion}
            deleteQuestion={deleteQuestion}
          />
        ))}
      </div>
    </section>
  );
}
