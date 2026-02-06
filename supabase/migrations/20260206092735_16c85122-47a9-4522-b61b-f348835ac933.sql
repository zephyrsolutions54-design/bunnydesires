-- Create rating tier enum
CREATE TYPE public.rating_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze', 'standard');

-- Add rating breakdown and tier fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN rating_breakdown jsonb DEFAULT '{"five_stars": 0, "four_stars": 0, "three_stars": 0, "two_stars": 0, "one_star": 0}'::jsonb,
ADD COLUMN rating_tier rating_tier DEFAULT 'standard',
ADD COLUMN current_earnings_rate integer DEFAULT 6;

-- Create ratings table
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id uuid REFERENCES public.calls(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(call_id)
);

-- Add rating fields to calls table
ALTER TABLE public.calls
ADD COLUMN rated_by_user boolean DEFAULT false,
ADD COLUMN rating_given integer CHECK (rating_given IS NULL OR (rating_given >= 1 AND rating_given <= 5)),
ADD COLUMN rating_submitted_at timestamp with time zone;

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings they gave or received"
ON public.ratings
FOR SELECT
USING (is_owner(from_user_id) OR is_owner(to_user_id));

CREATE POLICY "Male users can create ratings for their calls"
ON public.ratings
FOR INSERT
WITH CHECK (
  is_owner(from_user_id) 
  AND is_male(from_user_id)
  AND EXISTS (
    SELECT 1 FROM public.calls 
    WHERE calls.id = call_id 
    AND calls.initiator_id = from_user_id
    AND calls.rated_by_user = false
  )
);

-- Function to calculate earnings rate based on average rating
CREATE OR REPLACE FUNCTION public.calculate_earnings_rate(avg_rating numeric)
RETURNS TABLE(coins_per_min integer, tier rating_tier)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF avg_rating >= 4.8 THEN
    RETURN QUERY SELECT 8, 'platinum'::rating_tier;
  ELSIF avg_rating >= 4.5 THEN
    RETURN QUERY SELECT 7, 'gold'::rating_tier;
  ELSIF avg_rating >= 4.0 THEN
    RETURN QUERY SELECT 6, 'silver'::rating_tier;
  ELSIF avg_rating >= 3.5 THEN
    RETURN QUERY SELECT 5, 'bronze'::rating_tier;
  ELSE
    RETURN QUERY SELECT 4, 'standard'::rating_tier;
  END IF;
END;
$$;

-- Function to update user rating after new rating is submitted
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_breakdown jsonb;
  new_total integer;
  new_average numeric;
  new_rate integer;
  new_tier rating_tier;
  star_key text;
BEGIN
  -- Determine which star key to update
  CASE NEW.stars
    WHEN 5 THEN star_key := 'five_stars';
    WHEN 4 THEN star_key := 'four_stars';
    WHEN 3 THEN star_key := 'three_stars';
    WHEN 2 THEN star_key := 'two_stars';
    WHEN 1 THEN star_key := 'one_star';
  END CASE;

  -- Get current breakdown and update it
  SELECT 
    jsonb_set(
      COALESCE(rating_breakdown, '{"five_stars": 0, "four_stars": 0, "three_stars": 0, "two_stars": 0, "one_star": 0}'::jsonb),
      ARRAY[star_key],
      to_jsonb(COALESCE((rating_breakdown->>star_key)::integer, 0) + 1)
    ),
    COALESCE(total_ratings, 0) + 1
  INTO new_breakdown, new_total
  FROM public.profiles
  WHERE id = NEW.to_user_id;

  -- Calculate new average
  new_average := (
    (new_breakdown->>'five_stars')::integer * 5 +
    (new_breakdown->>'four_stars')::integer * 4 +
    (new_breakdown->>'three_stars')::integer * 3 +
    (new_breakdown->>'two_stars')::integer * 2 +
    (new_breakdown->>'one_star')::integer * 1
  )::numeric / new_total;

  -- Get new tier and rate
  SELECT e.coins_per_min, e.tier 
  INTO new_rate, new_tier
  FROM public.calculate_earnings_rate(new_average) AS e;

  -- Update profile
  UPDATE public.profiles
  SET 
    rating_breakdown = new_breakdown,
    total_ratings = new_total,
    rating = ROUND(new_average, 2),
    rating_tier = new_tier,
    current_earnings_rate = new_rate,
    updated_at = now()
  WHERE id = NEW.to_user_id;

  -- Update the call record
  UPDATE public.calls
  SET 
    rated_by_user = true,
    rating_given = NEW.stars,
    rating_submitted_at = now()
  WHERE id = NEW.call_id;

  RETURN NEW;
END;
$$;

-- Create trigger for rating updates
CREATE TRIGGER on_rating_created
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_rating();

-- Update existing profiles to have correct default earnings rate
UPDATE public.profiles
SET 
  current_earnings_rate = 6,
  rating_tier = 'standard'
WHERE gender = 'female' AND current_earnings_rate IS NULL;