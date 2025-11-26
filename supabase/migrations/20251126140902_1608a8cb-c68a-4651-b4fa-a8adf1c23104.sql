-- Add opacity column to hero_images table
ALTER TABLE public.hero_images 
ADD COLUMN IF NOT EXISTS opacity numeric DEFAULT 0.7 CHECK (opacity >= 0 AND opacity <= 1);

COMMENT ON COLUMN public.hero_images.opacity IS 'Opacity/transparency level for the overlay gradient (0-1)';