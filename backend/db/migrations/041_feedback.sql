-- 041_feedback.sql
-- User feedback submissions from web and mobile clients.
-- INSERT open to anon+authenticated; SELECT restricted to service_role (admin only).

CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT now(),
  category    TEXT        NOT NULL    CHECK (category IN (
                'bugs_crashes',
                'oracle_response_quality',
                'hexagram_generation',
                'oracle_bones',
                'image_generation',
                'translations',
                'token_purchase',
                'account_access',
                'ui_ux',
                'general_suggestion'
              )),
  description TEXT        NOT NULL    CHECK (char_length(description) BETWEEN 20 AND 1000),
  email       TEXT,
  locale      TEXT,
  app_version TEXT,
  platform    TEXT        CHECK (platform IN ('web', 'android', 'ios')),
  metadata    JSONB       NOT NULL    DEFAULT '{}'
);

-- Index for admin queries by date and category
CREATE INDEX IF NOT EXISTS feedback_created_at_idx  ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_category_idx    ON feedback (category);

-- Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Any visitor (anon or logged-in) can submit feedback
CREATE POLICY "feedback_insert_public"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role (admin API) can read submissions
CREATE POLICY "feedback_select_admin"
  ON feedback FOR SELECT
  TO service_role
  USING (true);
