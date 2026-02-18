
-- Create client_logos table
CREATE TABLE public.client_logos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- Anyone can read active logos
CREATE POLICY "Anyone can view active client logos"
  ON public.client_logos
  FOR SELECT
  USING (is_active = true);

-- Only platform_owner can manage logos
CREATE POLICY "Platform owners can manage client logos"
  ON public.client_logos
  FOR ALL
  USING (has_role(auth.uid(), 'platform_owner'::app_role))
  WITH CHECK (has_role(auth.uid(), 'platform_owner'::app_role));

-- Create client-logos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client-logos bucket
CREATE POLICY "Public can view client logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'client-logos');

CREATE POLICY "Platform owners can upload client logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'client-logos' AND has_role(auth.uid(), 'platform_owner'::app_role));

CREATE POLICY "Platform owners can update client logos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'client-logos' AND has_role(auth.uid(), 'platform_owner'::app_role));

CREATE POLICY "Platform owners can delete client logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'client-logos' AND has_role(auth.uid(), 'platform_owner'::app_role));
