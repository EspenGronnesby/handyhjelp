-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));