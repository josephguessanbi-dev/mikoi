import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewFormProps {
  reviewedUserId: string;
  propertyId?: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ reviewedUserId, propertyId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: language === "fr" ? "Connexion requise" : "Login required",
        description: language === "fr" 
          ? "Veuillez vous connecter pour laisser un avis"
          : "Please log in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: language === "fr" ? "Note requise" : "Rating required",
        description: language === "fr"
          ? "Veuillez sélectionner une note"
          : "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        property_id: propertyId || null,
        rating,
        comment: comment.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: language === "fr" ? "Avis déjà existant" : "Review already exists",
            description: language === "fr"
              ? "Vous avez déjà laissé un avis pour cet utilisateur"
              : "You have already reviewed this user",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: language === "fr" ? "Avis publié" : "Review submitted",
          description: language === "fr"
            ? "Merci pour votre avis !"
            : "Thank you for your review!",
        });
        setRating(0);
        setComment("");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: language === "fr" ? "Erreur" : "Error",
        description: language === "fr"
          ? "Impossible de publier l'avis"
          : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.id === reviewedUserId) {
    return null; // Can't review yourself
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {language === "fr" ? "Laisser un avis" : "Leave a review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === "fr" ? "Votre note" : "Your rating"}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === "fr" ? "Votre commentaire (optionnel)" : "Your comment (optional)"}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                language === "fr"
                  ? "Partagez votre expérience..."
                  : "Share your experience..."
              }
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500
            </p>
          </div>

          <Button type="submit" disabled={loading || rating === 0}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {language === "fr" ? "Publier l'avis" : "Submit review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
