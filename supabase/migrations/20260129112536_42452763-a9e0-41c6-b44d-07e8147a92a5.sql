-- 1. Fix profiles table: Remove public access, allow users to view their own profile
-- Admins can view all profiles for dashboard
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix user_points: Remove user UPDATE policy - only service role/admin can update points
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;

CREATE POLICY "Admins can update user points" 
ON public.user_points 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix points_transactions: Explicitly deny user inserts, allow admin only
CREATE POLICY "Only admins can insert transactions" 
ON public.points_transactions 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Add admin-only policies for properties management
CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all properties" 
ON public.properties 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all properties" 
ON public.properties 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add admin policy for viewing all points
CREATE POLICY "Admins can view all user points" 
ON public.user_points 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Add admin policy for viewing all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.points_transactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));