-- Allow authenticated users to view profile info for property owners (for contact purposes)
-- This is a limited access for property contact functionality
CREATE POLICY "Users can view property owner profiles for contact" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.user_id = profiles.user_id 
    AND properties.status = 'active'
  )
);