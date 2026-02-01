-- Add status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));

-- Create user_warnings table
CREATE TABLE public.user_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_id uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_suspensions table
CREATE TABLE public.user_suspensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_id uuid NOT NULL,
  reason text NOT NULL,
  is_permanent boolean DEFAULT false,
  suspended_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  lifted_at timestamptz,
  lifted_by uuid
);

-- Create admin_audit_logs table
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  target_entity_type text,
  target_entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_warnings
CREATE POLICY "Users can view their own warnings" 
ON public.user_warnings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage warnings" 
ON public.user_warnings FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for user_suspensions
CREATE POLICY "Users can view their own suspensions" 
ON public.user_suspensions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage suspensions" 
ON public.user_suspensions FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for admin_audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs" 
ON public.admin_audit_logs FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Function to count user warnings
CREATE OR REPLACE FUNCTION public.get_user_warning_count(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.user_warnings
  WHERE user_id = target_user_id;
$$;

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_suspensions
    WHERE user_id = target_user_id
      AND lifted_at IS NULL
      AND (is_permanent = true OR suspended_until > now())
  );
$$;