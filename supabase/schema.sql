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

CREATE OR REPLACE FUNCTION increment_activity(log_user_id uuid, log_date date)
RETURNS void AS $$
  INSERT INTO activity_log (user_id, date, items_done)
  VALUES (log_user_id, log_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET items_done = activity_log.items_done + 1;
$$ LANGUAGE sql;

ALTER TABLE sections     DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics       DISABLE ROW LEVEL SECURITY;
ALTER TABLE items        DISABLE ROW LEVEL SECURITY;
ALTER TABLE sources      DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
