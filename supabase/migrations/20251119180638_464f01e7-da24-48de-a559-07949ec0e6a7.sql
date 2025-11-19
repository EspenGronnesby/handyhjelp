-- Create trigger function to automatically award welcome bonus when profile is created
CREATE OR REPLACE FUNCTION award_welcome_bonus_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if loyalty points already exist for this user
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_points WHERE user_id = NEW.id) THEN
    -- Award 500 welcome points
    PERFORM award_points(
      NEW.id,
      500,
      'welcome',
      'Velkommen til HandyHjelp Kundeklubb! 🎉'
    );
    
    -- Create welcome notification
    INSERT INTO notifications (user_id, type, title, message, read)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table to award welcome bonus automatically
DROP TRIGGER IF EXISTS on_profile_created_award_welcome_bonus ON public.profiles;
CREATE TRIGGER on_profile_created_award_welcome_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION award_welcome_bonus_trigger();

-- Add comment explaining the security measure
COMMENT ON FUNCTION award_welcome_bonus_trigger() IS 'Automatically awards 500 welcome points when a new profile is created. This replaces the client-side edge function call to prevent abuse.';