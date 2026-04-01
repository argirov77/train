import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import type { Section } from '@/types';

export function useItems(setSections: Dispatch<SetStateAction<Section[]>>, refetch: () => Promise<void>) {
  const toggleCheck = async (itemId: string, checked: boolean) => {
    if (!supabase) {
      const checkedAt = checked ? new Date().toISOString() : null;
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          topics: section.topics.map((topic) => ({
            ...topic,
            items: topic.items.map((item) => (item.id === itemId ? { ...item, checked, checked_at: checkedAt } : item)),
          })),
        })),
      );
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) return;

    const { data: currentProgress, error: currentProgressError } = await supabase
      .from('user_item_progress')
      .select('status, completed_at, completion_percent, started_at')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (currentProgressError) throw currentProgressError;

    const previousChecked = currentProgress?.status === 'completed';
    const checkedAt = checked
      ? previousChecked && currentProgress?.completed_at
        ? currentProgress.completed_at
        : new Date().toISOString()
      : null;

    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        topics: section.topics.map((topic) => ({
          ...topic,
          items: topic.items.map((item) => (item.id === itemId ? { ...item, checked, checked_at: checkedAt } : item)),
        })),
      })),
    );

    const { error } = await supabase.from('user_item_progress').upsert(
      {
        user_id: userId,
        item_id: itemId,
        status: checked ? 'completed' : 'in_progress',
        started_at: currentProgress?.started_at ?? new Date().toISOString(),
        completed_at: checkedAt,
        last_seen_at: new Date().toISOString(),
        completion_percent: checked ? 100 : 0,
      },
      { onConflict: 'user_id,item_id' },
    );

    if (error) {
      await refetch();
      throw error;
    }
  };

  const addItem = async (topicId: string, title: string, position: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('items').insert({ topic_id: topicId, title, position });
    if (error) throw error;
    await refetch();
  };

  const deleteItem = async (itemId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) throw error;
    await refetch();
  };

  return { toggleCheck, addItem, deleteItem };
}
