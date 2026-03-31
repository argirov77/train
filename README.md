# Learning System v2

Персональная система обучения с иерархией: **Раздел → Тема → Пункт**.

## Что нового

- Новая структура данных: sections/topics/items/sources/questions/activity_log.
- Полностью переработанный UI: аккордеоны, прогресс-бары, inline источники и вопросы.
- Геймификация: streak по дням активности.

## Стек

- React + Vite + TypeScript
- Tailwind CSS v3
- Supabase (Postgres) + `@supabase/supabase-js`
- Netlify

## Настройка БД (Supabase)

1. Открой Supabase SQL Editor.
2. Выполни `supabase/schema.sql`.
3. Выполни `supabase/seed.sql` для стартовых данных.
4. Убедись, что функция `increment_activity(date)` создана.

## Локальный запуск

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

`VITE_SUPABASE_URL` — только Project URL вида `https://<project-ref>.supabase.co`.
`VITE_SUPABASE_ANON_KEY` — только anon/publishable key.

## Деплой на Netlify

`netlify.toml` уже настроен:

- build command: `npm run build`
- publish: `dist`
- SPA redirect на `/index.html`

Environment variables в Netlify:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
