import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  amount: number;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: () => void;
  className?: string;
}

export const PaymentButton = ({ 
  amount, 
  description, 
  metadata = {}, 
  onSuccess,
  className 
}: PaymentButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user?.email) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour effectuer un paiement",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Initialiser le paiement via notre edge function
      // Note: email and user_id are now extracted from the auth token server-side
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          amount: amount,
          metadata: {
            ...metadata,
            description: description,
          },
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Rediriger vers Paystack pour le paiement
        window.location.href = data.authorization_url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error: any) {
      console.error('Erreur de paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      <CreditCard className="w-4 h-4 mr-2" />
      {loading ? "Initialisation..." : `Payer ${amount.toLocaleString()} FCFA`}
    </Button>
  );
};
