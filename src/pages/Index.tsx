import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { ArrowRight, Shield, MapPin, TrendingUp, Home } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string | null;
  bedrooms: number | null;
  surface: number | null;
  images: string[];
  property_type: string;
  listing_type: string;
}

const Index = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des annonces:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/40 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
              <MapPin className="w-4 h-4" />
              <span>Immobilier en Côte d'Ivoire</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t("home.hero.title")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="default" size="lg" asChild>
                <Link to="/listings">
                  {t("home.hero.cta")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/publish">
                  {t("home.hero.publish")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <SearchBar onSearch={() => {}} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5000+", label: t("home.stats.listings") },
              { value: "15+", label: t("home.stats.cities") },
              { value: "3000+", label: t("home.stats.clients") },
              { value: "100%", label: "Sécurisé" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{t("home.featured.title")}</h2>
            <p className="text-muted-foreground text-lg">
              Découvrez notre sélection des meilleures offres du moment
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des annonces...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
              <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune annonce disponible</h3>
              <p className="text-muted-foreground mb-6">
                Soyez le premier à publier une annonce sur notre plateforme !
              </p>
              <Button asChild>
                <Link to="/publish">
                  Publier une annonce
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    price={property.price.toString()}
                    location={`${property.city}${property.district ? ", " + property.district : ""}`}
                    bedrooms={property.bedrooms || 0}
                    surface={property.surface || 0}
                    image={property.images?.[0] || "/placeholder.svg"}
                    type={property.listing_type as "location" | "vente"}
                  />
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/listings">
                    Voir toutes les annonces
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Pourquoi choisir MikoiCI ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme moderne et sécurisée pour tous vos besoins immobiliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: t("home.features.secure"),
                description: t("home.features.secure.desc"),
              },
              {
                icon: MapPin,
                title: t("home.features.coverage"),
                description: t("home.features.coverage.desc"),
              },
              {
                icon: TrendingUp,
                title: t("home.features.transparent"),
                description: t("home.features.transparent.desc"),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-xl bg-card shadow-card hover:shadow-glow transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/listings">
                  {t("home.cta.button")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
