import { useState } from 'react';

type Mode = 'section' | 'topic' | 'item';

interface AddModalProps {
  open: boolean;
  mode: Mode;
  title: string;
  onClose: () => void;
  onSubmit: (payload: { title: string; description?: string }) => Promise<void>;
}

export function AddModal({ open, mode, title, onClose, onSubmit }: AddModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await onSubmit({ title: name.trim(), description: description.trim() || undefined });
          setName('');
          setDescription('');
          onClose();
        }}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" />
        {mode !== 'item' && (
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" />
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-slate-700">Отмена</button>
          <button type="submit" className="px-3 py-2 rounded bg-blue-600">Добавить</button>
        </div>
      </form>
    </div>
  );
}
