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

CREATE TABLE question_options (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text  text NOT NULL,
  is_correct   boolean NOT NULL DEFAULT false,
  explanation  text,
  position     int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, position),
  CHECK (length(trim(option_text)) > 0)
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

CREATE TABLE user_progress (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL,
  item_id            uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  is_completed       boolean NOT NULL DEFAULT false,
  completed_at       timestamptz,
  completion_count   int NOT NULL DEFAULT 0 CHECK (completion_count >= 0),
  last_reviewed_at   timestamptz,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id),
  CHECK ((is_completed = false) OR (completed_at IS NOT NULL))
);

CREATE TABLE xp_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  item_id         uuid REFERENCES items(id) ON DELETE SET NULL,
  topic_id        uuid REFERENCES topics(id) ON DELETE SET NULL,
  section_id      uuid REFERENCES sections(id) ON DELETE SET NULL,
  event_type      text NOT NULL,
  xp_delta        int NOT NULL CHECK (xp_delta <> 0),
  reason          text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (event_type IN ('item_complete', 'topic_bonus', 'section_bonus', 'manual_adjustment'))
);

CREATE TABLE user_achievements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  achievement_key   text NOT NULL,
  title             text NOT NULL,
  scope_type        text NOT NULL CHECK (scope_type IN ('topic', 'section', 'global')),
  scope_id          uuid,
  earned_at         timestamptz NOT NULL DEFAULT now(),
  xp_awarded        int NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  UNIQUE (user_id, achievement_key)
);

CREATE TABLE question_attempts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  question_id       uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct        boolean NOT NULL,
  response_time_ms  int CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
  attempted_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE study_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL,
  section_id          uuid REFERENCES sections(id) ON DELETE SET NULL,
  topic_id            uuid REFERENCES topics(id) ON DELETE SET NULL,
  started_at          timestamptz NOT NULL DEFAULT now(),
  ended_at            timestamptz,
  duration_seconds    int GENERATED ALWAYS AS (
    CASE WHEN ended_at IS NULL THEN NULL ELSE GREATEST(0, EXTRACT(EPOCH FROM (ended_at - started_at))::int) END
  ) STORED,
  items_completed     int NOT NULL DEFAULT 0 CHECK (items_completed >= 0),
  questions_answered  int NOT NULL DEFAULT 0 CHECK (questions_answered >= 0),
  xp_earned           int NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_items_topic_id ON items(topic_id);
CREATE INDEX idx_topics_section_id ON topics(section_id);
CREATE INDEX idx_questions_item_id ON questions(item_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_user_completed ON user_progress(user_id, is_completed);
CREATE INDEX idx_xp_log_user_created_at ON xp_log(user_id, created_at DESC);
CREATE INDEX idx_xp_log_user_event_type ON xp_log(user_id, event_type);
CREATE INDEX idx_user_achievements_user_scope ON user_achievements(user_id, scope_type);
CREATE INDEX idx_question_attempts_user_question ON question_attempts(user_id, question_id);
CREATE INDEX idx_study_sessions_user_started_at ON study_sessions(user_id, started_at DESC);

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

CREATE OR REPLACE FUNCTION complete_item(
  p_user_id uuid,
  p_item_id uuid,
  p_completed_at timestamptz DEFAULT now(),
  p_base_xp int DEFAULT 10,
  p_topic_bonus_xp int DEFAULT 50,
  p_section_bonus_xp int DEFAULT 150
)
RETURNS TABLE (
  xp_awarded int,
  total_xp int,
  topic_completed boolean,
  section_completed boolean
) AS $$
DECLARE
  v_topic_id uuid;
  v_section_id uuid;
  v_progress_was_completed boolean := false;
  v_topic_done boolean := false;
  v_section_done boolean := false;
  v_topic_bonus_applied boolean := false;
  v_section_bonus_applied boolean := false;
  v_rows_affected int := 0;
  v_today date := (p_completed_at AT TIME ZONE 'UTC')::date;
BEGIN
  IF p_base_xp <= 0 OR p_topic_bonus_xp < 0 OR p_section_bonus_xp < 0 THEN
    RAISE EXCEPTION 'XP values must be non-negative and base XP must be > 0';
  END IF;

  SELECT t.id, t.section_id
    INTO v_topic_id, v_section_id
  FROM items i
  JOIN topics t ON t.id = i.topic_id
  WHERE i.id = p_item_id;

  IF v_topic_id IS NULL THEN
    RAISE EXCEPTION 'Item % not found', p_item_id;
  END IF;

  SELECT is_completed INTO v_progress_was_completed
  FROM user_progress
  WHERE user_id = p_user_id AND item_id = p_item_id;

  IF COALESCE(v_progress_was_completed, false) THEN
    RETURN QUERY
    SELECT 0,
           COALESCE((SELECT SUM(xp_delta)::int FROM xp_log WHERE user_id = p_user_id), 0),
           false,
           false;
    RETURN;
  END IF;

  INSERT INTO user_progress (user_id, item_id, is_completed, completed_at, completion_count, last_reviewed_at, updated_at)
  VALUES (p_user_id, p_item_id, true, p_completed_at, 1, p_completed_at, now())
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET
    is_completed = true,
    completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
    completion_count = user_progress.completion_count + 1,
    last_reviewed_at = EXCLUDED.last_reviewed_at,
    updated_at = now();

  INSERT INTO xp_log (user_id, item_id, topic_id, section_id, event_type, xp_delta, reason)
  VALUES (p_user_id, p_item_id, v_topic_id, v_section_id, 'item_complete', p_base_xp, 'Item completion XP');

  PERFORM increment_activity(p_user_id, p_item_id, v_today);

  SELECT NOT EXISTS (
    SELECT 1
    FROM items i
    LEFT JOIN user_progress up
      ON up.item_id = i.id
      AND up.user_id = p_user_id
      AND up.is_completed = true
    WHERE i.topic_id = v_topic_id
      AND up.id IS NULL
  ) INTO v_topic_done;

  IF v_topic_done THEN
    INSERT INTO user_achievements (user_id, achievement_key, title, scope_type, scope_id, xp_awarded)
    VALUES (p_user_id, 'topic:' || v_topic_id::text, 'Topic completed', 'topic', v_topic_id, p_topic_bonus_xp)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    v_topic_bonus_applied := v_rows_affected > 0;

    IF v_topic_bonus_applied THEN
      INSERT INTO xp_log (user_id, topic_id, section_id, event_type, xp_delta, reason)
      VALUES (p_user_id, v_topic_id, v_section_id, 'topic_bonus', p_topic_bonus_xp, 'Topic completion bonus');
    END IF;
  END IF;

  SELECT NOT EXISTS (
    SELECT 1
    FROM items i
    JOIN topics t ON t.id = i.topic_id
    LEFT JOIN user_progress up
      ON up.item_id = i.id
      AND up.user_id = p_user_id
      AND up.is_completed = true
    WHERE t.section_id = v_section_id
      AND up.id IS NULL
  ) INTO v_section_done;

  IF v_section_done THEN
    INSERT INTO user_achievements (user_id, achievement_key, title, scope_type, scope_id, xp_awarded)
    VALUES (p_user_id, 'section:' || v_section_id::text, 'Section completed', 'section', v_section_id, p_section_bonus_xp)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    v_section_bonus_applied := v_rows_affected > 0;

    IF v_section_bonus_applied THEN
      INSERT INTO xp_log (user_id, section_id, event_type, xp_delta, reason)
      VALUES (p_user_id, v_section_id, 'section_bonus', p_section_bonus_xp, 'Section completion bonus');
    END IF;
  END IF;

  RETURN QUERY
  SELECT (
      p_base_xp
      + CASE WHEN v_topic_bonus_applied THEN p_topic_bonus_xp ELSE 0 END
      + CASE WHEN v_section_bonus_applied THEN p_section_bonus_xp ELSE 0 END
    )::int,
    COALESCE((SELECT SUM(xp_delta)::int FROM xp_log WHERE user_id = p_user_id), 0),
    v_topic_done,
    v_section_done;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW progress_analytics_by_direction AS
SELECT
  s.id AS section_id,
  s.title AS section_title,
  up.user_id,
  COUNT(i.id)::int AS total_items,
  COUNT(i.id) FILTER (WHERE up.is_completed)::int AS completed_items,
  COALESCE(ROUND((COUNT(i.id) FILTER (WHERE up.is_completed)::numeric / NULLIF(COUNT(i.id), 0)::numeric) * 100, 2), 0) AS completion_percent,
  COALESCE(SUM(xl.xp_delta), 0)::int AS xp_total
FROM sections s
JOIN topics t ON t.section_id = s.id
JOIN items i ON i.topic_id = t.id
LEFT JOIN user_progress up ON up.item_id = i.id
LEFT JOIN xp_log xl ON xl.user_id = up.user_id AND xl.section_id = s.id
GROUP BY s.id, s.title, up.user_id;

CREATE OR REPLACE VIEW progress_analytics_by_topic AS
SELECT
  t.id AS topic_id,
  t.title AS topic_title,
  t.section_id,
  up.user_id,
  COUNT(i.id)::int AS total_items,
  COUNT(i.id) FILTER (WHERE up.is_completed)::int AS completed_items,
  COALESCE(ROUND((COUNT(i.id) FILTER (WHERE up.is_completed)::numeric / NULLIF(COUNT(i.id), 0)::numeric) * 100, 2), 0) AS completion_percent,
  COALESCE(SUM(xl.xp_delta), 0)::int AS xp_total
FROM topics t
JOIN items i ON i.topic_id = t.id
LEFT JOIN user_progress up ON up.item_id = i.id
LEFT JOIN xp_log xl ON xl.user_id = up.user_id AND xl.topic_id = t.id
GROUP BY t.id, t.title, t.section_id, up.user_id;

CREATE OR REPLACE VIEW progress_analytics_by_day AS
SELECT
  al.user_id,
  al.date,
  al.items_done,
  COALESCE(SUM(xl.xp_delta), 0)::int AS xp_earned,
  COUNT(DISTINCT qa.id)::int AS questions_answered,
  COALESCE(SUM(ss.duration_seconds), 0)::int AS study_seconds
FROM activity_log al
LEFT JOIN xp_log xl ON xl.user_id = al.user_id AND xl.created_at::date = al.date
LEFT JOIN question_attempts qa ON qa.user_id = al.user_id AND qa.attempted_at::date = al.date
LEFT JOIN study_sessions ss ON ss.user_id = al.user_id AND ss.started_at::date = al.date
GROUP BY al.user_id, al.date, al.items_done;

ALTER TABLE sections           DISABLE ROW LEVEL SECURITY;
ALTER TABLE topics             DISABLE ROW LEVEL SECURITY;
ALTER TABLE items              DISABLE ROW LEVEL SECURITY;
ALTER TABLE sources            DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions          DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options   DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log       DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_completions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress      DISABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log             DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements  DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts  DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions     DISABLE ROW LEVEL SECURITY;
