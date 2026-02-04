import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Wifi, Zap, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion } from "framer-motion";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const InstallPromptDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  useEffect(() => {
    // Check if we should show the prompt
    const checkShouldShow = () => {
      if (isInstalled) return false;
      
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          return false;
        }
      }
      
      return isInstallable;
    };

    // Show after a short delay to not interrupt the user immediately
    const timer = setTimeout(() => {
      if (checkShouldShow()) {
        setIsOpen(true);
      }
    }, 2000); // 2 seconds delay for faster visibility

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsOpen(false);
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsOpen(false);
    }
  };

  const features = [
    { icon: Smartphone, text: "Expérience native sur votre téléphone" },
    { icon: Wifi, text: "Accès hors ligne aux favoris" },
    { icon: Zap, text: "Chargement ultra-rapide" },
  ];

  if (isInstalled || !isInstallable) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            Installez MikoiCI
          </DialogTitle>
          <DialogDescription>
            Ajoutez l'application à votre écran d'accueil pour une meilleure expérience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleInstall} className="w-full gap-2" size="lg">
            <Download className="w-4 h-4" />
            Installer maintenant
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPromptDialog;
