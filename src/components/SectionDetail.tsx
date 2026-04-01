import { ProgressBar } from '@/components/ProgressBar';
import { TopicCard } from '@/components/TopicCard';
import type { Section, SourceKind } from '@/types';

interface SectionDetailProps {
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

export function SectionDetail(props: SectionDetailProps) {
  const { section, onAddTopic, onAddItem, onDeleteSection, onDeleteTopic, onToggle, onDeleteItem, addSource, deleteSource, addQuestion, deleteQuestion } = props;

  const items = section.topics.flatMap((topic) => topic.items);
  const done = items.filter((item) => item.checked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-semibold flex-1">{section.title}</h2>
        <ProgressBar done={done} total={items.length} />
        <span className="text-sm text-slate-400">({done}/{items.length})</span>
        <button onClick={() => onAddTopic(section.id)} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm transition-colors">+ тема</button>
        <button onClick={() => void onDeleteSection(section.id)} className="text-red-400 hover:text-red-300 transition-colors px-1">×</button>
      </div>

      {section.description && (
        <p className="text-sm text-slate-400">{section.description}</p>
      )}

      <div className="space-y-2">
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

      {section.topics.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          Нет тем. Нажмите «+ тема» чтобы добавить.
        </div>
      )}
    </div>
  );
}
