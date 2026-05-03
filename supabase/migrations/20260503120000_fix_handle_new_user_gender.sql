-- Harden new-user signup: robust gender parsing from auth metadata and safe email fallback.
-- Prevents silent trigger failures when gender casing/whitespace differs or email is null.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_gender public.user_gender;
  user_name TEXT;
  user_email TEXT;
  raw_gender TEXT;
BEGIN
  user_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'User');
  user_email := COALESCE(NULLIF(trim(NEW.email), ''), NULLIF(trim(NEW.raw_user_meta_data->>'email'), ''));

  IF user_email IS NULL OR user_email = '' THEN
    user_email := replace(NEW.id::text, '-', '') || '@signup.placeholder';
  END IF;

  raw_gender := lower(trim(coalesce(NEW.raw_user_meta_data->>'gender', '')));

  IF raw_gender NOT IN ('male', 'female') THEN
    raw_gender := lower(trim(coalesce(NEW.raw_user_meta_data->'user_metadata'->>'gender', '')));
  END IF;

  IF raw_gender NOT IN ('male', 'female') THEN
    RAISE EXCEPTION 'handle_new_user: invalid or missing gender in user metadata (expected male or female)';
  END IF;

  user_gender := raw_gender::public.user_gender;

  INSERT INTO public.profiles (id, email, name, gender)
  VALUES (NEW.id, user_email, user_name, user_gender);

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);

  IF user_gender = 'female' THEN
    INSERT INTO public.earnings (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;
