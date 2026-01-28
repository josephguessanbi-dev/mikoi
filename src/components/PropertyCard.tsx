import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Square, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, memo } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  surface: number;
  image: string;
  type: "location" | "vente";
  index?: number;
}

const PropertyCard = memo(({ id, title, price, location, bedrooms, surface, image, type, index = 0 }: PropertyCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border/50">
        <Link to={`/listing/${id}`}>
          <div className="relative overflow-hidden aspect-[4/3] bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img
              src={image}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground shadow-md">
              {type === "location" ? "À louer" : "À vendre"}
            </Badge>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3"
            >
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 hover:bg-background backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart 
                  className={`w-5 h-5 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`} 
                />
              </Button>
            </motion.div>
          </div>
        </Link>

        <CardContent className="p-4 space-y-3">
          <Link to={`/listing/${id}`}>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
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
            <p className="text-2xl font-bold text-primary">
              {Number(price).toLocaleString("fr-FR")}
            </p>
            <p className="text-xs text-muted-foreground">
              FCFA{type === "location" ? " / mois" : ""}
            </p>
          </div>
          <Link to={`/listing/${id}`}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" size="sm">
                Voir détails
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

PropertyCard.displayName = "PropertyCard";

export default PropertyCard;
