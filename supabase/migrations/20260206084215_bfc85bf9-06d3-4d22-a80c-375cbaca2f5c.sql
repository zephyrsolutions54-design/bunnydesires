-- Create enum for user gender/role
CREATE TYPE public.user_gender AS ENUM ('male', 'female');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('coin_purchase', 'call_deduction', 'gift_sent', 'gift_received', 'earnings_credit', 'withdrawal');

-- Create enum for call status
CREATE TYPE public.call_status AS ENUM ('pending', 'active', 'ended', 'missed', 'declined');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender user_gender NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  country TEXT DEFAULT 'India',
  language TEXT DEFAULT 'en',
  is_online BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_purchased INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create earnings table (for female creators)
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  call_earnings INTEGER DEFAULT 0 NOT NULL,
  gift_earnings INTEGER DEFAULT 0 NOT NULL,
  total_earnings INTEGER DEFAULT 0 NOT NULL,
  withdrawn_amount INTEGER DEFAULT 0 NOT NULL,
  available_balance INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  coins INTEGER NOT NULL,
  description TEXT,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_call_id UUID,
  status TEXT DEFAULT 'completed' NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create calls table
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status call_status DEFAULT 'pending' NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  coins_spent INTEGER DEFAULT 0,
  coins_per_minute INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create gifts table
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gift_type TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  coins_amount INTEGER NOT NULL,
  call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  amount_inr NUMERIC(10,2) NOT NULL,
  status withdrawal_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Create coin packages table
CREATE TABLE public.coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  price_inr NUMERIC(10,2) NOT NULL,
  bonus_percent INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default coin packages
INSERT INTO public.coin_packages (name, coins, price_inr, bonus_percent, is_popular) VALUES
  ('Starter', 1200, 200, 0, false),
  ('Popular', 3200, 500, 7, true),
  ('Value', 7000, 1000, 16, false),
  ('Premium', 15000, 2000, 25, false);

-- Create gift types table
CREATE TABLE public.gift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  coins_cost INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default gift types
INSERT INTO public.gift_types (name, emoji, coins_cost) VALUES
  ('Rose', '🌹', 50),
  ('Gift Box', '💝', 200),
  ('Diamond', '💎', 500),
  ('Crown', '👑', 1000);

-- Helper function to check if user is the owner
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = resource_user_id
$$;

-- Helper function to check user gender
CREATE OR REPLACE FUNCTION public.get_user_gender(user_id UUID)
RETURNS user_gender
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gender FROM public.profiles WHERE id = user_id
$$;

-- Helper function to check if user is male
CREATE OR REPLACE FUNCTION public.is_male(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND gender = 'male')
$$;

-- Helper function to check if user is female
CREATE OR REPLACE FUNCTION public.is_female(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND gender = 'female')
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_gender user_gender;
  user_name TEXT;
BEGIN
  -- Get gender and name from metadata
  user_gender := (NEW.raw_user_meta_data->>'gender')::user_gender;
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Create profile
  INSERT INTO public.profiles (id, email, name, gender)
  VALUES (NEW.id, NEW.email, user_name, user_gender);
  
  -- Create wallet
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  
  -- Create earnings record for female users
  IF user_gender = 'female' THEN
    INSERT INTO public.earnings (user_id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON public.earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_types ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (is_owner(id))
  WITH CHECK (is_owner(id));

-- Wallets RLS policies
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (is_owner(user_id));

CREATE POLICY "Users can update their own wallet"
  ON public.wallets FOR UPDATE
  TO authenticated
  USING (is_owner(user_id));

-- Earnings RLS policies
CREATE POLICY "Female users can view their own earnings"
  ON public.earnings FOR SELECT
  TO authenticated
  USING (is_owner(user_id));

CREATE POLICY "Female users can update their own earnings"
  ON public.earnings FOR UPDATE
  TO authenticated
  USING (is_owner(user_id));

-- Transactions RLS policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (is_owner(user_id) OR is_owner(related_user_id));

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (is_owner(user_id));

-- Calls RLS policies
CREATE POLICY "Users can view calls they are part of"
  ON public.calls FOR SELECT
  TO authenticated
  USING (is_owner(initiator_id) OR is_owner(receiver_id));

CREATE POLICY "Male users can create calls"
  ON public.calls FOR INSERT
  TO authenticated
  WITH CHECK (is_owner(initiator_id) AND is_male(initiator_id));

CREATE POLICY "Call participants can update calls"
  ON public.calls FOR UPDATE
  TO authenticated
  USING (is_owner(initiator_id) OR is_owner(receiver_id));

-- Gifts RLS policies
CREATE POLICY "Users can view gifts they sent or received"
  ON public.gifts FOR SELECT
  TO authenticated
  USING (is_owner(sender_id) OR is_owner(receiver_id));

CREATE POLICY "Male users can send gifts"
  ON public.gifts FOR INSERT
  TO authenticated
  WITH CHECK (is_owner(sender_id) AND is_male(sender_id));

-- Withdrawals RLS policies
CREATE POLICY "Female users can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (is_owner(user_id));

CREATE POLICY "Female users can create withdrawals"
  ON public.withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (is_owner(user_id) AND is_female(user_id));

-- Coin packages - public read
CREATE POLICY "Anyone can view active coin packages"
  ON public.coin_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Gift types - public read
CREATE POLICY "Anyone can view active gift types"
  ON public.gift_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for performance
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_is_online ON public.profiles(is_online);
CREATE INDEX idx_profiles_country ON public.profiles(country);
CREATE INDEX idx_calls_status ON public.calls(status);
CREATE INDEX idx_calls_initiator ON public.calls(initiator_id);
CREATE INDEX idx_calls_receiver ON public.calls(receiver_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_gifts_receiver ON public.gifts(receiver_id);
CREATE INDEX idx_withdrawals_user ON public.withdrawals(user_id);