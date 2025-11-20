-- Fix security warnings: Add search_path to functions and INSERT policy for notifications

-- 1. Fix: Update award_welcome_bonus_trigger to set search_path
CREATE OR REPLACE FUNCTION public.award_welcome_bonus_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if loyalty points already exist for this user
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_points WHERE user_id = NEW.id) THEN
    -- Award 500 welcome points
    PERFORM public.award_points(
      NEW.id,
      500,
      'welcome',
      'Velkommen til HandyHjelp Kundeklubb! 🎉'
    );
    
    -- Create welcome notification
    INSERT INTO public.notifications (user_id, type, title, message, read)
    VALUES (
      NEW.id,
      'loyalty',
      'Velkommen til Kundeklubben!',
      'Du har fått 500 velkomstpoeng! Start å samle poeng ved å bestille tjenester.',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Fix: Update handle_updated_at to set search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Fix: Update handle_new_user to set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- 4. Fix: Update update_loyalty_updated_at to set search_path
CREATE OR REPLACE FUNCTION public.update_loyalty_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Fix: Update check_and_update_tier to set search_path (already has it, but ensuring consistency)
CREATE OR REPLACE FUNCTION public.check_and_update_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 6. Fix: Add INSERT policy for notifications table to allow admins to create notifications
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Fix: Add service role policy for notifications (for edge functions)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);