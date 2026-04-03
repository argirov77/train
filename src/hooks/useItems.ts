import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserId } from '@/lib/userId';
import type { CompleteItemResult, Section } from '@/types';

export function useItems(setSections: Dispatch<SetStateAction<Section[]>>, refetch: () => Promise<void>) {
  const toggleCheck = async (itemId: string, checked: boolean): Promise<{ xpAwarded?: number }> => {
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

    if (!supabase) return {};

    const userId = await getUserId();

    if (checked) {
      const { data, error } = await supabase.rpc('complete_item', { p_user_id: userId, p_item_id: itemId });
      if (error) { await refetch(); throw error; }
      const result = (data as CompleteItemResult[] | null)?.[0];
      return { xpAwarded: result?.xp_awarded ?? 0 };
    } else {
      const { error } = await supabase.rpc('start_item', { p_user_id: userId, p_item_id: itemId });
      if (error) { await refetch(); throw error; }
      return {};
    }
  };

  const addItem = async (topicId: string, title: string, position: number, estimatedMinutes?: number) => {
    if (!supabase) return;
    const row: Record<string, unknown> = { topic_id: topicId, title, position };
    if (estimatedMinutes && estimatedMinutes > 0) row.estimated_minutes = estimatedMinutes;
    const { error } = await supabase.from('items').insert(row);
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
