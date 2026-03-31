import { useTopics } from '@/hooks/useTopics';
import { StatsBar } from '@/components/StatsBar';
import { FilterTabs } from '@/components/FilterTabs';
import { CategoryGroup } from '@/components/CategoryGroup';
import { AddTopicForm } from '@/components/AddTopicForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabaseInitError } from '@/lib/supabase';

export default function App() {
  const {
    loading,
    error,
    filter,
    setFilter,
    stats,
    grouped,
    addTopic,
    updateStatus,
    updateNotes,
    deleteTopic,
    seedDefaults,
    isLocal,
  } = useTopics();

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-surface-primary text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-gray-100">
              Learning Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              SCADA / Прогнозирование / AI-ML / Архитектура
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Add Topic Form */}
        <AddTopicForm onAdd={addTopic} />

        {/* Filter Tabs */}
        <FilterTabs current={filter} onChange={setFilter} />

        {/* Supabase config warning (non-blocking) */}
        {isLocal && supabaseInitError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
            <span className="font-medium">Локальный режим:</span> данные сохраняются в браузере.{' '}
            {supabaseInitError}
          </div>
        )}

        {/* Runtime error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grouped.size === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-gray-500 text-lg">
              {filter === 'all' ? 'Нет тем для изучения' : 'Нет тем с этим статусом'}
            </div>
            {filter === 'all' && (
              <button
                onClick={seedDefaults}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Загрузить стартовый набор тем
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([category, topics]) => (
              <CategoryGroup
                key={category}
                category={category}
                topics={topics}
                onUpdateStatus={updateStatus}
                onUpdateNotes={updateNotes}
                onDelete={deleteTopic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
