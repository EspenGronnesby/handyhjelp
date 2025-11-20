-- Add customer_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN customer_type TEXT 
CHECK (customer_type IN ('private', 'business'));

-- Update handle_new_user function to include customer_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, customer_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'customer_type', NULL)
  );
  RETURN NEW;
END;
$$;