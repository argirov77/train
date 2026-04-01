-- Comprehensive seed for the 12-week Energy/SCADA/Telemetry/Forecasting curriculum
-- Run after supabase/schema.sql

BEGIN;

-- Safe re-run: clean learning content while keeping schema
TRUNCATE TABLE item_sources, questions, items, topics, sections RESTART IDENTITY CASCADE;

WITH sections_seed(position, title, description) AS (
  VALUES
    (0,  'Week 1 · Foundations', 'Environment setup, telemetry schema, MQTT basics, kW vs kWh'),
    (1,  'Week 2 · MQTT Deep Dive', 'QoS, retained, session expiry, persistence behavior'),
    (2,  'Week 3 · Telemetry Quality & Time', 'Normalizer, quality flags, UTC/DST correctness'),
    (3,  'Week 4 · Time-Series Storage', 'Influx schema, deduplication, late data, retention'),
    (4,  'Week 5 · Modbus Polling', 'Modbus model, poller reliability, register mapping'),
    (5,  'Week 6 · IEC-104 Basics', 'GI flow, ASDU/CA/IOA/COT mapping'),
    (6,  'Week 7 · IEC-104 Advanced', 'Spontaneous updates, CP56Time2a, quality descriptors'),
    (7,  'Week 8 · Electrical Power Applied', 'P/Q/S, PF, 3-phase formulas, inverter behavior'),
    (8,  'Week 9 · Forecast Training', 'Baseline + ML model training and evaluation'),
    (9,  'Week 10 · Forecast API + Monitoring', 'Serving forecasts, metrics, retraining operations'),
    (10, 'Week 11 · Anomaly + RAG', 'Anomaly detection and doc-grounded operational assistant'),
    (11, 'Week 12 · Integration + Demo', 'E2E tests, acceptance checklist, reliability'),
    (12, 'Capstone Milestones', 'Definition of done and milestone-driven delivery'),
    (13, 'Interview Simulation', 'Cross-domain assessment tasks for hiring readiness'),
    (14, 'High-Frequency Question Bank', 'Fast recurring interview questions across stack')
), ins_sections AS (
  INSERT INTO sections (title, description, position)
  SELECT title, description, position
  FROM sections_seed
  RETURNING id, title
), topics_seed(section_title, position, title, description) AS (
  VALUES
    ('Week 1 · Foundations', 0, 'W1 Theory & Objectives', 'MQTT intro, units, telemetry contract'),
    ('Week 1 · Foundations', 1, 'W1 Labs & Deliverables', 'Compose skeleton + MQTT pub/sub + schema artifact'),

    ('Week 2 · MQTT Deep Dive', 0, 'W2 Theory & Objectives', 'QoS guarantees, retained semantics, session behavior'),
    ('Week 2 · MQTT Deep Dive', 1, 'W2 Labs & Deliverables', 'Mosquitto persistence + QoS/retained/session tests'),

    ('Week 3 · Telemetry Quality & Time', 0, 'W3 Theory & Objectives', 'Historian patterns, quality states, timezone handling'),
    ('Week 3 · Telemetry Quality & Time', 1, 'W3 Labs & Deliverables', 'Normalizer + DST tests + derived kW from kWh'),

    ('Week 4 · Time-Series Storage', 0, 'W4 Theory & Objectives', 'Tag vs field, duplicate semantics, downsampling strategy'),
    ('Week 4 · Time-Series Storage', 1, 'W4 Labs & Deliverables', 'Pinned Influx, writer, idempotent replay checks'),

    ('Week 5 · Modbus Polling', 0, 'W5 Theory & Objectives', 'Function codes, polling tradeoffs, resilience patterns'),
    ('Week 5 · Modbus Polling', 1, 'W5 Labs & Deliverables', 'Simulator + poller + retry/backoff + metadata'),

    ('Week 6 · IEC-104 Basics', 0, 'W6 Theory & Objectives', 'ASDU/COT/CA/IOA and GI vs spontaneous'),
    ('Week 6 · IEC-104 Basics', 1, 'W6 Labs & Deliverables', 'IEC-104 sim/client + GI + metadata persistence'),

    ('Week 7 · IEC-104 Advanced', 0, 'W7 Theory & Objectives', 'CP56 timestamps and QDS mapping rules'),
    ('Week 7 · IEC-104 Advanced', 1, 'W7 Labs & Deliverables', 'Spontaneous stream + quality propagation to API'),

    ('Week 8 · Electrical Power Applied', 0, 'W8 Theory & Objectives', 'P/Q/S interpretation, PF impact, 3-phase equations'),
    ('Week 8 · Electrical Power Applied', 1, 'W8 Labs & Deliverables', 'Derived power module + fixtures + unit tests'),

    ('Week 9 · Forecast Training', 0, 'W9 Theory & Objectives', 'Persistence baseline, leakage avoidance, metrics'),
    ('Week 9 · Forecast Training', 1, 'W9 Labs & Deliverables', 'Training pipeline + model artifacts + reports'),

    ('Week 10 · Forecast API + Monitoring', 0, 'W10 Theory & Objectives', 'Serving contracts, monitoring KPIs, lifecycle ops'),
    ('Week 10 · Forecast API + Monitoring', 1, 'W10 Labs & Deliverables', 'Forecast endpoint + Prometheus + Grafana'),

    ('Week 11 · Anomaly + RAG', 0, 'W11 Theory & Objectives', 'IsolationForest, fault patterns, grounded answers'),
    ('Week 11 · Anomaly + RAG', 1, 'W11 Labs & Deliverables', 'Anomaly endpoint + ask-docs with citations'),

    ('Week 12 · Integration + Demo', 0, 'W12 Theory & Objectives', 'Integration testing and acceptance methodology'),
    ('Week 12 · Integration + Demo', 1, 'W12 Labs & Deliverables', 'E2E tests + demo script + resilience validation'),

    ('Capstone Milestones', 0, 'Milestones Table', 'Objective criteria by week and deliverable gate'),
    ('Capstone Milestones', 1, 'Final Acceptance Checklist', 'Operational go-live checklist for capstone'),

    ('Interview Simulation', 0, 'Assessment Tasks A-E', 'Protocol, pipeline, power, forecasting, incident debugging'),
    ('High-Frequency Question Bank', 0, 'Quick Interview Questions', 'Short high-frequency prompts across domains')
), ins_topics AS (
  INSERT INTO topics (section_id, title, description, position)
  SELECT s.id, t.title, t.description, t.position
  FROM topics_seed t
  JOIN ins_sections s ON s.title = t.section_title
  RETURNING id, title
), items_seed(topic_title, position, title) AS (
  VALUES
    -- W1
    ('W1 Theory & Objectives', 0, 'W1: Explain difference between power (kW) and energy (kWh)'),
    ('W1 Theory & Objectives', 1, 'W1: Define telemetry tag model: site/device/signal/value/unit/quality/timestamp'),
    ('W1 Theory & Objectives', 2, 'W1: Confirm baseline stack: Python 3.11+, Docker Compose, Mosquitto'),
    ('W1 Labs & Deliverables', 0, 'W1: Create repo skeleton energy-telemetry-lab/{infra,services}'),
    ('W1 Labs & Deliverables', 1, 'W1: Run mosquitto_sub and mosquitto_pub smoke test'),
    ('W1 Labs & Deliverables', 2, 'W1: Produce schemas/telemetry_event.json contract'),
    ('W1 Labs & Deliverables', 3, 'W1: README runbook with <=15 minute bootstrap steps'),

    -- W2
    ('W2 Theory & Objectives', 0, 'W2: Compare QoS0 vs QoS1 vs QoS2 delivery semantics'),
    ('W2 Theory & Objectives', 1, 'W2: Explain retained messages and state-management risks'),
    ('W2 Theory & Objectives', 2, 'W2: Explain clean start/session expiry and offline queueing'),
    ('W2 Labs & Deliverables', 0, 'W2: Enable Mosquitto persistence and autosave interval'),
    ('W2 Labs & Deliverables', 1, 'W2: Build qos_matrix test for QoS0 loss and QoS1 redelivery'),
    ('W2 Labs & Deliverables', 2, 'W2: Validate retained publish and first-subscribe instant receive'),
    ('W2 Labs & Deliverables', 3, 'W2: Document topic taxonomy site/{id}/device/{id}/telemetry/{signal}'),

    -- W3
    ('W3 Theory & Objectives', 0, 'W3: Explain stale vs true-zero sensor interpretation'),
    ('W3 Theory & Objectives', 1, 'W3: Define quality states: good/invalid/weak/stale/substituted'),
    ('W3 Theory & Objectives', 2, 'W3: Explain tz_localize vs tz_convert and DST failures'),
    ('W3 Labs & Deliverables', 0, 'W3: Implement normalizer to canonical telemetry record'),
    ('W3 Labs & Deliverables', 1, 'W3: Convert meter delta kWh to interval kW safely'),
    ('W3 Labs & Deliverables', 2, 'W3: Add UTC enforcement with explicit timezone unit tests'),
    ('W3 Labs & Deliverables', 3, 'W3: Persist raw + derived series with quality labels'),

    -- W4
    ('W4 Theory & Objectives', 0, 'W4: Explain Influx uniqueness (measurement+tags+timestamp)'),
    ('W4 Theory & Objectives', 1, 'W4: Explain field merge behavior on duplicate points'),
    ('W4 Theory & Objectives', 2, 'W4: Explain retention/downsampling and late-arrival strategy'),
    ('W4 Labs & Deliverables', 0, 'W4: Pin Influx Docker image (e.g., influxdb:2.8)'),
    ('W4 Labs & Deliverables', 1, 'W4: Implement influx_writer with batched writes'),
    ('W4 Labs & Deliverables', 2, 'W4: Create schema mapping doc for measurement/tags/fields'),
    ('W4 Labs & Deliverables', 3, 'W4: Replay same batch twice and prove no double counting'),

    -- W5
    ('W5 Theory & Objectives', 0, 'W5: Explain Modbus coils/register model and function codes'),
    ('W5 Theory & Objectives', 1, 'W5: Compare polling vs report-by-exception tradeoffs'),
    ('W5 Theory & Objectives', 2, 'W5: Explain retry/backoff impacts on downstream duplicates'),
    ('W5 Labs & Deliverables', 0, 'W5: Launch modbus simulator server and polling client'),
    ('W5 Labs & Deliverables', 1, 'W5: Map register addresses to canonical signals/units'),
    ('W5 Labs & Deliverables', 2, 'W5: Persist poll_latency_ms, poll_success, last_success_ts'),
    ('W5 Labs & Deliverables', 3, 'W5: Survive simulated transient outage with bounded retries'),

    -- W6
    ('W6 Theory & Objectives', 0, 'W6: Explain CA vs IOA vs COT roles in IEC-104 mapping'),
    ('W6 Theory & Objectives', 1, 'W6: Explain GI flow and expected point population behavior'),
    ('W6 Theory & Objectives', 2, 'W6: Explain spontaneous vs cyclic transmission modes'),
    ('W6 Labs & Deliverables', 0, 'W6: Start IEC-104 simulator with sample point list'),
    ('W6 Labs & Deliverables', 1, 'W6: Implement controlling station client connect sequence'),
    ('W6 Labs & Deliverables', 2, 'W6: Trigger General Interrogation and ingest resulting points'),
    ('W6 Labs & Deliverables', 3, 'W6: Persist cot/common_address/ioa metadata fields'),

    -- W7
    ('W7 Theory & Objectives', 0, 'W7: Explain CP56Time2a timestamp usage and UTC conversion'),
    ('W7 Theory & Objectives', 1, 'W7: Explain QDS invalid/not topical/overflow semantics'),
    ('W7 Theory & Objectives', 2, 'W7: Define weak-data policy for analytics and forecasting'),
    ('W7 Labs & Deliverables', 0, 'W7: Enable spontaneous event stream in IEC-104 simulator'),
    ('W7 Labs & Deliverables', 1, 'W7: Parse and persist ts_cp56 and qds_raw'),
    ('W7 Labs & Deliverables', 2, 'W7: Map QDS bits to internal quality and API payloads'),
    ('W7 Labs & Deliverables', 3, 'W7: Demonstrate invalid quality propagation end-to-end'),

    -- W8
    ('W8 Theory & Objectives', 0, 'W8: Compute S = sqrt(P^2 + Q^2) and PF = P/S'),
    ('W8 Theory & Objectives', 1, 'W8: Explain Q sign conventions and operational interpretation'),
    ('W8 Theory & Objectives', 2, 'W8: Explain 3-phase approximation P≈sqrt(3)*V_L*I_L*PF'),
    ('W8 Labs & Deliverables', 0, 'W8: Build derived_power module with tolerance-tested fixtures'),
    ('W8 Labs & Deliverables', 1, 'W8: Convert cumulative kWh streams to interval power traces'),
    ('W8 Labs & Deliverables', 2, 'W8: Show PF impact: equal kW, different kVA scenario'),
    ('W8 Labs & Deliverables', 3, 'W8: Add transformer/inverter efficiency placeholder series'),

    -- W9
    ('W9 Theory & Objectives', 0, 'W9: Define persistence baseline and why it is mandatory'),
    ('W9 Theory & Objectives', 1, 'W9: Explain leakage-safe time-series split strategy'),
    ('W9 Theory & Objectives', 2, 'W9: Explain MAE/RMSE tradeoffs and horizon-based reporting'),
    ('W9 Labs & Deliverables', 0, 'W9: Train baseline model and save benchmark metrics'),
    ('W9 Labs & Deliverables', 1, 'W9: Train improved model with weather + lag features'),
    ('W9 Labs & Deliverables', 2, 'W9: Save artifacts with model_version, trained_at, features_used'),
    ('W9 Labs & Deliverables', 3, 'W9: Prove improved MAE beats persistence on validation split'),

    -- W10
    ('W10 Theory & Objectives', 0, 'W10: Define forecast API contract and deterministic response schema'),
    ('W10 Theory & Objectives', 1, 'W10: Define monitoring KPIs: latency, error, freshness, request volume'),
    ('W10 Theory & Objectives', 2, 'W10: Explain model rollback and retraining trigger policy'),
    ('W10 Labs & Deliverables', 0, 'W10: Implement GET /forecast with horizon 1h-24h'),
    ('W10 Labs & Deliverables', 1, 'W10: Export Prometheus metrics for forecast service'),
    ('W10 Labs & Deliverables', 2, 'W10: Build Grafana dashboard with forecast-vs-actual panel'),
    ('W10 Labs & Deliverables', 3, 'W10: Expose metadata fields model_version/trained_at/features_used'),

    -- W11
    ('W11 Theory & Objectives', 0, 'W11: Explain anomaly classes: missing, stuck-at, outlier'),
    ('W11 Theory & Objectives', 1, 'W11: Explain IsolationForest assumptions and limitations'),
    ('W11 Theory & Objectives', 2, 'W11: Explain RAG grounded-answer requirements for operations'),
    ('W11 Labs & Deliverables', 0, 'W11: Implement anomaly detector on power residuals and freshness'),
    ('W11 Labs & Deliverables', 1, 'W11: Implement GET /anomalies with site and window filters'),
    ('W11 Labs & Deliverables', 2, 'W11: Implement POST /ask-docs returning answer + sources[]'),
    ('W11 Labs & Deliverables', 3, 'W11: Inject synthetic faults and verify anomaly surfacing'),

    -- W12
    ('W12 Theory & Objectives', 0, 'W12: Explain end-to-end acceptance strategy and reliability gates'),
    ('W12 Theory & Objectives', 1, 'W12: Explain idempotency boundaries for 10k-device scale'),
    ('W12 Theory & Objectives', 2, 'W12: Explain retry pattern risks during prolonged outages'),
    ('W12 Labs & Deliverables', 0, 'W12: Write e2e tests for compose + simulators + DB/API asserts'),
    ('W12 Labs & Deliverables', 1, 'W12: Create one-command scripts/demo.sh runbook'),
    ('W12 Labs & Deliverables', 2, 'W12: Validate UTC storage and local-time rendering at query layer'),
    ('W12 Labs & Deliverables', 3, 'W12: Validate retries do not inflate totals under duplicate deliveries'),

    -- Capstone milestones
    ('Milestones Table', 0, 'M1: Repo + compose skeleton ready by Week 1'),
    ('Milestones Table', 1, 'M2: MQTT simulator stable by Week 2'),
    ('Milestones Table', 2, 'M3: Normalized schema and timezone tests by Week 3'),
    ('Milestones Table', 3, 'M4: TSDB + dedup/idempotency proof by Week 4'),
    ('Milestones Table', 4, 'M5: Modbus worker outage tolerance by Week 5'),
    ('Milestones Table', 5, 'M6: IEC-104 GI ingestion by Week 6'),
    ('Milestones Table', 6, 'M7: IEC-104 spontaneous + QDS by Week 7'),
    ('Milestones Table', 7, 'M8: Derived power computations by Week 8'),
    ('Milestones Table', 8, 'M9: Forecast training improvement by Week 9'),
    ('Milestones Table', 9, 'M10: Forecast API + observability by Week 10'),
    ('Milestones Table', 10, 'M11: Anomalies + RAG with sources by Week 11'),
    ('Milestones Table', 11, 'M12: One-command E2E demo by Week 12'),

    ('Final Acceptance Checklist', 0, 'AC1: MQTT end-to-end latency <= 2 seconds'),
    ('Final Acceptance Checklist', 1, 'AC2: IEC-104 GI + spontaneous updates both visible in DB'),
    ('Final Acceptance Checklist', 2, 'AC3: invalid/not topical quality states propagate to API'),
    ('Final Acceptance Checklist', 3, 'AC4: all timestamps stored in UTC'),
    ('Final Acceptance Checklist', 4, 'AC5: /forecast returns model_version and trained_at'),
    ('Final Acceptance Checklist', 5, 'AC6: Prometheus metrics non-empty and Grafana panels render'),
    ('Final Acceptance Checklist', 6, 'AC7: retries/backoff enabled and duplicate-safe ingestion proven'),

    -- Assessment tasks and question bank
    ('Assessment Tasks A-E', 0, 'Task A: Map IEC-104 points (CA/IOA/COT/QDS) into canonical telemetry model'),
    ('Assessment Tasks A-E', 1, 'Task B: Design QoS1 ingestion for 5,000 devices with idempotency boundaries'),
    ('Assessment Tasks A-E', 2, 'Task C: Compute PF and S from V/I/P/Q and explain low-PF operational impact'),
    ('Assessment Tasks A-E', 3, 'Task D: Compare baseline vs improved forecast and justify feature set'),
    ('Assessment Tasks A-E', 4, 'Task E: Run incident debug for forecast degradation root causes'),

    ('Quick Interview Questions', 0, 'QBank: MQTT retained messages and misuse risks'),
    ('Quick Interview Questions', 1, 'QBank: What Mosquitto persistence stores and tradeoffs'),
    ('Quick Interview Questions', 2, 'QBank: Influx point uniqueness and duplicate merge behavior'),
    ('Quick Interview Questions', 3, 'QBank: IEC-104 GI vs spontaneous transfer'),
    ('Quick Interview Questions', 4, 'QBank: Historian role in SCADA architecture'),
    ('Quick Interview Questions', 5, 'QBank: P/Q/S/PF practical interpretation'),
    ('Quick Interview Questions', 6, 'QBank: Inverter clipping signature in telemetry'),
    ('Quick Interview Questions', 7, 'QBank: When retries worsen failures and mitigations'),
    ('Quick Interview Questions', 8, 'QBank: RAG failure modes in operations')
), ins_items AS (
  INSERT INTO items (topic_id, title, position)
  SELECT t.id, i.title, i.position
  FROM items_seed i
  JOIN ins_topics t ON t.title = i.topic_title
  RETURNING id, title
), questions_seed(item_title, position, text) AS (
  VALUES
    ('W1: Explain difference between power (kW) and energy (kWh)', 0, 'Почему счёт за электричество выставляется в kWh, а не в kW?'),
    ('W2: Compare QoS0 vs QoS1 vs QoS2 delivery semantics', 0, 'Какие типы дубликатов вы ожидаете при QoS1/QoS2?'),
    ('W3: Explain tz_localize vs tz_convert and DST failures', 0, 'Как проверить, что DST не ломает агрегаты по часу?'),
    ('W4: Explain Influx uniqueness (measurement+tags+timestamp)', 0, 'Где именно обеспечивать идемпотентность: клиент, ingest или БД?'),
    ('W5: Compare polling vs report-by-exception tradeoffs', 0, 'Когда polling проигрывает report-by-exception?'),
    ('W6: Explain CA vs IOA vs COT roles in IEC-104 mapping', 0, 'Какие поля обязательны для трассировки IEC-104 события?'),
    ('W7: Explain QDS invalid/not topical/overflow semantics', 0, 'Какое поведение у API при invalid качестве точки?'),
    ('W8: Compute S = sqrt(P^2 + Q^2) and PF = P/S', 0, 'Почему при одинаковом kW может расти нагрузка по kVA?'),
    ('W9: Define persistence baseline and why it is mandatory', 0, 'Как доказать, что улучшенная модель реально полезнее baseline?'),
    ('W10: Define monitoring KPIs: latency, error, freshness, request volume', 0, 'Какие KPI прогноза вы мониторите в проде ежедневно?'),
    ('W11: Explain RAG grounded-answer requirements for operations', 0, 'Почему ответы без источников опасны для инженера в эксплуатации?'),
    ('W12: Explain idempotency boundaries for 10k-device scale', 0, 'Как построить ingestion без двойного учёта при сетевых сбоях?')
)
INSERT INTO questions (item_id, text, position)
SELECT i.id, q.text, q.position
FROM questions_seed q
JOIN ins_items i ON i.title = q.item_title;

WITH sources_seed(item_title, label, url, kind) AS (
  VALUES
    ('W1: Confirm baseline stack: Python 3.11+, Docker Compose, Mosquitto', 'Docker Compose Specification', 'https://compose-spec.io/', 'spec'),
    ('W1: Run mosquitto_sub and mosquitto_pub smoke test', 'Mosquitto CLI tools', 'https://mosquitto.org/man/', 'docs'),
    ('W2: Compare QoS0 vs QoS1 vs QoS2 delivery semantics', 'MQTT v5.0 OASIS Standard', 'https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html', 'standard'),
    ('W2: Enable Mosquitto persistence and autosave interval', 'mosquitto.conf reference', 'https://mosquitto.org/man/mosquitto-conf-5.html', 'docs'),
    ('W3: Explain tz_localize vs tz_convert and DST failures', 'pandas timezone handling', 'https://pandas.pydata.org/docs/user_guide/timeseries.html#time-zone-handling', 'docs'),
    ('W3: Explain stale vs true-zero sensor interpretation', 'NIST ICS guidance (historian context)', 'https://csrc.nist.gov/pubs/sp/800/82/r2/final', 'guidance'),
    ('W4: Pin Influx Docker image (e.g., influxdb:2.8)', 'InfluxDB Docker docs', 'https://docs.influxdata.com/influxdb/v2/install/use-docker-compose/', 'docs'),
    ('W4: Explain field merge behavior on duplicate points', 'Influx duplicate point semantics', 'https://docs.influxdata.com/influxdb/v2/write-data/best-practices/duplicate-points/', 'docs'),
    ('W5: Explain Modbus coils/register model and function codes', 'Modbus Application Protocol v1.1b3', 'https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf', 'standard'),
    ('W5: Launch modbus simulator server and polling client', 'PyModbus documentation', 'https://pymodbus.readthedocs.io/', 'docs'),
    ('W6: Explain CA vs IOA vs COT roles in IEC-104 mapping', 'IEC 60870-5-104 catalog entry', 'https://webstore.iec.ch/publication/2615', 'standard'),
    ('W6: Trigger General Interrogation and ingest resulting points', 'iec104-python project', 'https://github.com/Fraunhofer-FIT-DIEN/iec104-python', 'reference'),
    ('W7: Explain QDS invalid/not topical/overflow semantics', 'IEC-104 practical quality descriptor notes', 'https://filedn.eu/l6oFb0aAwOAyRLLaUMiUmzz/CE_HELP/eng/rtus/rtus_D-SE-0007351.htm', 'reference'),
    ('W8: Explain 3-phase approximation P≈sqrt(3)*V_L*I_L*PF', 'NPTEL three-phase power lectures', 'https://archive.nptel.ac.in/courses/108/106/108106071/', 'course'),
    ('W8: Build derived_power module with tolerance-tested fixtures', 'MIT OCW power electronics', 'https://ocw.mit.edu/courses/6-334-power-electronics-spring-2007/', 'course'),
    ('W9: Train improved model with weather + lag features', 'NREL PVWatts', 'https://pvwatts.nrel.gov/', 'reference'),
    ('W9: Explain leakage-safe time-series split strategy', 'scikit-learn model_selection', 'https://scikit-learn.org/stable/modules/cross_validation.html', 'docs'),
    ('W10: Export Prometheus metrics for forecast service', 'Prometheus metric types', 'https://prometheus.io/docs/concepts/metric_types/', 'docs'),
    ('W10: Implement GET /forecast with horizon 1h-24h', 'FastAPI documentation', 'https://fastapi.tiangolo.com/', 'docs'),
    ('W11: Explain IsolationForest assumptions and limitations', 'sklearn IsolationForest', 'https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html', 'docs'),
    ('W11: Implement POST /ask-docs returning answer + sources[]', 'RAG paper (Lewis et al. 2020)', 'https://arxiv.org/abs/2005.11401', 'paper'),
    ('W12: Write e2e tests for compose + simulators + DB/API asserts', 'FastAPI testing tutorial', 'https://fastapi.tiangolo.com/tutorial/testing/', 'docs'),
    ('W12: Explain retry pattern risks during prolonged outages', 'Retry pattern (Microsoft)', 'https://learn.microsoft.com/azure/architecture/patterns/retry', 'guidance')
)
INSERT INTO item_sources (item_id, label, url, kind)
SELECT i.id, s.label, s.url, s.kind
FROM sources_seed s
JOIN items i ON i.title = s.item_title;

COMMIT;
