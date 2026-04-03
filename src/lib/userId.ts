import { supabase } from './supabase';

const ANON_ID = '00000000-0000-0000-0000-000000000000';

export async function getUserId(): Promise<string> {
  if (!supabase) return ANON_ID;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? ANON_ID;
}
