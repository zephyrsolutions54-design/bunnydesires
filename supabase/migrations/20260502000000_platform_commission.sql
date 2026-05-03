-- Platform configuration table (single-row config)
CREATE TABLE IF NOT EXISTS public.platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.20,
  min_withdrawal_coins INTEGER NOT NULL DEFAULT 3000,
  coins_per_inr INTEGER NOT NULL DEFAULT 6,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default config (20% platform commission)
INSERT INTO public.platform_config (commission_rate, min_withdrawal_coins, coins_per_inr)
VALUES (0.20, 3000, 6);

-- Platform earnings tracker
CREATE TABLE IF NOT EXISTS public.platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('call_commission', 'gift_commission')),
  source_id UUID,
  gross_coins INTEGER NOT NULL,
  commission_coins INTEGER NOT NULL,
  creator_coins INTEGER NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

-- Platform config is read-only for authenticated users (admin updates via service role)
CREATE POLICY "Authenticated users can read platform config"
  ON public.platform_config FOR SELECT
  TO authenticated
  USING (true);

-- Platform earnings are not visible to regular users
-- Only accessible via service role (admin)

-- Index for analytics
CREATE INDEX idx_platform_earnings_created ON public.platform_earnings(created_at);
CREATE INDEX idx_platform_earnings_source ON public.platform_earnings(source_type);

-- Add commission tracking columns to earnings table
ALTER TABLE public.earnings
ADD COLUMN IF NOT EXISTS gross_earnings INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS commission_paid INTEGER DEFAULT 0 NOT NULL;
