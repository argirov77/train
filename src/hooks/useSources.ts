import { supabase } from '@/lib/supabase';
import type { SourceKind } from '@/types';

export function useSources(refetch: () => Promise<void>) {
  const addSource = async (itemId: string, label: string, url: string, kind: SourceKind) => {
    if (!supabase) return;
    const { error } = await supabase.from('item_sources').insert({ item_id: itemId, label, url, kind });
    if (error) throw error;
    await refetch();
  };

  const deleteSource = async (sourceId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('item_sources').delete().eq('id', sourceId);
    if (error) throw error;
    await refetch();
  };

  return { addSource, deleteSource };
}
