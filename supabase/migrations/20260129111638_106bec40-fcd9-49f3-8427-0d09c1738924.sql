-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;

-- Create a new policy that allows everyone to view active properties
CREATE POLICY "Active properties are viewable by everyone" 
ON public.properties 
FOR SELECT 
USING (status = 'active');

-- Create a policy that allows users to view ALL their own properties (including reserved/inactive)
CREATE POLICY "Users can view their own properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);