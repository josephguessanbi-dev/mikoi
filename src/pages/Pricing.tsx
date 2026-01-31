import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Zap, Shield, Headphones } from "lucide-react";

const Pricing = () => {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: Zap,
      title: language === "fr" ? "Visibilité maximale" : "Maximum visibility",
      description: language === "fr"
        ? "Vos annonces en tête des résultats de recherche"
        : "Your listings at the top of search results",
    },
    {
      icon: Shield,
      title: language === "fr" ? "Badge vérifié" : "Verified badge",
      description: language === "fr"
        ? "Gagnez la confiance des acheteurs avec un profil certifié"
        : "Gain buyer trust with a certified profile",
    },
    {
      icon: Headphones,
      title: language === "fr" ? "Support prioritaire" : "Priority support",
      description: language === "fr"
        ? "Une équipe dédiée pour vous accompagner"
        : "A dedicated team to support you",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === "fr" 
              ? "Choisissez votre plan"
              : "Choose your plan"
            }
          </h1>
          <p className="text-xl text-muted-foreground">
            {language === "fr"
              ? "Des forfaits adaptés à vos besoins pour développer votre activité immobilière"
              : "Plans tailored to your needs to grow your real estate business"
            }
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-card rounded-xl border">
              <div className="bg-primary/10 p-3 rounded-full">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {language === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
          </h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">
                {language === "fr"
                  ? "Puis-je changer de plan à tout moment ?"
                  : "Can I change my plan at any time?"
                }
              </h3>
              <p className="text-muted-foreground">
                {language === "fr"
                  ? "Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement prend effet immédiatement."
                  : "Yes, you can upgrade to a higher plan at any time. The change takes effect immediately."
                }
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">
                {language === "fr"
                  ? "Quels moyens de paiement acceptez-vous ?"
                  : "What payment methods do you accept?"
                }
              </h3>
              <p className="text-muted-foreground">
                {language === "fr"
                  ? "Nous acceptons Mobile Money (Orange, MTN, Wave), les cartes bancaires et les virements bancaires."
                  : "We accept Mobile Money (Orange, MTN, Wave), bank cards, and bank transfers."
                }
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">
                {language === "fr"
                  ? "Y a-t-il un engagement de durée ?"
                  : "Is there a commitment period?"
                }
              </h3>
              <p className="text-muted-foreground">
                {language === "fr"
                  ? "Non, vous pouvez annuler votre abonnement à tout moment. Aucun engagement de durée."
                  : "No, you can cancel your subscription at any time. No commitment period."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
