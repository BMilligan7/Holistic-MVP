-- Drop the existing constraint (assuming default name)
ALTER TABLE public.plans DROP CONSTRAINT plans_status_check;

-- Add the new constraint including 'pending'
ALTER TABLE public.plans ADD CONSTRAINT plans_status_check CHECK (status IN ('active', 'completed', 'abandoned', 'pending'));
