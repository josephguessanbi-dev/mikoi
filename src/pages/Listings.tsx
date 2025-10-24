import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Listings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    maxPrice: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (filters.city) {
        query = query.eq("city", filters.city);
      }
      if (filters.propertyType) {
        query = query.eq("property_type", filters.propertyType);
      }
      if (filters.maxPrice) {
        query = query.lte("price", parseFloat(filters.maxPrice));
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Toutes les annonces</h1>
          <p className="text-muted-foreground text-lg">
            {properties.length} propriétés disponibles
          </p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={setFilters} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des annonces...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune annonce trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price.toString()}
                location={`${property.city}${property.district ? ", " + property.district : ""}`}
                bedrooms={property.bedrooms || 0}
                surface={property.surface || 0}
                image={property.images[0] || "/placeholder.svg"}
                type={property.listing_type as "location" | "vente"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
