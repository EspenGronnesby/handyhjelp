-- Oppdater handle_new_user trigger til å inkludere org_number og company_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, customer_type, org_number, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'customer_type', NULL),
    COALESCE(NEW.raw_user_meta_data->>'org_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL)
  );
  RETURN NEW;
END;
$$;