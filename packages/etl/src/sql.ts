export function duckPath(absPath: string): string {
  return absPath.replaceAll('\\', '/');
}

export function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function pipelineSql(csvPath: string): string {
  const src = sqlLiteral(duckPath(csvPath));
  return `
CREATE TABLE tries AS
SELECT
  CAST(session_key AS VARCHAR) AS session_key,
  CAST(try_seq AS INTEGER) AS try_seq,
  CAST(terminal_key AS VARCHAR) AS terminal_key,
  CAST(merchant_key AS VARCHAR) AS merchant_key,
  CAST(category_id AS VARCHAR) AS category_id,
  CAST(category_title AS VARCHAR) AS category_title,
  CAST(amount AS BIGINT) AS amount,
  CAST(adjusted_fee AS BIGINT) AS adjusted_fee,
  CAST(session_status AS VARCHAR) AS session_status,
  CAST(try_status AS VARCHAR) AS try_status,
  CAST(psp_code AS VARCHAR) AS psp_code,
  CAST(issuer_bank_code AS VARCHAR) AS issuer_bank_code,
  CAST(payer_card_key AS VARCHAR) AS payer_card_key,
  CAST(created_at AS TIMESTAMP) AS created_at,
  CAST(verified_at AS TIMESTAMP) AS verified_at,
  CAST(settled_at AS TIMESTAMP) AS settled_at
FROM read_csv(${src}, header := true, auto_detect := true, sample_size := -1);

CREATE TABLE sessions AS
SELECT
  session_key,
  ANY_VALUE(merchant_key) AS merchant_key,
  ANY_VALUE(category_id) AS category_id,
  ANY_VALUE(category_title) AS category_title,
  ANY_VALUE(amount) AS amount,
  ANY_VALUE(adjusted_fee) AS adjusted_fee,
  ANY_VALUE(session_status) AS session_status,
  MIN(try_seq) AS min_try_seq,
  MAX(try_seq) AS max_try_seq,
  COUNT(*) AS try_rows,
  MIN(created_at) AS created_at,
  MIN(verified_at) AS verified_at,
  MAX(payer_card_key) AS payer_card_key,
  MAX(psp_code) AS psp_code_last,
  MIN(CASE WHEN try_status = 'Verified' THEN try_seq END) AS winning_try
FROM tries
GROUP BY session_key;

CREATE TABLE last_try AS
SELECT session_key, try_status AS last_status
FROM (
  SELECT session_key, try_status,
         ROW_NUMBER() OVER (PARTITION BY session_key ORDER BY try_seq DESC) AS rn
  FROM tries
)
WHERE rn = 1;

CREATE TABLE terminal_state AS
SELECT
  s.session_key,
  s.merchant_key,
  s.category_title,
  s.amount,
  s.adjusted_fee,
  s.session_status,
  s.min_try_seq,
  s.max_try_seq,
  s.try_rows,
  s.created_at,
  s.verified_at,
  s.payer_card_key,
  s.psp_code_last,
  s.winning_try,
  CASE
    WHEN s.min_try_seq = 0 THEN 'NoAttempt'
    WHEN s.winning_try IS NOT NULL THEN 'Verified'
    ELSE l.last_status
  END AS terminal_state,
  CASE WHEN s.amount > 0 AND s.amount < 10000 THEN TRUE ELSE FALSE END AS is_test_band
FROM sessions s
JOIN last_try l USING (session_key);

CREATE TABLE daily_coverage AS
WITH d AS (
  SELECT CAST(created_at AS DATE) AS day, COUNT(*) AS sessions
  FROM sessions
  GROUP BY 1
),
m AS (
  SELECT median(sessions) AS med FROM d
)
SELECT d.day, d.sessions, m.med, (d.sessions < m.med * 0.5) AS is_low_coverage
FROM d, m
ORDER BY d.day;

CREATE TABLE retry_hazard AS
WITH r AS (
  SELECT t.try_seq, t.try_status
  FROM tries t
  JOIN sessions s USING (session_key)
  WHERE t.try_seq > 0
    AND (s.winning_try IS NULL OR t.try_seq <= s.winning_try)
)
SELECT
  try_seq AS k,
  COUNT(*) AS at_risk,
  COUNT(*) FILTER (WHERE try_status = 'Verified') AS won
FROM r
GROUP BY 1
ORDER BY 1;

CREATE TABLE funnel AS
SELECT
  merchant_key,
  ANY_VALUE(category_title) AS category_title,
  COUNT(*) AS sessions,
  COUNT(*) FILTER (WHERE min_try_seq = 0) AS no_attempt,
  COUNT(*) FILTER (WHERE session_status = 'Verified') AS verified,
  COUNT(*) FILTER (WHERE session_status = 'Paid') AS paid_pending,
  COUNT(*) FILTER (WHERE terminal_state = 'InBank') AS in_bank,
  COUNT(*) FILTER (WHERE terminal_state = 'Failed') AS failed,
  COUNT(DISTINCT CASE WHEN session_status = 'Verified' THEN amount END) AS unique_prices,
  SUM(CASE WHEN session_status = 'Verified' THEN amount ELSE 0 END) AS revenue_rial,
  SUM(CASE WHEN session_status = 'Paid' THEN amount ELSE 0 END) AS paid_amount_rial,
  SUM(amount) AS attempted_amount_rial,
  median(amount) AS median_amount,
  SUM(CASE WHEN session_status = 'Verified' THEN adjusted_fee ELSE 0 END) AS fee_realized,
  SUM(CASE WHEN session_status != 'Verified' THEN adjusted_fee ELSE 0 END) AS fee_potential
FROM terminal_state
GROUP BY merchant_key;

CREATE TABLE gateway_health AS
SELECT
  merchant_key,
  sessions,
  no_attempt,
  verified,
  paid_pending,
  no_attempt::DOUBLE / sessions AS no_attempt_rate,
  sessions - no_attempt AS psp_sessions,
  CASE
    WHEN verified = 0 AND sessions >= 100 AND no_attempt::DOUBLE / sessions >= 0.95 THEN 'pattern_1_no_bank_reach'
    WHEN verified = 0 AND sessions >= 100 AND paid_pending > 0 THEN 'pattern_2_verify_broken'
    WHEN verified = 0 AND sessions >= 100 THEN 'pattern_3_terminal_config'
    WHEN verified::DOUBLE / sessions < 0.10 AND sessions >= 100 THEN 'degraded'
    ELSE 'healthy'
  END AS health
FROM funnel;

CREATE TABLE fee_ref AS
SELECT
  FLOOR(LOG10(amount) * 4) / 4 AS band,
  SUM(adjusted_fee)::DOUBLE / SUM(amount) AS ref_rate,
  COUNT(*) AS n
FROM terminal_state
WHERE terminal_state = 'Verified' AND amount > 0
GROUP BY 1
HAVING COUNT(*) >= 200;

CREATE TABLE fee_drag AS
WITH v AS (
  SELECT
    merchant_key,
    amount,
    adjusted_fee,
    FLOOR(LOG10(amount) * 4) / 4 AS band
  FROM terminal_state
  WHERE terminal_state = 'Verified' AND amount > 0
)
SELECT
  v.merchant_key,
  COUNT(*) AS orders,
  SUM(v.adjusted_fee)::DOUBLE / SUM(v.amount) AS actual_rate,
  SUM(r.ref_rate * v.amount) / SUM(v.amount) AS expected_rate,
  SUM(v.adjusted_fee)::DOUBLE / SUM(v.amount)
    - SUM(r.ref_rate * v.amount) / SUM(v.amount) AS tariff_effect,
  SUM(v.adjusted_fee) AS fee_realized,
  SUM(CASE WHEN v.adjusted_fee <= 2000 THEN 1 ELSE 0 END)::DOUBLE / COUNT(*) AS floor_bound_share
FROM v
JOIN fee_ref r USING (band)
GROUP BY 1;

CREATE TABLE psp_category_cross AS
SELECT
  category_title,
  COALESCE(psp_code, 'NONE') AS psp_code,
  COUNT(*) AS tries_n,
  COUNT(*) FILTER (WHERE try_status = 'Verified') AS won
FROM tries
WHERE try_seq > 0
GROUP BY 1, 2;

CREATE TABLE fee_potential AS
SELECT
  merchant_key,
  terminal_state,
  COUNT(*) AS sessions,
  SUM(adjusted_fee) AS fee_rial,
  terminal_state = 'Verified' AS is_realized
FROM terminal_state
GROUP BY 1, 2;

CREATE TABLE merchant_repeat AS
WITH cards AS (
  SELECT
    merchant_key,
    payer_card_key,
    COUNT(*) FILTER (WHERE session_status = 'Verified') AS orders
  FROM sessions
  WHERE payer_card_key IS NOT NULL AND CAST(payer_card_key AS VARCHAR) <> ''
  GROUP BY 1, 2
)
SELECT
  merchant_key,
  COUNT(*) FILTER (WHERE orders > 0) AS customers,
  COUNT(*) FILTER (WHERE orders > 1) AS repeat_customers,
  SUM(orders) FILTER (WHERE orders > 1)::DOUBLE / NULLIF(SUM(orders), 0) AS repeat_order_share
FROM cards
GROUP BY 1;
`;
}
