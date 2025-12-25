import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Legal = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">{t("legal.title")}</h1>

          <Tabs defaultValue="mentions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mentions">{t("legal.title")}</TabsTrigger>
              <TabsTrigger value="privacy">{t("legal.privacy")}</TabsTrigger>
              <TabsTrigger value="terms">{t("legal.terms")}</TabsTrigger>
            </TabsList>

            <TabsContent value="mentions">
              <Card>
                <CardHeader>
                  <CardTitle>{t("legal.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">{t("legal.company")}</h3>
                    <p className="text-muted-foreground">{t("legal.companyInfo")}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t("legal.rccm")}</h3>
                    <p className="text-muted-foreground">CI-ABJ-2024-X-XXXXX</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t("legal.address")}</h3>
                    <p className="text-muted-foreground">Abidjan, Côte d'Ivoire</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-muted-foreground">contact@mikoici.ci</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Directeur de publication</h3>
                    <p className="text-muted-foreground">Direction générale MikoiCI SARL</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>{t("legal.privacy")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Collecte des données</h3>
                    <p className="text-muted-foreground">
                      MikoiCI collecte uniquement les données nécessaires au fonctionnement du service : 
                      nom, email, téléphone et informations relatives aux annonces immobilières.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Utilisation des données</h3>
                    <p className="text-muted-foreground">
                      Vos données sont utilisées pour faciliter les transactions immobilières, 
                      améliorer nos services et vous contacter concernant vos annonces.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Protection des données</h3>
                    <p className="text-muted-foreground">
                      Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données 
                      contre tout accès non autorisé, modification, divulgation ou destruction.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Vos droits</h3>
                    <p className="text-muted-foreground">
                      Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
                      Contactez-nous à contact@mikoici.ci pour exercer vos droits.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle>{t("legal.terms")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Acceptation des conditions</h3>
                    <p className="text-muted-foreground">
                      En utilisant MikoiCI, vous acceptez les présentes conditions d'utilisation. 
                      Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Utilisation de la plateforme</h3>
                    <p className="text-muted-foreground">
                      MikoiCI est une plateforme de mise en relation. Nous ne sommes pas responsables 
                      des transactions effectuées entre utilisateurs. Chaque utilisateur est responsable 
                      de la véracité des informations qu'il publie.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Propriété intellectuelle</h3>
                    <p className="text-muted-foreground">
                      Le contenu de MikoiCI (textes, images, logos) est protégé par le droit d'auteur. 
                      Toute reproduction sans autorisation est interdite.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Responsabilité</h3>
                    <p className="text-muted-foreground">
                      MikoiCI s'efforce de maintenir la plateforme accessible mais ne peut garantir 
                      une disponibilité continue. Nous ne sommes pas responsables des dommages 
                      résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Legal;
