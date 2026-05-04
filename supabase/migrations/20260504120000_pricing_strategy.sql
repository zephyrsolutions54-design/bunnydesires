-- Pricing strategy (part 1): tiers function, coin packs, gifts, calls default.
-- Profile rate updates are in 20260504120100 so this transaction commits first
-- and avoids deadlocks with concurrent traffic on `profiles`.
--
-- If you still see 40P01: pause the app / dashboard SQL, wait a few seconds, retry.

-- ---------------------------------------------------------------------------
-- Per-minute tiers (replaces 4–8 scale with 45–70 band)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_earnings_rate(avg_rating numeric)
RETURNS TABLE(coins_per_min integer, tier rating_tier)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF avg_rating >= 4.8 THEN
    RETURN QUERY SELECT 70, 'platinum'::rating_tier;
  ELSIF avg_rating >= 4.5 THEN
    RETURN QUERY SELECT 62, 'gold'::rating_tier;
  ELSIF avg_rating >= 4.0 THEN
    RETURN QUERY SELECT 55, 'silver'::rating_tier;
  ELSIF avg_rating >= 3.5 THEN
    RETURN QUERY SELECT 50, 'bronze'::rating_tier;
  ELSE
    RETURN QUERY SELECT 45, 'standard'::rating_tier;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Coin packages (deactivate legacy rows, insert new ladder)
-- ---------------------------------------------------------------------------
UPDATE public.coin_packages SET is_active = false WHERE is_active = true;

INSERT INTO public.coin_packages (name, coins, price_inr, bonus_percent, is_popular, is_active) VALUES
  ('Impulse', 550, 299.00, 0, false, true),
  ('Standard', 1600, 799.00, 9, false, true),
  ('Popular', 3400, 1499.00, 13, true, true),
  ('Max', 7500, 2999.00, 25, false, true);

-- ---------------------------------------------------------------------------
-- Gift prices scaled with call economy (~11× prior tier)
-- ---------------------------------------------------------------------------
UPDATE public.gift_types SET coins_cost = 550 WHERE name = 'Rose';
UPDATE public.gift_types SET coins_cost = 2200 WHERE name = 'Gift Box';
UPDATE public.gift_types SET coins_cost = 5500 WHERE name = 'Diamond';
UPDATE public.gift_types SET coins_cost = 11000 WHERE name = 'Crown';

-- Default call rate on new rows (if ever inserted without explicit rate)
ALTER TABLE public.calls
  ALTER COLUMN coins_per_minute SET DEFAULT 55;
