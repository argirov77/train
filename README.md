# Learning Tracker

Личный трекер обучения для подготовки к смене работы по направлениям:
**SCADA / Прогнозирование / AI-ML / Системная архитектура**

## Стек

- React + Vite + TypeScript
- Tailwind CSS v3
- Supabase (Postgres)
- Netlify (хостинг)

## Деплой

### 1. Supabase

1. Создать проект на [supabase.com](https://supabase.com)
2. Открыть SQL Editor, выполнить миграцию из `supabase/schema.sql`
3. Скопировать **Project URL** и **anon/publishable key** из Settings → API (не secret key)

### 2. Локально

```bash
cp .env.local.example .env.local
# Вставить ключи из Supabase в .env.local
npm install
npm run dev
```

### 3. Netlify

1. Пушнуть репо на GitHub
2. Подключить репо в [netlify.com](https://netlify.com) → Add new site
3. Build command: `npm run build`, Publish dir: `dist`
4. Site settings → Environment variables → добавить:
   - `VITE_SUPABASE_URL` (только Project URL вида `https://<project-ref>.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` (вставить anon/publishable key, обычно `sb_publishable_...`)
   - ⚠️ Никогда не вставляй `sb_secret_...` во фронтенд-переменные.
5. Deploy
