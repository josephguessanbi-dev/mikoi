import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface WhatsAppSupportProps {
  variant?: "default" | "floating" | "inline";
  className?: string;
}

// Configuration: Numéro de support MikoiCI
const SUPPORT_PHONE = "2250705933566"; // +225 07 05 93 35 66

export const WhatsAppSupport = ({ variant = "floating", className = "" }: WhatsAppSupportProps) => {
  const { language } = useLanguage();

  const handleClick = () => {
    const message = encodeURIComponent(
      language === "fr"
        ? "Bonjour, j'ai besoin d'aide concernant MikoiCI"
        : "Hello, I need help with MikoiCI"
    );
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${message}`, "_blank");
  };

  if (variant === "floating") {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group ${className}`}
        aria-label={language === "fr" ? "Contacter le support WhatsApp" : "Contact WhatsApp support"}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-card-foreground px-3 py-2 rounded-lg shadow-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {language === "fr" ? "Besoin d'aide ?" : "Need help?"}
        </span>
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        className={`gap-2 ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        {language === "fr" ? "Support WhatsApp" : "WhatsApp Support"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className={`bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {language === "fr" ? "Contacter le support" : "Contact support"}
    </Button>
  );
};
