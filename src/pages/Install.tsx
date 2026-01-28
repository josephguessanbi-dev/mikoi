import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Wifi, Zap, CheckCircle, ArrowLeft } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Install = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: "Expérience native",
      description: "Utilisez MikoiCI comme une vraie application mobile"
    },
    {
      icon: Wifi,
      title: "Mode hors ligne",
      description: "Consultez vos annonces favorites même sans connexion"
    },
    {
      icon: Zap,
      title: "Chargement rapide",
      description: "L'application se charge instantanément depuis votre écran d'accueil"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Installez MikoiCI</h1>
            <p className="text-muted-foreground text-lg">
              Ajoutez MikoiCI à votre écran d'accueil pour une meilleure expérience
            </p>
          </motion.div>

          <div className="grid gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {isInstalled ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      Application installée !
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6 text-primary" />
                      Installer l'application
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {isInstalled 
                    ? "MikoiCI est déjà installée sur votre appareil"
                    : isInstallable 
                      ? "Cliquez sur le bouton ci-dessous pour installer"
                      : "Utilisez le menu de votre navigateur pour installer l'application"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                {isInstalled ? (
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Retour à l'accueil
                  </Button>
                ) : isInstallable ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" onClick={installApp} className="gap-2">
                      <Download className="w-5 h-5" />
                      Installer maintenant
                    </Button>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sur <strong>iOS</strong>: Appuyez sur le bouton Partager puis "Sur l'écran d'accueil"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sur <strong>Android</strong>: Appuyez sur le menu (⋮) puis "Installer l'application"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
