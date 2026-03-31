-- Learning Tracker: схема БД
-- Запустить в Supabase SQL Editor

create table topics (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  subtitle    text,
  category    text not null,   -- 'SCADA' | 'Прогнозирование' | 'AI / ML' | 'Архитектура' | 'Другое'
  status      text not null default 'todo',  -- 'todo' | 'progress' | 'review' | 'done'
  priority    text not null default 'средний', -- 'высокий' | 'средний' | 'низкий'
  notes       text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Триггер для автообновления updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on topics
for each row execute function update_updated_at();

-- RLS выключен (личное приложение)
alter table topics disable row level security;
