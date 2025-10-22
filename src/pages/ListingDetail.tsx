import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockProperties } from "@/data/mockProperties";
import { ArrowLeft, MapPin, BedDouble, Square, Phone, MessageCircle, Share2, Heart } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams();
  const property = mockProperties.find(p => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Annonce non trouvée</h1>
          <Button asChild>
            <Link to="/listings">Retour aux annonces</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/listings">
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image principale */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/10]">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                {property.type === "location" ? "À louer" : "À vendre"}
              </Badge>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" className="bg-background/80 hover:bg-background">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-background/80 hover:bg-background">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Détails */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{property.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-primary" />
                  <span>{property.bedrooms} chambres</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-primary" />
                  <span>{property.surface}m²</span>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features?.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prix</p>
                  <p className="text-4xl font-bold text-primary">{property.price}</p>
                  <p className="text-sm text-muted-foreground">FCFA / mois</p>
                </div>

                <div className="space-y-3">
                  <Button variant="hero" size="lg" className="w-full">
                    <Phone className="w-5 h-5" />
                    Appeler
                  </Button>
                  <Button variant="secondary" size="lg" className="w-full">
                    <MessageCircle className="w-5 h-5" />
                    Envoyer un message
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3">Propriétaire</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      JD
                    </div>
                    <div>
                      <p className="font-medium">Jean Dupont</p>
                      <p className="text-sm text-muted-foreground">Agence immobilière</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
