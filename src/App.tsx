import { useMemo, useState } from 'react';
import { AddModal } from '@/components/AddModal';
import { Header } from '@/components/Header';
import { SectionList } from '@/components/SectionList';
import { useItems } from '@/hooks/useItems';
import { useQuestions } from '@/hooks/useQuestions';
import { useSections } from '@/hooks/useSections';
import { useSources } from '@/hooks/useSources';
import { useStreak } from '@/hooks/useStreak';

export default function App() {
  const { sections, setSections, loading, error, refetch, addSection, addTopic, deleteSection, deleteTopic } = useSections();
  const { streak, refetch: refetchStreak } = useStreak();
  const { toggleCheck, addItem, deleteItem } = useItems(setSections, refetch);
  const { addSource, deleteSource } = useSources(refetch);
  const { addQuestion, deleteQuestion } = useQuestions(refetch);

  const [modal, setModal] = useState<{ mode: 'section' | 'topic' | 'item'; parentId?: string } | null>(null);

  const totals = useMemo(() => {
    const items = sections.flatMap((section) => section.topics.flatMap((topic) => topic.items));
    const done = items.filter((item) => item.checked).length;
    return { done, total: items.length };
  }, [sections]);

  return (
    <div className="min-h-screen bg-app text-slate-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-4">
        <Header done={totals.done} total={totals.total} streak={streak} onAddSection={() => setModal({ mode: 'section' })} />

        {error && <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">{error}</div>}
        {loading ? (
          <div className="p-10 text-center text-slate-400">Загрузка…</div>
        ) : (
          <SectionList
            sections={sections}
            onAddTopic={(sectionId) => setModal({ mode: 'topic', parentId: sectionId })}
            onAddItem={(topicId) => setModal({ mode: 'item', parentId: topicId })}
            onDeleteSection={deleteSection}
            onDeleteTopic={deleteTopic}
            onToggle={async (itemId, checked) => {
              await toggleCheck(itemId, checked);
              await refetchStreak();
            }}
            onDeleteItem={deleteItem}
            addSource={addSource}
            deleteSource={deleteSource}
            addQuestion={addQuestion}
            deleteQuestion={deleteQuestion}
          />
        )}
      </div>

      <AddModal
        open={modal !== null}
        mode={modal?.mode ?? 'section'}
        title={modal?.mode === 'topic' ? 'Добавить тему' : modal?.mode === 'item' ? 'Добавить пункт' : 'Добавить раздел'}
        onClose={() => setModal(null)}
        onSubmit={async ({ title, description }) => {
          if (!modal) return;
          if (modal.mode === 'section') {
            await addSection(title, description);
          } else if (modal.mode === 'topic' && modal.parentId) {
            await addTopic(modal.parentId, title, description);
          } else if (modal.mode === 'item' && modal.parentId) {
            const topic = sections.flatMap((s) => s.topics).find((t) => t.id === modal.parentId);
            await addItem(modal.parentId, title, topic?.items.length ?? 0);
          }
        }}
      />
    </div>
  );
}
