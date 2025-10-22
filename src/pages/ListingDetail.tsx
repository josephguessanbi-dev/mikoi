import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Bed, Maximize, Phone, MessageSquare, Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  district: string | null;
  property_type: string;
  listing_type: string;
  bedrooms: number | null;
  surface: number | null;
  images: string[];
}

const ListingDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'annonce",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Annonce non trouvée</p>
          <div className="flex justify-center mt-4">
            <Link to="/listings">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux annonces
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/listings">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux annonces
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-primary/90 backdrop-blur-sm">
                  {property.property_type}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/90 backdrop-blur-sm">
                  {property.listing_type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{property.city}{property.district && `, ${property.district}`}</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms} chambres</span>
                  </div>
                )}
                {property.surface && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    <span>{property.surface}m²</span>
                  </div>
                )}
              </div>
            </div>

            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-6">
                    {property.price.toLocaleString()} FCFA
                    {property.listing_type === "location" && <span className="text-lg">/mois</span>}
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" variant="hero">
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler
                    </Button>
                    <Button className="w-full" size="lg" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
