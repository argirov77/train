-- Learning System schema aligned with current Supabase designer

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS question_attempts CASCADE;
DROP TABLE IF EXISTS user_xp_transactions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_item_progress CASCADE;
DROP TABLE IF EXISTS item_sources CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS sections CASCADE;

CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  position    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE topics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  position    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id          uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title             text NOT NULL,
  content           text,
  item_type         text,
  position          int NOT NULL DEFAULT 0,
  estimated_minutes int,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE item_sources (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id   uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  label     text NOT NULL,
  url       text NOT NULL,
  kind      text NOT NULL DEFAULT 'link'
);

CREATE TABLE questions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  text         text NOT NULL,
  answer       text,
  explanation  text,
  difficulty   int,
  question_type text,
  position     int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_item_progress (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL,
  item_id            uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  status             text NOT NULL DEFAULT 'not_started',
  started_at         timestamptz,
  completed_at       timestamptz,
  last_seen_at       timestamptz,
  completion_percent numeric NOT NULL DEFAULT 0,
  UNIQUE (user_id, item_id),
  CHECK (completion_percent >= 0 AND completion_percent <= 100)
);

CREATE TABLE user_xp_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  amount      int NOT NULL,
  source_type text NOT NULL,
  source_id   uuid,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  achievement_key text NOT NULL,
  earned_at       timestamptz NOT NULL DEFAULT now(),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, achievement_key)
);

CREATE TABLE question_attempts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  question_id      uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer      text,
  is_correct       boolean,
  score            numeric,
  feedback         text,
  response_time_ms int,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_topics_section_id ON topics(section_id);
CREATE INDEX idx_items_topic_id ON items(topic_id);
CREATE INDEX idx_item_sources_item_id ON item_sources(item_id);
CREATE INDEX idx_questions_item_id ON questions(item_id);
CREATE INDEX idx_user_item_progress_user_id ON user_item_progress(user_id);
CREATE INDEX idx_user_xp_transactions_user_created ON user_xp_transactions(user_id, created_at DESC);

-- Trigger 1: normalize user_item_progress timestamps/status fields.
CREATE OR REPLACE FUNCTION sync_user_item_progress_fields()
RETURNS trigger AS $$
BEGIN
  NEW.last_seen_at := COALESCE(NEW.last_seen_at, now());

  IF NEW.status IN ('in_progress', 'completed') THEN
    NEW.started_at := COALESCE(NEW.started_at, now());
  END IF;

  IF NEW.status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    NEW.completion_percent := 100;
  ELSIF NEW.completion_percent = 100 THEN
    NEW.completion_percent := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_user_item_progress_fields
BEFORE INSERT OR UPDATE ON user_item_progress
FOR EACH ROW
EXECUTE FUNCTION sync_user_item_progress_fields();

-- Trigger 2: auto-award XP once when item first reaches completed state.
CREATE OR REPLACE FUNCTION award_xp_on_item_completion()
RETURNS trigger AS $$
DECLARE
  was_completed boolean := COALESCE(OLD.status = 'completed', false);
  is_completed boolean := NEW.status = 'completed';
BEGIN
  IF is_completed AND NOT was_completed THEN
    INSERT INTO user_xp_transactions (user_id, amount, source_type, source_id, reason)
    VALUES (NEW.user_id, 10, 'item_completion', NEW.item_id, 'Item completed');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_award_xp_on_item_completion
AFTER INSERT OR UPDATE ON user_item_progress
FOR EACH ROW
EXECUTE FUNCTION award_xp_on_item_completion();

ALTER TABLE sections             DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics               DISABLE ROW LEVEL SECURITY;
ALTER TABLE items                DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_sources         DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions            DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_item_progress   DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements    DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts    DISABLE ROW LEVEL SECURITY;
