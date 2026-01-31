import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Building2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  price_monthly: number;
  price_yearly: number | null;
  max_listings: number | null;
  featured_listings_per_month: number;
  priority_support: boolean;
  verified_badge: boolean;
  analytics_access: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
}

const planIcons: Record<string, React.ElementType> = {
  "Gratuit": Sparkles,
  "Free": Sparkles,
  "Agent Pro": Crown,
  "Agence Premium": Building2,
  "Agency Premium": Building2,
  "Promoteur": Building2,
  "Developer": Building2,
};

const planGradients: Record<string, string> = {
  "Gratuit": "from-muted/50 to-muted/30",
  "Free": "from-muted/50 to-muted/30",
  "Agent Pro": "from-amber-500/20 to-orange-500/20",
  "Agence Premium": "from-purple-500/20 to-pink-500/20",
  "Agency Premium": "from-purple-500/20 to-pink-500/20",
  "Promoteur": "from-emerald-500/20 to-teal-500/20",
  "Developer": "from-emerald-500/20 to-teal-500/20",
};

export const SubscriptionPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      setCurrentSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSubscribing(planId);
    
    // TODO: Intégrer Paystack pour le paiement réel
    toast({
      title: language === "fr" ? "Fonctionnalité en développement" : "Feature in development",
      description: language === "fr" 
        ? "Le système de paiement pour les abonnements sera bientôt disponible."
        : "Subscription payment system will be available soon.",
    });
    
    setSubscribing(null);
  };

  const getPlanName = (plan: SubscriptionPlan) => {
    return language === "fr" ? plan.name : plan.name_en;
  };

  const getPlanDescription = (plan: SubscriptionPlan) => {
    return language === "fr" ? plan.description : plan.description_en;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const Icon = planIcons[plan.name] || Sparkles;
        const gradient = planGradients[plan.name] || "from-muted/50 to-muted/30";
        const isCurrentPlan = currentSubscription?.plan_id === plan.id;
        const isFree = plan.price_monthly === 0;
        const isPopular = plan.name === "Agent Pro";

        return (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col transition-all duration-300 hover:shadow-lg ${
              isCurrentPlan ? "ring-2 ring-primary" : ""
            } ${isPopular ? "border-primary" : ""}`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  {language === "fr" ? "Populaire" : "Popular"}
                </Badge>
              </div>
            )}
            
            <CardHeader className={`bg-gradient-to-br ${gradient} rounded-t-lg`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-background/80 p-2 rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{getPlanName(plan)}</CardTitle>
              </div>
              <CardDescription>{getPlanDescription(plan)}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pt-6">
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price_monthly.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">FCFA</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "/ mois" : "/ month"}
                </p>
                {plan.price_yearly && plan.price_yearly > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "fr" ? "ou" : "or"} {plan.price_yearly.toLocaleString()} FCFA/{language === "fr" ? "an" : "year"}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      -17%
                    </Badge>
                  </p>
                )}
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {plan.max_listings === -1 
                      ? (language === "fr" ? "Annonces illimitées" : "Unlimited listings")
                      : `${plan.max_listings} ${language === "fr" ? "annonces max" : "max listings"}`
                    }
                  </span>
                </li>
                {plan.featured_listings_per_month > 0 && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {plan.featured_listings_per_month} {language === "fr" ? "mises en avant/mois" : "featured/month"}
                    </span>
                  </li>
                )}
                {plan.verified_badge && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{language === "fr" ? "Badge vérifié" : "Verified badge"}</span>
                  </li>
                )}
                {plan.priority_support && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{language === "fr" ? "Support prioritaire" : "Priority support"}</span>
                  </li>
                )}
                {plan.analytics_access && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{language === "fr" ? "Statistiques avancées" : "Advanced analytics"}</span>
                  </li>
                )}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrentPlan ? "secondary" : isFree ? "outline" : "default"}
                disabled={isCurrentPlan || subscribing === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {subscribing === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isCurrentPlan 
                  ? (language === "fr" ? "Plan actuel" : "Current plan")
                  : isFree 
                    ? (language === "fr" ? "Gratuit" : "Free")
                    : (language === "fr" ? "Souscrire" : "Subscribe")
                }
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
