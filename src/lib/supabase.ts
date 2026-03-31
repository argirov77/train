import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const isValidSupabaseUrl = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabaseInitError =
  !isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey
    ? 'Supabase не настроен: проверь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Netlify Environment variables и сделай redeploy.'
    : null;

export const supabase = supabaseInitError
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string);
