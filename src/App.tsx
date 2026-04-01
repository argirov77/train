import { useEffect, useMemo, useState } from 'react';
import { AddModal } from '@/components/AddModal';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SectionDetail } from '@/components/SectionDetail';
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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-select first section on load or when active section is deleted
  useEffect(() => {
    if (sections.length === 0) {
      setActiveSectionId(null);
      return;
    }
    if (!activeSectionId || !sections.find((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  const totals = useMemo(() => {
    const items = sections.flatMap((section) => section.topics.flatMap((topic) => topic.items));
    const done = items.filter((item) => item.checked).length;
    return { done, total: items.length };
  }, [sections]);

  const crudProps = {
    onAddTopic: (sectionId: string) => setModal({ mode: 'topic', parentId: sectionId }),
    onAddItem: (topicId: string) => setModal({ mode: 'item', parentId: topicId }),
    onDeleteSection: async (id: string) => {
      await deleteSection(id);
    },
    onDeleteTopic: deleteTopic,
    onToggle: async (itemId: string, checked: boolean) => {
      try {
        await toggleCheck(itemId, checked);
        await refetchStreak();
      } catch (e) {
        console.error('toggleCheck failed:', e);
      }
    },
    onDeleteItem: deleteItem,
    addSource,
    deleteSource,
    addQuestion,
    deleteQuestion,
  };

  return (
    <div className="min-h-screen bg-app text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4 flex flex-col min-h-screen">
        <Header
          done={totals.done}
          total={totals.total}
          streak={streak}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        {error && <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="p-10 text-center text-slate-400">Загрузка…</div>
        ) : (
          <div className="flex flex-1 gap-4 min-h-0">
            {/* Desktop sidebar */}
            <Sidebar
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              onAddSection={() => setModal({ mode: 'section' })}
            />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Разделы</h2>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-200 text-lg">×</button>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sections.map((section) => {
                      const items = section.topics.flatMap((t) => t.items);
                      const done = items.filter((i) => i.checked).length;
                      const total = items.length;
                      const percent = total === 0 ? 0 : Math.round((done / total) * 100);
                      const isActive = section.id === activeSectionId;

                      return (
                        <button
                          key={section.id}
                          onClick={() => { setActiveSectionId(section.id); setSidebarOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-slate-800 border-l-2 border-blue-500'
                              : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="text-sm font-medium truncate">{section.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 flex-1 rounded bg-slate-700 overflow-hidden">
                              <div
                                className={`h-1.5 transition-all duration-500 ${
                                  percent === 100 ? 'bg-green-500' : percent > 66 ? 'bg-blue-500' : percent > 33 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">{done}/{total}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => { setModal({ mode: 'section' }); setSidebarOpen(false); }}
                      className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
                    >
                      + раздел
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {activeSection ? (
                <SectionDetail section={activeSection} {...crudProps} />
              ) : (
                <div className="text-slate-400 text-center p-10">
                  {sections.length === 0 ? 'Нет разделов. Добавьте первый раздел.' : 'Выберите раздел слева'}
                </div>
              )}
            </main>
          </div>
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
