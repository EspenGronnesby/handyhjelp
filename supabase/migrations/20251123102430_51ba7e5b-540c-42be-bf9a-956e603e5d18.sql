-- Add category field to projects table
ALTER TABLE public.projects 
ADD COLUMN category text;

-- Add check constraint for valid categories
ALTER TABLE public.projects
ADD CONSTRAINT projects_category_check 
CHECK (category IN ('vaktmester', 'tomrer', 'blikk'));

-- Set default category to vaktmester for existing projects
UPDATE public.projects 
SET category = 'vaktmester' 
WHERE category IS NULL;

-- Make category required
ALTER TABLE public.projects 
ALTER COLUMN category SET NOT NULL;