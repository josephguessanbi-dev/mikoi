import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home } from "lucide-react";

interface SearchBarProps {
  onSearch: (filters: { city: string; propertyType: string; maxPrice: string }) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    onSearch({ city, propertyType, maxPrice });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ville
            </label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abidjan">Abidjan</SelectItem>
                <SelectItem value="bouake">Bouaké</SelectItem>
                <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
                <SelectItem value="san-pedro">San Pedro</SelectItem>
                <SelectItem value="korhogo">Korhogo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Home className="w-4 h-4" />
              Type de bien
            </label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appartement">Appartement</SelectItem>
                <SelectItem value="maison">Maison</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Budget Max
            </label>
            <Input
              type="number"
              placeholder="Ex: 500000 FCFA"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={handleSearch}>
          <Search className="w-5 h-5" />
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
