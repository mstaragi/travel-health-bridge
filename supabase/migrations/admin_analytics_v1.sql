-- 1. Update user_profiles to include role
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create index on feedback submitted_at for performance
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON feedback (submitted_at);

-- 3. Create the 7-day Displacement Rate View
-- TRUE displacement rate = 
--   Count(Users who had a prior recommendation AND visited Travel Health Bridge's recommendation) 
--   / Count(Users who had a prior recommendation)
CREATE OR REPLACE VIEW displacement_rate_7d AS
SELECT
  ROUND(
    (
      COUNT(*) FILTER (
        WHERE prior_recommendation_source != 'No — Travel Health Bridge was my first step'
        AND visited_recommended_provider = true
      )::numeric / 
      NULLIF(
        COUNT(*) FILTER (
          WHERE prior_recommendation_source != 'No — Travel Health Bridge was my first step'
        ), 0
      )::numeric
    ) * 100, 
    2
  ) AS displacement_percentage,
  COUNT(*) FILTER (
    WHERE prior_recommendation_source != 'No — Travel Health Bridge was my first step'
  ) AS denominator_volume
FROM feedback
WHERE submitted_at > now() - interval '7 days';

-- 4. Enable RLS on the view (if using Supabase) or restrict via role
-- Admin console will access this via the service role or a role-checked query.
