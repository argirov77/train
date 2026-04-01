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

  const recordAttempt = async (questionId: string, userAnswer: string, isCorrect: boolean, responseTimeMs?: number) => {
    if (!supabase) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('question_attempts').insert({
      user_id: userId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      score: isCorrect ? 1 : 0,
      response_time_ms: responseTimeMs,
    });
    if (error) throw error;
  };

  return { addQuestion, deleteQuestion, recordAttempt };
}
