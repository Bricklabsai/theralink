-- Add sequential ID column to therapists table for pretty URLs
ALTER TABLE public.therapists ADD COLUMN sequential_id SERIAL UNIQUE;

-- Create a function to automatically assign sequential IDs
CREATE OR REPLACE FUNCTION assign_sequential_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign sequential_id if it's not already set
  IF NEW.sequential_id IS NULL THEN
    NEW.sequential_id = COALESCE((SELECT MAX(sequential_id) FROM public.therapists), 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign sequential IDs
CREATE TRIGGER therapist_sequential_id_trigger
  BEFORE INSERT ON public.therapists
  FOR EACH ROW
  EXECUTE FUNCTION assign_sequential_id();

-- Update existing records with sequential IDs
UPDATE public.therapists 
SET sequential_id = row_number() OVER (ORDER BY created_at)
WHERE sequential_id IS NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_therapists_sequential_id ON public.therapists(sequential_id);