import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { ArrowRight, Shield, MapPin, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { mockProperties } from "@/data/mockProperties";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const featuredProperties = mockProperties.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative z-20 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium">
              <MapPin className="w-4 h-4" />
              <span>Immobilier en Côte d'Ivoire</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Trouvez votre
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> maison idéale </span>
              en Côte d'Ivoire
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              La plateforme n°1 pour louer, acheter ou vendre votre bien immobilier en toute confiance
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/listings">
                  Explorer les annonces
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/publish">
                  Publier une annonce
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5000+", label: "Annonces actives" },
              { value: "15+", label: "Villes couvertes" },
              { value: "3000+", label: "Clients satisfaits" },
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
            <h2 className="text-3xl md:text-4xl font-bold">Annonces à la une</h2>
            <p className="text-muted-foreground text-lg">
              Découvrez notre sélection des meilleures offres du moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
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
                title: "Sécurisé et vérifié",
                description: "Toutes les annonces sont vérifiées par notre équipe pour garantir votre sécurité",
              },
              {
                icon: MapPin,
                title: "Partout en Côte d'Ivoire",
                description: "Des milliers d'annonces dans toutes les grandes villes du pays",
              },
              {
                icon: TrendingUp,
                title: "Prix transparents",
                description: "Des prix justes et transparents sans frais cachés",
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
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-white shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à trouver votre futur logement ?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'Ivoiriens qui ont trouvé leur maison idéale sur MikoiCI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/listings">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 MikoiCI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
