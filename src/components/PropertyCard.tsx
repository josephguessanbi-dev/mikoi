import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Square, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  surface: number;
  image: string;
  type: "location" | "vente";
}

const PropertyCard = ({ id, title, price, location, bedrooms, surface, image, type }: PropertyCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-card transition-all duration-300 bg-gradient-to-br from-card to-card/80">
      <Link to={`/listing/${id}`}>
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
            {type === "location" ? "À louer" : "À vendre"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <Link to={`/listing/${id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4" />
            <span>{bedrooms} ch</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{surface}m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">{price}</p>
          <p className="text-xs text-muted-foreground">FCFA / mois</p>
        </div>
        <Link to={`/listing/${id}`}>
          <Button variant="secondary" size="sm">
            Voir détails
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
