-- Create service_agreements table for storing service contract requests
CREATE TABLE public.service_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('borettslag', 'bedrift', 'annet')),
  units_count INTEGER,
  total_area INTEGER,
  address TEXT NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  other_services TEXT,
  frequency TEXT NOT NULL,
  fixed_contact_person BOOLEAN NOT NULL DEFAULT false,
  contract_duration TEXT NOT NULL,
  start_date DATE,
  current_situation TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'offer_sent', 'contract_signed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_agreements ENABLE ROW LEVEL SECURITY;

-- Admins can view all agreements
CREATE POLICY "Admins can view all agreements"
ON public.service_agreements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all agreements
CREATE POLICY "Admins can update all agreements"
ON public.service_agreements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert agreements (for public form submissions)
CREATE POLICY "Anyone can insert agreements"
ON public.service_agreements
FOR INSERT
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_service_agreements_updated_at
BEFORE UPDATE ON public.service_agreements
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();