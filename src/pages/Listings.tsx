import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { mockProperties } from "@/data/mockProperties";

const Listings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Toutes les annonces</h1>
          <p className="text-muted-foreground text-lg">
            {mockProperties.length} propriétés disponibles
          </p>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;
