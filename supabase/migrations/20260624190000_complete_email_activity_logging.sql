-- Komplett e-post- og aktivitetslogging
--
-- 1) Tillat e-postlogging uten innlogget avsender (system-/cron-/kunde-utløste e-poster)
ALTER TABLE public.email_logs ALTER COLUMN sender_user_id DROP NOT NULL;

-- 2) Triggere som logger kunde-innsendinger til activity_logs.
--    Anonyme innsendinger kan ikke skrives fra frontend pga. RLS
--    (krever authenticated + user_id = auth.uid()), så vi bruker
--    SECURITY DEFINER-triggere med user_id = NULL, user_role = 'user'.

-- Ny tilbudsforespørsel
CREATE OR REPLACE FUNCTION public.log_quote_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id, user_role, user_name, action_type, action_category, description, metadata
  ) VALUES (
    NULL, 'user', COALESCE(NEW.name, NEW.email, 'Ukjent'),
    'quote_submitted', 'quote_management',
    'Ny tilbudsforespørsel fra ' || COALESCE(NEW.name, NEW.email, 'ukjent'),
    jsonb_build_object('quote_id', NEW.id, 'type', NEW.type)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_quote_submitted ON public.quotes;
CREATE TRIGGER trg_log_quote_submitted
  AFTER INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_quote_submitted();

-- Ny serviceavtaleforespørsel
CREATE OR REPLACE FUNCTION public.log_agreement_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id, user_role, user_name, action_type, action_category, description, metadata
  ) VALUES (
    NULL, 'user', COALESCE(NEW.contact_person, NEW.email, 'Ukjent'),
    'agreement_submitted', 'agreement_management',
    'Ny serviceavtaleforespørsel fra ' || COALESCE(NEW.contact_person, NEW.email, 'ukjent'),
    jsonb_build_object('agreement_id', NEW.id, 'address', NEW.address)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_agreement_submitted ON public.service_agreements;
CREATE TRIGGER trg_log_agreement_submitted
  AFTER INSERT ON public.service_agreements
  FOR EACH ROW EXECUTE FUNCTION public.log_agreement_submitted();

-- Ny anmeldelse
CREATE OR REPLACE FUNCTION public.log_review_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id, user_role, user_name, action_type, action_category, description, metadata
  ) VALUES (
    NULL, 'user', COALESCE(NEW.customer_name, 'Anonym'),
    'review_submitted', 'content_management',
    'Ny anmeldelse fra ' || COALESCE(NEW.customer_name, 'anonym')
      || COALESCE(' (' || NEW.rating || ' stjerner)', ''),
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_review_submitted ON public.reviews;
CREATE TRIGGER trg_log_review_submitted
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.log_review_submitted();

-- Ny kunde registrert (profil opprettet)
CREATE OR REPLACE FUNCTION public.log_customer_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id, user_role, user_name, action_type, action_category, description, metadata
  ) VALUES (
    NULL, 'user', COALESCE(NEW.full_name, NEW.email, 'Ukjent'),
    'customer_created', 'customer_management',
    'Ny kunde registrert: ' || COALESCE(NEW.full_name, NEW.email, 'ukjent'),
    jsonb_build_object('profile_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_customer_created ON public.profiles;
CREATE TRIGGER trg_log_customer_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_customer_created();
