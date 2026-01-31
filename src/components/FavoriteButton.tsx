import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface FavoriteButtonProps {
  propertyId: string;
  variant?: "default" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const FavoriteButton = ({ 
  propertyId, 
  variant = "icon",
  size = "icon",
  className = ""
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, propertyId]);

  const checkFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user?.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: language === "fr" ? "Connexion requise" : "Login required",
        description: language === "fr"
          ? "Veuillez vous connecter pour sauvegarder des favoris"
          : "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: language === "fr" ? "Retiré des favoris" : "Removed from favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: language === "fr" ? "Ajouté aux favoris" : "Added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: language === "fr"
          ? "Impossible de modifier les favoris"
          : "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="secondary"
        size={size}
        onClick={toggleFavorite}
        disabled={loading}
        className={`bg-background/90 backdrop-blur-sm hover:bg-background ${className}`}
        aria-label={isFavorite 
          ? (language === "fr" ? "Retirer des favoris" : "Remove from favorites")
          : (language === "fr" ? "Ajouter aux favoris" : "Add to favorites")
        }
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
      )}
      {isFavorite 
        ? (language === "fr" ? "Favori" : "Favorited")
        : (language === "fr" ? "Ajouter aux favoris" : "Add to favorites")
      }
    </Button>
  );
};
