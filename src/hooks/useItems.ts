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

    const { error } = checked
      ? await supabase.rpc('complete_item', { p_user_id: userId, p_item_id: itemId })
      : await supabase.rpc('start_item', { p_user_id: userId, p_item_id: itemId });

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
