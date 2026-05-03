-- Persisted 1:1 chat between users (outside LiveKit), with RLS and realtime-friendly thread_key

CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_key TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT direct_messages_distinct CHECK (sender_id <> recipient_id)
);

CREATE INDEX idx_direct_messages_thread_created ON public.direct_messages (thread_key, created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Read any message in threads you participate in
CREATE POLICY "Users can read messages in their threads"
  ON public.direct_messages FOR SELECT
  TO authenticated
  USING (public.is_owner(sender_id) OR public.is_owner(recipient_id));

-- Only male↔female messaging
CREATE POLICY "Users can send cross-gender messages"
  ON public.direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner(sender_id)
    AND (
      (public.is_male(sender_id) AND public.is_female(recipient_id))
      OR (public.is_female(sender_id) AND public.is_male(recipient_id))
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
