-- Seed data for Learning System v2
WITH sec1 AS (
  INSERT INTO sections (title, description, position) VALUES ('SCADA / Протоколы', 'Промышленные протоколы и интеграции', 0) RETURNING id
), top1 AS (
  INSERT INTO topics (section_id, title, description, position)
  SELECT id, 'MQTT основы', 'База pub/sub', 0 FROM sec1 RETURNING id
), it1 AS (
  INSERT INTO items (topic_id, title, position)
  SELECT id, 'pub/sub модель, топики, wildcards (#, +)', 0 FROM top1 RETURNING id
), it2 AS (
  INSERT INTO items (topic_id, title, position)
  SELECT id, 'QoS 0/1/2 и гарантия доставки', 1 FROM top1 RETURNING id
), it3 AS (
  INSERT INTO items (topic_id, title, position)
  SELECT id, 'retained и last will message', 2 FROM top1 RETURNING id
)
INSERT INTO sources (item_id, label, url, kind)
SELECT id, 'MQTT Essentials - HiveMQ', 'https://www.hivemq.com/mqtt-essentials/', 'article' FROM it1;

WITH sec1 AS (SELECT id FROM sections WHERE title = 'SCADA / Протоколы'), top2 AS (
  INSERT INTO topics (section_id, title, description, position)
  SELECT id, 'OPC UA', 'Адресное пространство и безопасность', 1 FROM sec1 RETURNING id
), it1 AS (
  INSERT INTO items (topic_id, title, position) SELECT id, 'модель информации и namespace', 0 FROM top2 RETURNING id
), it2 AS (
  INSERT INTO items (topic_id, title, position) SELECT id, 'сертификаты и security policies', 1 FROM top2 RETURNING id
), it3 AS (
  INSERT INTO items (topic_id, title, position) SELECT id, 'подписки и monitored items', 2 FROM top2 RETURNING id
)
INSERT INTO questions (item_id, text, position)
SELECT id, 'Чем security policy Basic256Sha256 лучше Basic128?', 0 FROM it2;

WITH sec2 AS (
  INSERT INTO sections (title, description, position) VALUES ('Прогнозирование', 'Временные ряды и quality данных', 1) RETURNING id
), top1 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Фичи временных рядов', 'Lag и rolling статистики', 0 FROM sec2 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'lag feature engineering', 0 FROM top1 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'rolling mean/std windows', 1 FROM top1 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'обработка пропусков', 2 FROM top1 RETURNING id)
INSERT INTO questions (item_id, text, position)
SELECT id, 'Как выбрать длину окна без leakage?', 0 FROM it2;

WITH sec2 AS (SELECT id FROM sections WHERE title='Прогнозирование'), top2 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Оценка моделей', 'Бэктест и метрики', 1 FROM sec2 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'walk-forward validation', 0 FROM top2 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'MAE/RMSE/MAPE', 1 FROM top2 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'доверительные интервалы', 2 FROM top2 RETURNING id)
INSERT INTO sources (item_id, label, url, kind)
SELECT id, 'Forecasting Principles and Practice', 'https://otexts.com/fpp3/', 'doc' FROM it1;

WITH sec3 AS (
  INSERT INTO sections (title, description, position) VALUES ('AI / ML', 'ML pipeline для продакшена', 2) RETURNING id
), top1 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Классический ML', 'Baseline модели и тюнинг', 0 FROM sec3 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'LogReg / RF baseline', 0 FROM top1 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'feature importance', 1 FROM top1 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'cross-validation', 2 FROM top1 RETURNING id)
INSERT INTO questions (item_id, text, position)
SELECT id, 'Когда baseline уже достаточно для бизнеса?', 0 FROM it1;

WITH sec3 AS (SELECT id FROM sections WHERE title='AI / ML'), top2 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'MLOps основы', 'Доставка моделей', 1 FROM sec3 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'версионирование моделей', 0 FROM top2 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'мониторинг дрейфа', 1 FROM top2 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'A/B тестирование моделей', 2 FROM top2 RETURNING id)
INSERT INTO sources (item_id, label, url, kind)
SELECT id, 'Google MLOps level 1', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'article' FROM it1;

WITH sec4 AS (
  INSERT INTO sections (title, description, position) VALUES ('Архитектура систем', 'Надежные распределенные системы', 3) RETURNING id
), top1 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Событийная архитектура', 'Event-driven patterns', 0 FROM sec4 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'at-least-once delivery и идемпотентность', 0 FROM top1 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'outbox/inbox pattern', 1 FROM top1 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'saga orchestration', 2 FROM top1 RETURNING id)
INSERT INTO questions (item_id, text, position)
SELECT id, 'Когда выбрать choreography вместо orchestration?', 0 FROM it3;

WITH sec4 AS (SELECT id FROM sections WHERE title='Архитектура систем'), top2 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Наблюдаемость', 'Logs, metrics, traces', 1 FROM sec4 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'SLI/SLO/SLA', 0 FROM top2 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'алертинг по ошибкам и latency', 1 FROM top2 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'distributed tracing', 2 FROM top2 RETURNING id)
INSERT INTO sources (item_id, label, url, kind)
SELECT id, 'Site Reliability Workbook', 'https://sre.google/workbook/table-of-contents/', 'doc' FROM it1;

WITH sec5 AS (
  INSERT INTO sections (title, description, position) VALUES ('Электротехника', 'Практика по электротехнике для автоматизации', 4) RETURNING id
), top1 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Основы цепей', 'DC/AC и законы Кирхгофа', 0 FROM sec5 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'закон Ома и мощность', 0 FROM top1 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'последовательные и параллельные цепи', 1 FROM top1 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'законы Кирхгофа', 2 FROM top1 RETURNING id)
INSERT INTO questions (item_id, text, position)
SELECT id, 'Как проверить баланс мощностей в узле?', 0 FROM it3;

WITH sec5 AS (SELECT id FROM sections WHERE title='Электротехника'), top2 AS (
  INSERT INTO topics (section_id, title, description, position) SELECT id, 'Приводы и двигатели', 'Инверторы и режимы', 1 FROM sec5 RETURNING id
), it1 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'асинхронный двигатель: пуск и торможение', 0 FROM top2 RETURNING id),
 it2 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'частотный преобразователь', 1 FROM top2 RETURNING id),
 it3 AS (INSERT INTO items (topic_id, title, position) SELECT id, 'защита и диагностика', 2 FROM top2 RETURNING id)
INSERT INTO sources (item_id, label, url, kind)
SELECT id, 'VFD basics', 'https://www.youtube.com/watch?v=4fA4h7V8k7s', 'youtube' FROM it2;
