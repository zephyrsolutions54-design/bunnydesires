-- Broadcast gift INSERTs to participants (RLS still applies: sender/receiver only)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
