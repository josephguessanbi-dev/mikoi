-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- =====================================================
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL,
  description text,
  description_en text,
  price_monthly integer NOT NULL DEFAULT 0, -- Prix en FCFA
  price_yearly integer, -- Prix annuel avec réduction
  max_listings integer, -- Nombre max d'annonces actives
  featured_listings_per_month integer DEFAULT 0, -- Annonces en vedette incluses
  priority_support boolean DEFAULT false,
  verified_badge boolean DEFAULT false,
  analytics_access boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  payment_reference text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Un utilisateur = un abonnement actif
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL, -- Optionnel: review liée à une propriété
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false, -- Review d'une transaction vérifiée
  status text DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_user_id, property_id) -- Un seul avis par reviewer/reviewed/property
);

-- =====================================================
-- USER VERIFICATION (KYC) TABLE
-- =====================================================
CREATE TABLE public.user_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'phone', 'email', 'agent_license', 'address')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  document_url text, -- URL du document soumis (CNI, license agent, etc.)
  verified_by uuid REFERENCES auth.users(id), -- Admin qui a vérifié
  verified_at timestamptz,
  rejection_reason text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - SUBSCRIPTION PLANS (public read)
-- =====================================================
CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.subscription_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - USER SUBSCRIPTIONS
-- =====================================================
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - REVIEWS
-- =====================================================
CREATE POLICY "Anyone can view published reviews"
  ON public.reviews FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != reviewed_user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - USER VERIFICATIONS
-- =====================================================
CREATE POLICY "Users can view their own verification"
  ON public.user_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification request"
  ON public.user_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications"
  ON public.user_verifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - FAVORITES
-- =====================================================
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON public.user_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- =====================================================
INSERT INTO public.subscription_plans (name, name_en, description, description_en, price_monthly, price_yearly, max_listings, featured_listings_per_month, priority_support, verified_badge, analytics_access) VALUES
  ('Gratuit', 'Free', 'Plan de base pour tous les utilisateurs', 'Basic plan for all users', 0, 0, 3, 0, false, false, false),
  ('Agent Pro', 'Agent Pro', 'Pour les agents immobiliers professionnels', 'For professional real estate agents', 15000, 150000, 20, 3, true, true, true),
  ('Agence Premium', 'Agency Premium', 'Pour les agences immobilières', 'For real estate agencies', 50000, 500000, 100, 10, true, true, true),
  ('Promoteur', 'Developer', 'Pour les promoteurs immobiliers', 'For real estate developers', 100000, 1000000, -1, 20, true, true, true);

-- =====================================================
-- FUNCTION: Get user average rating
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_rating(target_user_id uuid)
RETURNS TABLE(average_rating numeric, total_reviews integer)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::integer as total_reviews
  FROM public.reviews
  WHERE reviewed_user_id = target_user_id
    AND status = 'published';
END;
$$;

-- =====================================================
-- FUNCTION: Check if user has active premium subscription
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_premium_subscription(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = target_user_id
      AND us.status = 'active'
      AND us.current_period_end > now()
      AND sp.price_monthly > 0
  )
$$;

-- =====================================================
-- FUNCTION: Check if user is verified
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_user_verified(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_verifications
    WHERE user_id = target_user_id
      AND status = 'verified'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;