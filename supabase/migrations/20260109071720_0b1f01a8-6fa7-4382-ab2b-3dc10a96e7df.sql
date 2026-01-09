-- Fase 1: Utvid service_agreements tabellen med nye kolonner
ALTER TABLE public.service_agreements
ADD COLUMN IF NOT EXISTS offer_amount numeric,
ADD COLUMN IF NOT EXISTS offer_document_url text,
ADD COLUMN IF NOT EXISTS contract_document_url text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS offer_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS contract_signed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_approved_at timestamp with time zone;

-- Opprett agreement_activities tabell for aktivitetslogg
CREATE TABLE public.agreement_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id uuid NOT NULL REFERENCES public.service_agreements(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS på agreement_activities
ALTER TABLE public.agreement_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for agreement_activities
CREATE POLICY "Admins can view all activities"
ON public.agreement_activities
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert activities"
ON public.agreement_activities
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view activities for their agreements"
ON public.agreement_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_agreements sa
    WHERE sa.id = agreement_id AND sa.user_id = auth.uid()
  )
);

-- Fase 2: Opprett storage bucket for avtale-dokumenter
INSERT INTO storage.buckets (id, name, public)
VALUES ('agreement-documents', 'agreement-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for agreement-documents bucket
CREATE POLICY "Admins can upload agreement documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'agreement-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update agreement documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'agreement-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete agreement documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'agreement-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view all agreement documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'agreement-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can view their own agreement documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'agreement-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);