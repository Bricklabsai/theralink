-- Update default currency to KSH across the platform
UPDATE public.therapists 
SET preferred_currency = 'KSH' 
WHERE preferred_currency IN ('NGN', 'USD', 'N/A');

UPDATE public.booking_requests 
SET currency = 'KSH' 
WHERE currency IN ('NGN', 'USD');

UPDATE public.payment_intents 
SET currency = 'KSH' 
WHERE currency IN ('NGN', 'USD');

-- Update default values for new records
ALTER TABLE public.therapists 
ALTER COLUMN preferred_currency SET DEFAULT 'KSH';

ALTER TABLE public.booking_requests 
ALTER COLUMN currency SET DEFAULT 'KSH';

ALTER TABLE public.payment_intents 
ALTER COLUMN currency SET DEFAULT 'KSH';