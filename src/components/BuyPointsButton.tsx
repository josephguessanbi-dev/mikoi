import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BuyPointsButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const BuyPointsButton = ({ onSuccess, className }: BuyPointsButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBuyPoints = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour acheter des points",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("buy-points", {
        body: { points_package: 30 },
      });

      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de l'achat de points:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'initier l'achat de points",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyPoints}
      disabled={loading}
      className={className}
      variant="default"
    >
      <Coins className="w-4 h-4 mr-2" />
      {loading ? "Chargement..." : "Acheter 30 points - 5000 FCFA"}
    </Button>
  );
};
