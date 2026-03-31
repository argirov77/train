import { useState } from 'react';
import { ItemDetail } from '@/components/ItemDetail';
import type { Item, SourceKind } from '@/types';

interface ItemRowProps {
  item: Item;
  onToggle: (itemId: string, checked: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

export function ItemRow(props: ItemRowProps) {
  const { item, onToggle, onDeleteItem, addSource, deleteSource, addQuestion, deleteQuestion } = props;
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <div className={`flex items-center gap-2 p-2 rounded border border-slate-800 ${item.checked ? 'opacity-60' : ''}`}>
        <input type="checkbox" checked={item.checked} onChange={(e) => void onToggle(item.id, e.target.checked)} />
        <button className={`flex-1 text-left ${item.checked ? 'line-through' : ''}`} onClick={() => setOpen((v) => !v)}>
          {item.title}
        </button>
        {item.sources.length > 0 && <span className="text-xs text-slate-400">{item.sources.length} источника</span>}
        {item.questions.length > 0 && <span className="text-xs text-slate-400">{item.questions.length} вопроса</span>}
        <button onClick={() => void onDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400">×</button>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[800px]' : 'max-h-0'}`}>
        <ItemDetail item={item} addSource={addSource} deleteSource={deleteSource} addQuestion={addQuestion} deleteQuestion={deleteQuestion} />
      </div>
    </div>
  );
}
