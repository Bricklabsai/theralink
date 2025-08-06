-- Create a secure function to get current user role to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Update database functions to have secure search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );

  -- Create a wallet for the user
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);

  -- If the user is a therapist, create a therapist profile
  IF COALESCE(new.raw_user_meta_data->>'role', 'client') = 'therapist' THEN
    INSERT INTO public.therapists (id)
    VALUES (new.id);
  END IF;

  RETURN new;
END;
$$;

-- Secure the therapist details function
CREATE OR REPLACE FUNCTION public.insert_therapist_details(p_therapist_id uuid, p_education text, p_license_number text, p_license_type text, p_therapy_approaches text, p_languages text, p_insurance_info text, p_session_formats text, p_has_insurance boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validate input parameters
    IF p_therapist_id IS NULL THEN
        RAISE EXCEPTION 'Therapist ID cannot be null';
    END IF;

    -- Upsert operation (insert or update)
    INSERT INTO public.therapist_details (
        therapist_id, 
        education, 
        license_number, 
        license_type, 
        therapy_approaches, 
        languages, 
        insurance_info, 
        session_formats, 
        has_insurance,
        updated_at
    )
    VALUES (
        p_therapist_id, 
        p_education, 
        p_license_number, 
        p_license_type, 
        p_therapy_approaches, 
        p_languages, 
        p_insurance_info, 
        p_session_formats, 
        p_has_insurance,
        NOW()
    )
    ON CONFLICT (therapist_id) DO UPDATE
    SET 
        education = EXCLUDED.education,
        license_number = EXCLUDED.license_number,
        license_type = EXCLUDED.license_type,
        therapy_approaches = EXCLUDED.therapy_approaches,
        languages = EXCLUDED.languages,
        insurance_info = EXCLUDED.insurance_info,
        session_formats = EXCLUDED.session_formats,
        has_insurance = EXCLUDED.has_insurance,
        updated_at = NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- Add role change audit log table
CREATE TABLE IF NOT EXISTS public.role_change_audit (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    old_role text,
    new_role text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now(),
    reason text
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role change audit" ON public.role_change_audit
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Function to safely change user roles with audit
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role text, reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    old_role text;
    current_user_role text;
BEGIN
    -- Get current user's role
    current_user_role := public.get_current_user_role();
    
    -- Only admins can change roles
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
    
    -- Get the old role
    SELECT role INTO old_role FROM public.profiles WHERE id = target_user_id;
    
    IF old_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Validate new role
    IF new_role NOT IN ('client', 'therapist', 'admin', 'friend') THEN
        RAISE EXCEPTION 'Invalid role specified';
    END IF;
    
    -- Update the role
    UPDATE public.profiles 
    SET role = new_role, updated_at = now()
    WHERE id = target_user_id;
    
    -- Log the change
    INSERT INTO public.role_change_audit (user_id, old_role, new_role, changed_by, reason)
    VALUES (target_user_id, old_role, new_role, auth.uid(), reason);
    
    RETURN true;
END;
$$;

-- Add stronger RLS policy to prevent unauthorized role changes
CREATE POLICY "Prevent unauthorized role escalation" ON public.profiles
FOR UPDATE USING (
    -- Users can only update their own profile
    auth.uid() = id AND
    -- If they're changing the role, they must be an admin
    (OLD.role = NEW.role OR public.get_current_user_role() = 'admin')
);