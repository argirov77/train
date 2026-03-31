import type { Source } from '@/types';

const icons = {
  youtube: '▶',
  doc: '📄',
  article: '📰',
  link: '🔗',
};

export function SourceItem({ source, onDelete }: { source: Source; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className="group flex items-center justify-between rounded border border-slate-800 p-2 text-sm">
      <div className="flex items-center gap-2">
        <span>{icons[source.kind]}</span>
        <span>{source.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">открыть ↗</a>
        <button onClick={() => void onDelete(source.id)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
      </div>
    </div>
  );
}
