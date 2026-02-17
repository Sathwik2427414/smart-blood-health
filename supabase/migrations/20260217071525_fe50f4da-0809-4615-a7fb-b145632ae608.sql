
-- Add component_type column to blood_units
ALTER TABLE public.blood_units ADD COLUMN component_type text NOT NULL DEFAULT 'Whole Blood';
