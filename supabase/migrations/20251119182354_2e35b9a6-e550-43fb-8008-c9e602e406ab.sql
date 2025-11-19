-- Add INSERT policy for admins to create jobs
CREATE POLICY "Admins can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add INSERT policy for service role (for automated job creation)
CREATE POLICY "Service role can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (true);