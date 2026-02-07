-- Add trial system columns to wallets
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS trial_coins integer DEFAULT 300,
ADD COLUMN IF NOT EXISTS is_trial_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone;

-- Add trial earnings columns to earnings table
ALTER TABLE public.earnings
ADD COLUMN IF NOT EXISTS trial_earnings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_earnings_converted integer DEFAULT 0;

-- Add account type and trial tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'trial' CHECK (account_type IN ('trial', 'paid', 'creator')),
ADD COLUMN IF NOT EXISTS first_purchase_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_call_ids uuid[] DEFAULT '{}';

-- Create table to track trial earnings per user (for conversion tracking)
CREATE TABLE IF NOT EXISTS public.trial_earnings_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id),
  trial_user_id uuid NOT NULL REFERENCES public.profiles(id),
  call_id uuid REFERENCES public.calls(id),
  coins_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  is_converted boolean DEFAULT false,
  converted_at timestamp with time zone
);

-- Enable RLS on trial_earnings_log
ALTER TABLE public.trial_earnings_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for trial_earnings_log
CREATE POLICY "Creators can view their trial earnings"
ON public.trial_earnings_log
FOR SELECT
USING (is_owner(creator_id));

CREATE POLICY "System can insert trial earnings"
ON public.trial_earnings_log
FOR INSERT
WITH CHECK (true);

-- Function to convert trial earnings when user makes first purchase
CREATE OR REPLACE FUNCTION public.convert_trial_earnings(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_record RECORD;
BEGIN
  -- Mark user as paid
  UPDATE public.profiles
  SET account_type = 'paid',
      first_purchase_date = now()
  WHERE id = p_user_id AND account_type = 'trial';

  -- Convert all unexpired trial earnings for this user's calls
  FOR log_record IN 
    SELECT creator_id, SUM(coins_earned) as total_coins
    FROM public.trial_earnings_log
    WHERE trial_user_id = p_user_id 
      AND is_converted = false 
      AND expires_at > now()
    GROUP BY creator_id
  LOOP
    -- Add to creator's real available balance
    UPDATE public.earnings
    SET available_balance = available_balance + log_record.total_coins,
        trial_earnings = GREATEST(0, trial_earnings - log_record.total_coins),
        trial_earnings_converted = trial_earnings_converted + log_record.total_coins,
        total_earnings = total_earnings + log_record.total_coins,
        updated_at = now()
    WHERE user_id = log_record.creator_id;
  END LOOP;

  -- Mark trial earnings as converted
  UPDATE public.trial_earnings_log
  SET is_converted = true,
      converted_at = now()
  WHERE trial_user_id = p_user_id 
    AND is_converted = false 
    AND expires_at > now();
END;
$$;

-- Function to expire old trial earnings (run via cron)
CREATE OR REPLACE FUNCTION public.expire_trial_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_record RECORD;
BEGIN
  -- Find expired, unconverted trial earnings
  FOR log_record IN 
    SELECT creator_id, SUM(coins_earned) as total_coins
    FROM public.trial_earnings_log
    WHERE is_converted = false 
      AND expires_at <= now()
    GROUP BY creator_id
  LOOP
    -- Subtract from trial_earnings
    UPDATE public.earnings
    SET trial_earnings = GREATEST(0, trial_earnings - log_record.total_coins),
        updated_at = now()
    WHERE user_id = log_record.creator_id;
  END LOOP;

  -- Delete expired entries
  DELETE FROM public.trial_earnings_log
  WHERE is_converted = false AND expires_at <= now();
END;
$$;