-- Drop loyalty/bonus system

DROP TRIGGER IF EXISTS award_welcome_bonus_on_profile ON public.profiles;
DROP TRIGGER IF EXISTS award_welcome_bonus_trigger ON public.profiles;
DROP TRIGGER IF EXISTS check_tier_trigger ON public.loyalty_points;
DROP TRIGGER IF EXISTS update_loyalty_points_updated_at ON public.loyalty_points;

DROP FUNCTION IF EXISTS public.award_welcome_bonus_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.award_points(uuid, integer, transaction_type, text, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_and_update_tier() CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_points() CASCADE;
DROP FUNCTION IF EXISTS public.get_active_campaign_multiplier() CASCADE;
DROP FUNCTION IF EXISTS public.update_loyalty_updated_at() CASCADE;

DROP TABLE IF EXISTS public.points_transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.loyalty_campaigns CASCADE;
DROP TABLE IF EXISTS public.loyalty_tiers CASCADE;
DROP TABLE IF EXISTS public.referral_codes CASCADE;

DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.loyalty_tier CASCADE;