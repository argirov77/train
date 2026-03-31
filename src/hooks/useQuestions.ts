import { supabase } from '@/lib/supabase';

export function useQuestions(refetch: () => Promise<void>) {
  const addQuestion = async (itemId: string, text: string, position: number) => {
    if (!supabase) return;
    const { error } = await supabase.from('questions').insert({ item_id: itemId, text, position });
    if (error) throw error;
    await refetch();
  };

  const deleteQuestion = async (questionId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw error;
    await refetch();
  };

  return { addQuestion, deleteQuestion };
}
