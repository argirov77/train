import { useState } from 'react';
import type { Category, Priority } from '@/types';

const categories: Category[] = ['SCADA', 'Прогнозирование', 'AI / ML', 'Архитектура', 'Другое'];
const priorities: Priority[] = ['высокий', 'средний', 'низкий'];

interface AddTopicFormProps {
  onAdd: (input: { name: string; category: Category; priority: Priority; status: 'todo'; notes: string }) => void;
}

export function AddTopicForm({ onAdd }: AddTopicFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('SCADA');
  const [priority, setPriority] = useState<Priority>('средний');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, category, priority, status: 'todo', notes: '' });
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-card border border-border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Название темы..."
          className="flex-1 bg-surface-primary border border-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
          className="bg-surface-primary border border-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="bg-surface-primary border border-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {priorities.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          Добавить
        </button>
      </div>
    </form>
  );
}
