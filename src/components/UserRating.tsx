import { useState, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserRatingProps {
  userId: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

interface RatingData {
  average_rating: number;
  total_reviews: number;
}

export const UserRating = ({ userId, showCount = true, size = "md" }: UserRatingProps) => {
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [userId]);

  const fetchRating = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_user_rating", { target_user_id: userId });

      if (error) throw error;
      if (data && data.length > 0) {
        setRating(data[0]);
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-4 w-20 rounded" />;
  }

  if (!rating || rating.total_reviews === 0) {
    return (
      <span className={`text-muted-foreground ${textClasses[size]}`}>
        Pas encore d'avis
      </span>
    );
  }

  const fullStars = Math.floor(rating.average_rating);
  const hasHalfStar = rating.average_rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
          />
        ))}
        {hasHalfStar && (
          <StarHalf
            className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-muted-foreground/30`}
          />
        ))}
      </div>
      <span className={`font-medium ${textClasses[size]}`}>
        {rating.average_rating}
      </span>
      {showCount && (
        <span className={`text-muted-foreground ${textClasses[size]}`}>
          ({rating.total_reviews} avis)
        </span>
      )}
    </div>
  );
};
