import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseInitError } from '@/lib/supabase';
import type { Section, UserProgress } from '@/types';

const byPosition = <T extends { position: number }>(items: T[]) =>
  [...items].sort((a, b) => a.position - b.position);

const TOPIC_LOCK_REASON = 'Завершите предыдущую тему минимум на 50%';
const ITEM_LOCK_REASON = 'Завершите предыдущий пункт';

const normalizeSections = (data: Section[] | null): Section[] =>
  byPosition(data ?? []).map((section) => {
    const topics = byPosition(section.topics ?? []);

    return {
      ...section,
      topics: topics.map((topic, topicIndex) => {
        const sortedItems = byPosition(topic.items ?? []).map((item) => ({
          ...item,
          sources: item.sources ?? [],
          questions: byPosition(item.questions ?? []),
        }));

        const previousTopic = topics[topicIndex - 1];
        const previousTopicItems = byPosition(previousTopic?.items ?? []);
        const previousDone = previousTopicItems.filter((item) => item.checked).length;
        const previousProgress =
          previousTopicItems.length === 0 ? 0 : previousDone / previousTopicItems.length;
        const topicLocked = topicIndex > 0 && previousProgress < 0.5;

        return {
          ...topic,
          isLocked: topicLocked,
          lockReason: topicLocked ? TOPIC_LOCK_REASON : undefined,
          items: sortedItems.map((item, itemIndex) => {
            const previousItem = sortedItems[itemIndex - 1];
            const itemLocked = topicLocked || (itemIndex > 0 && !previousItem?.checked);

            return {
              ...item,
              isLocked: itemLocked,
              lockReason: topicLocked
                ? TOPIC_LOCK_REASON
                : itemLocked
                  ? ITEM_LOCK_REASON
                  : undefined,
            };
          }),
        };
      }),
    };
  });

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setError(supabaseInitError);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('sections')
      .select(`
        *,
        topics (
          *,
          items (
            *,
            sources (*),
            questions (*)
          )
        )
      `)
      .order('position')
      .order('position', { referencedTable: 'topics' })
      .order('position', { referencedTable: 'topics.items' })
      .order('position', { referencedTable: 'topics.items.questions' });

    if (fetchError) {
      setError(fetchError.message);
      setSections([]);
      setLoading(false);
      return;
    }

    const normalized = normalizeSections(data as Section[]);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;

    if (!userId) {
      setSections(normalized);
      setLoading(false);
      return;
    }

    const itemIds = normalized.flatMap((section) =>
      section.topics.flatMap((topic) => topic.items.map((item) => item.id)),
    );

    if (itemIds.length === 0) {
      setSections(normalized);
      setLoading(false);
      return;
    }

    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('item_id, is_completed, completed_at')
      .eq('user_id', userId)
      .in('item_id', itemIds);

    if (progressError) throw progressError;

    const progressRows = (progressData ?? []) as UserProgress[];
    const progressMap = new Map(progressRows.map((row) => [row.item_id, row]));

    setSections(
      normalized.map((section) => ({
        ...section,
        topics: section.topics.map((topic) => ({
          ...topic,
          items: topic.items.map((item) => {
            const progress = progressMap.get(item.id);
            return progress
              ? {
                  ...item,
                  checked: progress.is_completed,
                  checked_at: progress.completed_at,
                }
              : item;
          }),
        })),
      })),
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const getNextPosition = async (
    table: 'sections' | 'topics' | 'items',
    field?: { key: string; value: string },
  ) => {
    if (!supabase) return 0;

    let query = supabase
      .from(table)
      .select('position')
      .order('position', { ascending: false })
      .limit(1);

    if (field) query = query.eq(field.key, field.value);

    const { data } = await query;
    return (data?.[0]?.position ?? -1) + 1;
  };

  const addSection = async (title: string, description?: string) => {
    if (!supabase) return;

    const position = await getNextPosition('sections');
    const { error: insertError } = await supabase
      .from('sections')
      .insert({ title, description, position });

    if (insertError) throw insertError;
    await refetch();
  };

  const addTopic = async (sectionId: string, title: string, description?: string) => {
    if (!supabase) return;

    const position = await getNextPosition('topics', {
      key: 'section_id',
      value: sectionId,
    });

    const { error: insertError } = await supabase
      .from('topics')
      .insert({ section_id: sectionId, title, description, position });

    if (insertError) throw insertError;
    await refetch();
  };

  const deleteSection = async (sectionId: string) => {
    if (!supabase) return;

    const { error: deleteError } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId);

    if (deleteError) throw deleteError;
    await refetch();
  };

  const deleteTopic = async (topicId: string) => {
    if (!supabase) return;

    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (deleteError) throw deleteError;
    await refetch();
  };

  return {
    sections,
    setSections,
    loading,
    error,
    refetch,
    addSection,
    addTopic,
    deleteSection,
    deleteTopic,
  };
}