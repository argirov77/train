import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const isValidSupabaseUrl = (value?: string) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('supabase.co');
  } catch {
    return false;
  }
};

const isSupabaseKey = (value?: string) =>
  Boolean(value) &&
  !value!.startsWith('https://') &&
  (value!.startsWith('sb_') || value!.split('.').length === 3);

const normalizeSupabaseEnv = (url?: string, anonKey?: string) => {
  if (!url || !anonKey) {
    return { supabaseUrl: url, supabaseAnonKey: anonKey };
  }
  const looksLikeSwapped = isSupabaseKey(url) && isValidSupabaseUrl(anonKey);
  if (looksLikeSwapped) {
    return { supabaseUrl: anonKey, supabaseAnonKey: url };
  }
  return { supabaseUrl: url, supabaseAnonKey: anonKey };
};

const { supabaseUrl, supabaseAnonKey } = normalizeSupabaseEnv(rawSupabaseUrl, rawSupabaseAnonKey);

const getSupabaseInitError = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Supabase не настроен: проверь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Netlify Environment variables и сделай redeploy.';
  }
  if (isSupabaseKey(supabaseUrl) && supabaseAnonKey.startsWith('sb_secret_')) {
    return 'Переменные перепутаны: VITE_SUPABASE_URL должен быть Project URL (https://<project-ref>.supabase.co), а VITE_SUPABASE_ANON_KEY — только anon/publishable key (sb_publishable_...), не sb_secret_. Найди их в Supabase → Settings → API.';
  }
  if (isSupabaseKey(supabaseUrl)) {
    return 'VITE_SUPABASE_URL содержит API-ключ. Вставь сюда только Project URL из Supabase → Settings → API → Project URL.';
  }
  if (!isValidSupabaseUrl(supabaseUrl)) {
    return 'VITE_SUPABASE_URL должен быть Project URL (https://<project-ref>.supabase.co), а не ключом API. Найди его в Supabase → Settings → API → Project URL.';
  }
  if (supabaseAnonKey.startsWith('sb_secret_')) {
    return 'VITE_SUPABASE_ANON_KEY содержит secret key — это небезопасно! Используй anon/publishable key из Supabase → Settings → API → anon public.';
  }
  return null;
};

export const supabaseInitError = getSupabaseInitError();
export const supabase = supabaseInitError
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string);
