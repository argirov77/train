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
      .from('user_progress')
      .select('is_completed, completed_at')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (currentProgressError) throw currentProgressError;

    const previousChecked = currentProgress?.is_completed ?? false;
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

    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        item_id: itemId,
        is_completed: checked,
        completed_at: checkedAt,
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_id' },
    );

    if (error) {
      await refetch();
      throw error;
    }

    if (!previousChecked && checked) {
      const { error: rpcError } = await supabase.rpc('complete_item', {
        p_user_id: userId,
        p_item_id: itemId,
        p_completed_at: checkedAt,
      });
      if (rpcError) throw rpcError;
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
