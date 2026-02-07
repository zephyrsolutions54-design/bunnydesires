-- Fix the overly permissive INSERT policy on trial_earnings_log
-- Drop the old permissive policy
DROP POLICY IF EXISTS "System can insert trial earnings" ON public.trial_earnings_log;

-- Create a more restrictive policy - only call participants can insert
CREATE POLICY "Call participants can insert trial earnings"
ON public.trial_earnings_log
FOR INSERT
WITH CHECK (
  is_owner(trial_user_id) AND is_male(trial_user_id)
);