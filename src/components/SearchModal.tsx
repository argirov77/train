import { useEffect, useMemo, useRef, useState } from 'react';
import type { Section } from '@/types';

interface SearchResult {
  type: 'section' | 'topic' | 'item';
  id: string;
  title: string;
  breadcrumb: string;
  sectionId: string;
  checked?: boolean;
}

interface SearchModalProps {
  open: boolean;
  sections: Section[];
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export function SearchModal({ open, sections, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];
    for (const section of sections) {
      results.push({ type: 'section', id: section.id, title: section.title, breadcrumb: '', sectionId: section.id });
      for (const topic of section.topics) {
        results.push({ type: 'topic', id: topic.id, title: topic.title, breadcrumb: section.title, sectionId: section.id });
        for (const item of topic.items) {
          results.push({ type: 'item', id: item.id, title: item.title, breadcrumb: `${section.title} > ${topic.title}`, sectionId: section.id, checked: item.checked });
        }
      }
    }
    return results;
  }, [sections]);

  const filtered = useMemo(() => {
    if (!query.trim()) return index.slice(0, 20);
    const q = query.toLowerCase();
    return index.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 20);
  }, [index, query]);

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.sectionId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return; }
    if (e.key === 'Enter' && filtered[selected]) { handleSelect(filtered[selected]); }
  };

  if (!open) return null;

  const typeBadge: Record<string, string> = {
    section: 'bg-blue-500/20 text-blue-300',
    topic: 'bg-purple-500/20 text-purple-300',
    item: 'bg-slate-700 text-slate-300',
  };

  const typeLabel: Record<string, string> = {
    section: 'Раздел',
    topic: 'Тема',
    item: 'Пункт',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-[15vh] p-4 z-50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 border-b border-slate-800">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по разделам, темам, пунктам…"
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-slate-500 text-center">Ничего не найдено</div>
          )}
          {filtered.map((result, i) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                i === selected ? 'bg-blue-600/20' : 'hover:bg-slate-800/50'
              }`}
            >
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${typeBadge[result.type]}`}>
                {typeLabel[result.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`truncate ${result.checked ? 'line-through opacity-60' : ''}`}>{result.title}</div>
                {result.breadcrumb && <div className="text-xs text-slate-500 truncate">{result.breadcrumb}</div>}
              </div>
              {result.checked && <span className="text-green-500 text-xs">✓</span>}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-500 flex gap-3">
          <span>↑↓ навигация</span>
          <span>↵ выбрать</span>
          <span>Esc закрыть</span>
        </div>
      </div>
    </div>
  );
}
