import { useState } from 'react';
import { ItemDetail } from '@/components/ItemDetail';
import type { Item, SourceKind } from '@/types';

interface ItemRowProps {
  item: Item;
  onToggle: (itemId: string, checked: boolean) => Promise<{ xpAwarded?: number }>;
  onDeleteItem: (id: string) => Promise<void>;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  recordAttempt: (questionId: string, userAnswer: string, isCorrect: boolean, responseTimeMs?: number) => Promise<void>;
}

export function ItemRow(props: ItemRowProps) {
  const { item, onToggle, onDeleteItem, addSource, deleteSource, addQuestion, deleteQuestion, recordAttempt } = props;
  const [open, setOpen] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);

  const handleToggle = async (checked: boolean) => {
    const result = await onToggle(item.id, checked);
    if (result.xpAwarded && result.xpAwarded > 0) {
      setPulse(true);
      setXpPopup(result.xpAwarded);
      setTimeout(() => { setPulse(false); setXpPopup(null); }, 1000);
    }
  };

  return (
    <div className="group">
      <div className={`relative flex items-center gap-2 p-2 rounded border border-slate-800 ${item.checked ? 'opacity-60' : ''} ${pulse ? 'animate-completePulse' : ''}`}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => void handleToggle(e.target.checked)}
        />
        <button
          className={`flex-1 text-left ${item.checked ? 'line-through' : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          {item.title}
        </button>
        {item.estimated_minutes && item.estimated_minutes > 0 && (
          <span className="text-xs text-slate-500">~{item.estimated_minutes} мин</span>
        )}
        {item.sources.length > 0 && <span className="text-xs text-slate-400">{item.sources.length} ист.</span>}
        {item.questions.length > 0 && <span className="text-xs text-slate-400">{item.questions.length} вопр.</span>}
        <button onClick={() => void onDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity">×</button>
        {xpPopup !== null && (
          <span className="absolute -top-2 left-8 text-green-400 font-bold text-sm animate-floatUp pointer-events-none">
            +{xpPopup} XP
          </span>
        )}
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[1200px]' : 'max-h-0'}`}>
        <ItemDetail item={item} addSource={addSource} deleteSource={deleteSource} addQuestion={addQuestion} deleteQuestion={deleteQuestion} recordAttempt={recordAttempt} />
      </div>
    </div>
  );
}
