import { useState, useEffect } from "react";
import { BadgeCheck, Crown, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerificationBadgeProps {
  userId: string;
  showPremium?: boolean;
  size?: "sm" | "md" | "lg";
}

export const VerificationBadge = ({ userId, showPremium = true, size = "md" }: VerificationBadgeProps) => {
  const { language } = useLanguage();
  const [isVerified, setIsVerified] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, [userId]);

  const checkStatus = async () => {
    try {
      // Check verification status
      const { data: verificationData } = await supabase
        .rpc("is_user_verified", { target_user_id: userId });
      
      setIsVerified(verificationData === true);

      // Check premium status
      if (showPremium) {
        const { data: premiumData } = await supabase
          .rpc("has_premium_subscription", { target_user_id: userId });
        
        setIsPremium(premiumData === true);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (loading) {
    return null;
  }

  if (!isVerified && !isPremium) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {isVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <BadgeCheck className={`${sizeClasses[size]} text-blue-500`} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{language === "fr" ? "Identité vérifiée" : "Verified identity"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {isPremium && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Crown className={`${sizeClasses[size]} text-amber-500`} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{language === "fr" ? "Membre Premium" : "Premium member"}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

// Simple badge for display without verification check
export const TrustBadge = ({ 
  type, 
  size = "md" 
}: { 
  type: "verified" | "premium" | "agent"; 
  size?: "sm" | "md" | "lg";
}) => {
  const { language } = useLanguage();
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const badges = {
    verified: {
      icon: BadgeCheck,
      color: "text-blue-500",
      label: language === "fr" ? "Vérifié" : "Verified",
    },
    premium: {
      icon: Crown,
      color: "text-amber-500",
      label: language === "fr" ? "Premium" : "Premium",
    },
    agent: {
      icon: Shield,
      color: "text-emerald-500",
      label: language === "fr" ? "Agent certifié" : "Certified agent",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Icon className={`${sizeClasses[size]} ${badge.color}`} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{badge.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
