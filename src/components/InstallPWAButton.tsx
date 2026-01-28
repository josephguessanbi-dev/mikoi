import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface InstallPWAButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

const InstallPWAButton = ({ 
  variant = "default", 
  size = "sm",
  showText = true,
  className = ""
}: InstallPWAButtonProps) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const { t } = useLanguage();

  if (isInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-1 text-green-600 text-sm ${className}`}
      >
        <CheckCircle className="w-4 h-4" />
        {showText && <span className="hidden md:inline">Installé</span>}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant={variant}
            size={size}
            onClick={installApp}
            className={`gap-1 ${className}`}
          >
            <Download className="w-4 h-4" />
            {showText && <span className="hidden md:inline">Installer l'app</span>}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWAButton;
