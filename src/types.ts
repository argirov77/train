export type Status = 'todo' | 'progress' | 'review' | 'done';
export type Priority = 'высокий' | 'средний' | 'низкий';
export type Category = 'SCADA' | 'Прогнозирование' | 'AI / ML' | 'Архитектура' | 'Другое';

export interface Topic {
  id: string;
  name: string;
  subtitle?: string;
  category: Category;
  status: Status;
  priority: Priority;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type TopicInsert = Omit<Topic, 'id' | 'created_at' | 'updated_at'>;
