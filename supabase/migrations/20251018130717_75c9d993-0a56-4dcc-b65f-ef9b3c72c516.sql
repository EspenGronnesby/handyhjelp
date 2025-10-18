-- Create enum for loyalty tiers
CREATE TYPE public.loyalty_tier AS ENUM ('bronze', 'silver', 'gold');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('earned', 'spent', 'expired', 'bonus', 'referral', 'welcome');

-- Create loyalty_tiers configuration table
CREATE TABLE public.loyalty_tiers (
  tier loyalty_tier PRIMARY KEY,
  points_required INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default tier configuration
INSERT INTO public.loyalty_tiers (tier, points_required, discount_percentage, benefits) VALUES
  ('bronze', 0, 0, '["Grunnleggende fordeler", "1 poeng per krone"]'::jsonb),
  ('silver', 5000, 5, '["5% ekstra rabatt", "Prioritert support", "Dobbel poeng på bursdagen"]'::jsonb),
  ('gold', 15000, 10, '["10% ekstra rabatt", "Gratis tilsyn 1 gang per år", "Trippel poeng på bursdagen", "VIP support"]'::jsonb);

-- Create loyalty_points table (user's current points balance)
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  lifetime_points INTEGER DEFAULT 0,
  tier loyalty_tier DEFAULT 'bronze',
  tier_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create points_transactions table (history of all point movements)
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type transaction_type NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create loyalty_campaigns table
CREATE TABLE public.loyalty_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  multiplier DECIMAL(5,2) DEFAULT 1.0 CHECK (multiplier >= 1.0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_points
CREATE POLICY "Users can view own points"
  ON public.loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON public.loyalty_points FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for points_transactions
CREATE POLICY "Users can view own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for loyalty_campaigns (public read)
CREATE POLICY "Anyone can view active campaigns"
  ON public.loyalty_campaigns FOR SELECT
  USING (active = true AND now() BETWEEN start_date AND end_date);

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Anyone can view referral codes for validation"
  ON public.referral_codes FOR SELECT
  USING (true);

-- RLS Policies for loyalty_tiers (public read)
CREATE POLICY "Anyone can view tiers"
  ON public.loyalty_tiers FOR SELECT
  USING (true);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_loyalty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for loyalty_points updated_at
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_updated_at();

-- Function: Check and update tier based on lifetime points
CREATE OR REPLACE FUNCTION public.check_and_update_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier loyalty_tier;
BEGIN
  -- Determine tier based on lifetime points
  IF NEW.lifetime_points >= 15000 THEN
    new_tier := 'gold';
  ELSIF NEW.lifetime_points >= 5000 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;

  -- Update tier if changed
  IF new_tier != NEW.tier THEN
    NEW.tier := new_tier;
    NEW.tier_updated_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: Auto-update tier on points change
CREATE TRIGGER auto_update_tier
  BEFORE UPDATE OF lifetime_points ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_update_tier();

-- Function: Award points and create transaction
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  expires_date TIMESTAMPTZ;
BEGIN
  -- Set expiry date (12 months from now for earned/bonus/referral points)
  IF p_type IN ('earned', 'bonus', 'referral', 'welcome') THEN
    expires_date := now() + INTERVAL '12 months';
  END IF;

  -- Create transaction record
  INSERT INTO public.points_transactions (
    user_id, amount, transaction_type, description,
    reference_id, reference_type, expires_at
  ) VALUES (
    p_user_id, p_amount, p_type, p_description,
    p_reference_id, p_reference_type, expires_date
  ) RETURNING id INTO transaction_id;

  -- Update loyalty_points balance and lifetime
  INSERT INTO public.loyalty_points (user_id, balance, lifetime_points)
  VALUES (p_user_id, p_amount, CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = loyalty_points.balance + p_amount,
    lifetime_points = CASE 
      WHEN p_amount > 0 THEN loyalty_points.lifetime_points + p_amount
      ELSE loyalty_points.lifetime_points
    END;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Expire old points (to be called by cron job)
CREATE OR REPLACE FUNCTION public.expire_old_points()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  expired_record RECORD;
BEGIN
  -- Find and expire points older than 12 months
  FOR expired_record IN
    SELECT user_id, SUM(amount) as total_expired
    FROM public.points_transactions
    WHERE expires_at < now()
      AND transaction_type IN ('earned', 'bonus', 'referral', 'welcome')
      AND id NOT IN (
        SELECT reference_id FROM public.points_transactions
        WHERE transaction_type = 'expired' AND reference_id IS NOT NULL
      )
    GROUP BY user_id
  LOOP
    -- Create expiration transaction
    PERFORM public.award_points(
      expired_record.user_id,
      -expired_record.total_expired,
      'expired',
      'Poeng utløpt etter 12 måneder',
      NULL,
      NULL
    );
    expired_count := expired_count + 1;
  END LOOP;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Get active campaign multiplier
CREATE OR REPLACE FUNCTION public.get_active_campaign_multiplier()
RETURNS DECIMAL AS $$
DECLARE
  multiplier DECIMAL;
BEGIN
  SELECT COALESCE(MAX(loyalty_campaigns.multiplier), 1.0)
  INTO multiplier
  FROM public.loyalty_campaigns
  WHERE active = true
    AND now() BETWEEN start_date AND end_date;
  
  RETURN multiplier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add amount column to jobs table for point calculation
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;