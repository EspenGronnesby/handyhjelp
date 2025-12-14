-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  invoice_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id),
  UNIQUE(invoice_number)
);

-- Create invoice_requests table
CREATE TABLE public.invoice_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id)
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_requests ENABLE ROW LEVEL SECURITY;

-- RLS for invoices
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoices"
ON public.invoices FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert invoices"
ON public.invoices FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invoices"
ON public.invoices FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for invoice_requests
CREATE POLICY "Users can view their own invoice requests"
ON public.invoice_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice requests"
ON public.invoice_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all invoice requests"
ON public.invoice_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invoice requests"
ON public.invoice_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

-- Storage policies
CREATE POLICY "Users can view their own invoices files"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can upload invoice files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invoice files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoice files"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for invoice_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_requests;