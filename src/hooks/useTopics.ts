import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, supabaseInitError } from '@/lib/supabase';
import type { Topic, TopicInsert, Status, Category } from '@/types';

const DEFAULT_TOPICS: Omit<TopicInsert, 'notes'>[] = [
  // SCADA
  { name: 'OPC UA / DA протоколы', subtitle: 'стандарт передачи данных', category: 'SCADA', status: 'todo', priority: 'высокий' },
  { name: 'Historian системы', subtitle: 'PI System, Wonderware', category: 'SCADA', status: 'todo', priority: 'высокий' },
  { name: 'HMI разработка', subtitle: 'SCADA интерфейсы', category: 'SCADA', status: 'todo', priority: 'средний' },
  { name: 'DNP3 / IEC 60870 / IEC 61850', subtitle: 'протоколы энергетики', category: 'SCADA', status: 'todo', priority: 'высокий' },
  { name: 'Кибербезопасность ICS/SCADA', subtitle: 'NERC CIP, IEC 62443', category: 'SCADA', status: 'todo', priority: 'средний' },
  { name: 'Реальное время в SCADA', subtitle: 'latency, надёжность', category: 'SCADA', status: 'todo', priority: 'средний' },
  // Прогнозирование
  { name: 'Прогнозирование нагрузки (STLF/MTLF)', subtitle: 'краткосрочный и среднесрочный', category: 'Прогнозирование', status: 'todo', priority: 'высокий' },
  { name: 'Прогнозирование выработки ВИЭ', subtitle: 'солнце, ветер', category: 'Прогнозирование', status: 'todo', priority: 'высокий' },
  { name: 'Временные ряды: ARIMA, Prophet', subtitle: 'классические методы', category: 'Прогнозирование', status: 'todo', priority: 'средний' },
  { name: 'Обработка данных SCADA для ML', subtitle: 'пропуски, аномалии, нормализация', category: 'Прогнозирование', status: 'todo', priority: 'высокий' },
  { name: 'Метеоданные в прогнозах', subtitle: 'NWP, ERA5', category: 'Прогнозирование', status: 'todo', priority: 'средний' },
  // AI / ML
  { name: 'Нейросети для временных рядов', subtitle: 'LSTM, Transformer, N-BEATS', category: 'AI / ML', status: 'todo', priority: 'высокий' },
  { name: 'Feature engineering для энергетики', subtitle: 'лаги, сезонность, календарь', category: 'AI / ML', status: 'todo', priority: 'высокий' },
  { name: 'MLOps и деплой моделей', subtitle: 'MLflow, Docker, CI/CD', category: 'AI / ML', status: 'todo', priority: 'высокий' },
  { name: 'Explainability (SHAP, LIME)', subtitle: 'объяснение предсказаний', category: 'AI / ML', status: 'todo', priority: 'средний' },
  { name: 'Reinforcement learning для сетей', subtitle: 'оптимизация dispatch', category: 'AI / ML', status: 'todo', priority: 'низкий' },
  // Архитектура
  { name: 'Архитектура IIoT платформ', subtitle: 'edge → cloud', category: 'Архитектура', status: 'todo', priority: 'высокий' },
  { name: 'Потоковая обработка данных', subtitle: 'Kafka, Spark Streaming', category: 'Архитектура', status: 'todo', priority: 'высокий' },
  { name: 'Time-series базы данных', subtitle: 'InfluxDB, TimescaleDB', category: 'Архитектура', status: 'todo', priority: 'средний' },
  { name: 'Системная интеграция SCADA↔IT', subtitle: 'ERP, EMS, DMS', category: 'Архитектура', status: 'todo', priority: 'средний' },
  { name: 'High availability и disaster recovery', subtitle: 'для критической инфраструктуры', category: 'Архитектура', status: 'todo', priority: 'средний' },
];

const CATEGORY_ORDER: Category[] = ['SCADA', 'Прогнозирование', 'AI / ML', 'Архитектура', 'Другое'];

const LOCAL_STORAGE_KEY = 'learning_tracker_topics';

function loadLocalTopics(): Topic[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Topic[]) : [];
  } catch {
    return [];
  }
}

function saveLocalTopics(topics: Topic[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topics));
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const isLocal = !supabase;

  const fetchTopics = useCallback(async () => {
    if (isLocal) {
      setTopics(loadLocalTopics());
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: err } = await supabase!
      .from('topics')
      .select('*')
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
    } else {
      setTopics(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [isLocal]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const addTopic = useCallback(async (input: Omit<Topic, 'id' | 'created_at' | 'updated_at'>) => {
    if (isLocal) {
      const now = new Date().toISOString();
      const newTopic: Topic = {
        ...input,
        id: crypto.randomUUID(),
        notes: input.notes ?? '',
        created_at: now,
        updated_at: now,
      };
      setTopics(prev => {
        const updated = [...prev, newTopic];
        saveLocalTopics(updated);
        return updated;
      });
      return;
    }

    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const optimistic: Topic = {
      ...input,
      id: tempId,
      notes: input.notes ?? '',
      created_at: now,
      updated_at: now,
    };
    setTopics(prev => [...prev, optimistic]);

    const { data, error: err } = await supabase!
      .from('topics')
      .insert(input)
      .select()
      .single();

    if (err) {
      setTopics(prev => prev.filter(t => t.id !== tempId));
      setError(err.message);
    } else if (data) {
      setTopics(prev => prev.map(t => (t.id === tempId ? data : t)));
    }
  }, [isLocal]);

  const updateStatus = useCallback(async (id: string, status: Status) => {
    if (isLocal) {
      setTopics(prev => {
        const updated = prev.map(t =>
          t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
        );
        saveLocalTopics(updated);
        return updated;
      });
      return;
    }

    const previous = topics;
    setTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t))
    );

    const { error: err } = await supabase!.from('topics').update({ status }).eq('id', id);
    if (err) {
      setTopics(previous);
      setError(err.message);
    }
  }, [isLocal, topics]);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    if (isLocal) {
      setTopics(prev => {
        const updated = prev.map(t =>
          t.id === id ? { ...t, notes, updated_at: new Date().toISOString() } : t
        );
        saveLocalTopics(updated);
        return updated;
      });
      return;
    }

    const previous = topics;
    setTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, notes, updated_at: new Date().toISOString() } : t))
    );

    const { error: err } = await supabase!.from('topics').update({ notes }).eq('id', id);
    if (err) {
      setTopics(previous);
      setError(err.message);
    }
  }, [isLocal, topics]);

  const deleteTopic = useCallback(async (id: string) => {
    if (isLocal) {
      setTopics(prev => {
        const updated = prev.filter(t => t.id !== id);
        saveLocalTopics(updated);
        return updated;
      });
      return;
    }

    const previous = topics;
    setTopics(prev => prev.filter(t => t.id !== id));

    const { error: err } = await supabase!.from('topics').delete().eq('id', id);
    if (err) {
      setTopics(previous);
      setError(err.message);
    }
  }, [isLocal, topics]);

  const seedDefaults = useCallback(async () => {
    if (isLocal) {
      const now = new Date().toISOString();
      const seeded: Topic[] = DEFAULT_TOPICS.map(t => ({
        ...t,
        id: crypto.randomUUID(),
        notes: '',
        created_at: now,
        updated_at: now,
      }));
      setTopics(seeded);
      saveLocalTopics(seeded);
      return;
    }

    const inserts: Omit<Topic, 'id' | 'created_at' | 'updated_at'>[] = DEFAULT_TOPICS.map(t => ({
      ...t,
      notes: '',
    }));

    const { data, error: err } = await supabase!.from('topics').insert(inserts).select();
    if (err) {
      setError(err.message);
    } else if (data) {
      setTopics(data);
    }
  }, [isLocal]);

  const stats = useMemo(() => {
    const total = topics.length;
    const done = topics.filter(t => t.status === 'done').length;
    const inProgress = topics.filter(t => t.status === 'progress').length;
    const remaining = topics.filter(t => t.status === 'todo').length;
    const progressPercent = total ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, remaining, progressPercent };
  }, [topics]);

  const filtered = useMemo(
    () => (filter === 'all' ? topics : topics.filter(t => t.status === filter)),
    [topics, filter]
  );

  const grouped = useMemo(() => {
    const map = new Map<Category, Topic[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter(t => t.category === cat);
      if (items.length > 0) {
        map.set(cat, items);
      }
    }
    return map;
  }, [filtered]);

  return {
    topics,
    loading,
    error,
    filter,
    setFilter,
    stats,
    filtered,
    grouped,
    fetchTopics,
    addTopic,
    updateStatus,
    updateNotes,
    deleteTopic,
    seedDefaults,
    isLocal,
  };
}
