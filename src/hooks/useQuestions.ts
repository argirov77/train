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

  const addQuestionOption = async (
    questionId: string,
    optionText: string,
    isCorrect: boolean,
    position: number,
    explanation?: string,
  ) => {
    if (!supabase) return;
    const { error } = await supabase.from('question_options').insert({
      question_id: questionId,
      option_text: optionText,
      is_correct: isCorrect,
      position,
      explanation,
    });
    if (error) throw error;
  };

  const recordAttempt = async (questionId: string, selectedOptionId: string | null, isCorrect: boolean, responseTimeMs?: number) => {
    if (!supabase) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('question_attempts').insert({
      user_id: userId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
    });
    if (error) throw error;
  };

  return { addQuestion, deleteQuestion, addQuestionOption, recordAttempt };
}
