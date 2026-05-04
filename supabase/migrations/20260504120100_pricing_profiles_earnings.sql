-- Pricing strategy (part 2): creator per-minute rates on `profiles`.
-- Runs after 20260504120000 so locks on other tables are released first.
-- Re-run safe when combined with part 1.

-- Data migration first (row locks only, no AccessExclusive on whole table)
UPDATE public.profiles
SET current_earnings_rate = CASE
  WHEN current_earnings_rate BETWEEN 45 AND 70 THEN current_earnings_rate
  WHEN current_earnings_rate = 8 THEN 70
  WHEN current_earnings_rate = 7 THEN 62
  WHEN current_earnings_rate = 6 THEN 55
  WHEN current_earnings_rate = 5 THEN 50
  WHEN current_earnings_rate = 4 THEN 45
  ELSE 55
END
WHERE gender = 'female' AND current_earnings_rate <= 10;

-- Brief AccessExclusiveLock — run when traffic is low if this step alone deadlocks
ALTER TABLE public.profiles
  ALTER COLUMN current_earnings_rate SET DEFAULT 55;
