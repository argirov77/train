-- Learning System v2 schema

-- Дропаем старое
DROP TABLE IF EXISTS topics CASCADE;

-- Разделы
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Темы внутри раздела
CREATE TABLE topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Пункты внутри темы
CREATE TABLE items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title       text NOT NULL,
  position    int  NOT NULL DEFAULT 0,
  checked     boolean NOT NULL DEFAULT false,
  checked_at  timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE sources (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id  uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  label    text NOT NULL,
  url      text NOT NULL,
  kind     text NOT NULL DEFAULT 'link'
);

CREATE TABLE questions (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id  uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  text     text NOT NULL,
  position int  NOT NULL DEFAULT 0
);

CREATE TABLE activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  date       date NOT NULL,
  items_done int  NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE TABLE item_completions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  item_id         uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  completion_date date NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id, completion_date)
);

CREATE OR REPLACE FUNCTION increment_activity(log_user_id uuid, log_item_id uuid, log_date date)
RETURNS void AS $$
DECLARE
  inserted_count int;
BEGIN
  INSERT INTO item_completions (user_id, item_id, completion_date)
  VALUES (log_user_id, log_item_id, log_date)
  ON CONFLICT (user_id, item_id, completion_date) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  IF inserted_count = 0 THEN
    RETURN;
  END IF;

  INSERT INTO activity_log (user_id, date, items_done)
  VALUES (log_user_id, log_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET items_done = activity_log.items_done + 1;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE sections     DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics       DISABLE ROW LEVEL SECURITY;
ALTER TABLE items        DISABLE ROW LEVEL SECURITY;
ALTER TABLE sources      DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log     DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_completions DISABLE ROW LEVEL SECURITY;
