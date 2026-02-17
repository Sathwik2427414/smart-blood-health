
-- Make blood_unit_id nullable since lab tests from predictions don't always have a blood unit
ALTER TABLE public.lab_tests ALTER COLUMN blood_unit_id DROP NOT NULL;

-- Drop the existing foreign key constraint
ALTER TABLE public.lab_tests DROP CONSTRAINT IF EXISTS lab_tests_blood_unit_id_fkey;
