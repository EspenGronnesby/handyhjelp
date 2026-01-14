-- Create table for secure, single-use download tokens for agreement documents
CREATE TABLE public.agreement_download_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id uuid NOT NULL REFERENCES public.service_agreements(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('offer', 'contract')),
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamp with time zone,
  ip_address text
);

-- Enable RLS
ALTER TABLE public.agreement_download_tokens ENABLE ROW LEVEL SECURITY;

-- Admins can manage tokens
CREATE POLICY "Admins can manage download tokens"
  ON public.agreement_download_tokens
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Platform owners can manage tokens
CREATE POLICY "Platform owners can manage download tokens"
  ON public.agreement_download_tokens
  FOR ALL
  USING (has_role(auth.uid(), 'platform_owner'::app_role))
  WITH CHECK (has_role(auth.uid(), 'platform_owner'::app_role));

-- Create index for fast token lookups
CREATE INDEX idx_agreement_download_tokens_token ON public.agreement_download_tokens(token);
CREATE INDEX idx_agreement_download_tokens_expires_at ON public.agreement_download_tokens(expires_at);

-- Create function to generate secure download token
CREATE OR REPLACE FUNCTION public.generate_download_token(
  p_agreement_id uuid,
  p_document_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token record
  INSERT INTO public.agreement_download_tokens (agreement_id, document_type, token)
  VALUES (p_agreement_id, p_document_type, v_token);
  
  RETURN v_token;
END;
$$;

-- Create function to validate and consume a download token
CREATE OR REPLACE FUNCTION public.validate_download_token(
  p_token text,
  p_ip_address text DEFAULT NULL
)
RETURNS TABLE (
  agreement_id uuid,
  document_type text,
  offer_document_url text,
  contract_document_url text,
  contact_person text,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.agreement_id,
    t.document_type,
    a.offer_document_url,
    a.contract_document_url,
    a.contact_person,
    CASE 
      WHEN t.id IS NULL THEN false
      WHEN t.used_at IS NOT NULL THEN false
      WHEN t.expires_at < now() THEN false
      ELSE true
    END as is_valid
  FROM public.agreement_download_tokens t
  LEFT JOIN public.service_agreements a ON a.id = t.agreement_id
  WHERE t.token = p_token;
  
  -- Mark token as used if valid
  UPDATE public.agreement_download_tokens
  SET used_at = now(), ip_address = p_ip_address
  WHERE token = p_token 
    AND used_at IS NULL 
    AND expires_at > now();
END;
$$;