-- 1. Drop the broad profile contact leak policy
DROP POLICY IF EXISTS "Users can view property owner profiles for contact" ON public.profiles;

-- 2. Create a secure function to get property owner contact info
-- This function only returns contact info for a specific active property
CREATE OR REPLACE FUNCTION public.get_property_owner_contact(property_id UUID)
RETURNS TABLE (
  phone TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only return contact info if the property exists and is active
  RETURN QUERY
  SELECT p.phone, p.full_name
  FROM public.profiles p
  INNER JOIN public.properties prop ON prop.user_id = p.user_id
  WHERE prop.id = property_id
    AND prop.status = 'active';
END;
$$;

-- 3. Update handle_new_user_points to add validation
-- The trigger fires on profiles INSERT, and NEW.user_id should match auth.uid()
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
BEGIN
  -- Validate that the profile being created belongs to the authenticated user
  -- This prevents privilege escalation via manipulated user_id
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot create points for another user';
  END IF;

  -- Get user_type from the new profile row
  v_user_type := NEW.user_type;
  
  -- Give 6 points if not a client
  IF v_user_type IS NULL OR v_user_type != 'client' THEN
    INSERT INTO public.user_points (user_id, points)
    VALUES (NEW.user_id, 6);
  ELSE
    INSERT INTO public.user_points (user_id, points)
    VALUES (NEW.user_id, 0);
  END IF;
  
  RETURN NEW;
END;
$$;