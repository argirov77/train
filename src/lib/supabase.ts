import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const isValidSupabaseUrl = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('supabase.co');
  } catch {
    return false;
  }
};

const getSupabaseInitError = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Supabase не настроен: проверь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Netlify Environment variables и сделай redeploy.';
  }

  if (!isValidSupabaseUrl(supabaseUrl)) {
    return 'VITE_SUPABASE_URL должен быть Project URL (https://<project-ref>.supabase.co), а не ключом API.';
  }

  if (supabaseUrl.startsWith('sb_')) {
    return 'VITE_SUPABASE_URL содержит API-ключ. Вставь сюда только Project URL из Supabase → Settings → API.';
  }

  if (supabaseAnonKey.startsWith('sb_secret_')) {
    return 'VITE_SUPABASE_ANON_KEY содержит secret key. Для фронтенда используй только anon/publishable key (обычно начинается с sb_publishable_).';
  }

  return null;
};

export const supabaseInitError = getSupabaseInitError();

export const supabase = supabaseInitError
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string);
