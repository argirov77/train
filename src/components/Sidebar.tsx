import type { Section } from '@/types';

interface SidebarProps {
  sections: Section[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: () => void;
}

export function Sidebar({ sections, activeSectionId, onSelectSection, onAddSection }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-72 shrink-0 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Разделы</h2>
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
              onClick={() => onSelectSection(section.id)}
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
                      percent === 100
                        ? 'bg-green-500'
                        : percent > 66
                          ? 'bg-blue-500'
                          : percent > 33
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {done}/{total}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <button
          onClick={onAddSection}
          className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
        >
          + раздел
        </button>
      </div>
    </aside>
  );
}
