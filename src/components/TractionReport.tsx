import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText, TrendingUp, Users, Building, MapPin, Star, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TractionStats {
  totalUsers: number;
  totalProperties: number;
  totalCities: number;
  activeListings: number;
  verifiedUsers: number;
  averageRating: number;
  totalReviews: number;
}

const TractionReport = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["traction-stats"],
    queryFn: async (): Promise<TractionStats> => {
      const [
        { count: totalUsers },
        { count: totalProperties },
        { data: cities },
        { count: activeListings },
        { count: verifiedUsers },
        { data: reviews },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("city").eq("status", "active"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("user_verifications").select("*", { count: "exact", head: true }).eq("status", "verified"),
        supabase.from("reviews").select("rating").eq("status", "published"),
      ]);

      const uniqueCities = new Set(cities?.map((p) => p.city) || []);
      const avgRating = reviews?.length 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

      return {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        totalCities: uniqueCities.size,
        activeListings: activeListings || 0,
        verifiedUsers: verifiedUsers || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews?.length || 0,
      };
    },
    enabled: isOpen,
  });

  const generateReport = () => {
    if (!stats) return;

    const reportDate = format(new Date(), "d MMMM yyyy", { locale: fr });
    
    const reportContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Traction MikoiCI - ${reportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; color: white; }
    .header h1 { font-size: 32px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-card .label { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .stat-card .value { font-size: 36px; font-weight: 700; color: #6366f1; }
    .stat-card .description { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h2 { font-size: 18px; margin-bottom: 16px; color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
    .section ul { list-style: none; }
    .section li { padding: 8px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    .section li:last-child { border-bottom: none; }
    .highlight { color: #6366f1; font-weight: 600; }
    .footer { text-align: center; margin-top: 40px; padding: 20px; color: #64748b; font-size: 12px; }
    .badge { display: inline-block; padding: 4px 12px; background: #6366f1; color: white; border-radius: 20px; font-size: 12px; font-weight: 500; }
    @media print { body { background: white; } .container { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Rapport Traction</h1>
      <p>MikoiCI - Plateforme Immobilière en Côte d'Ivoire</p>
      <p style="margin-top: 12px;"><span class="badge">Généré le ${reportDate}</span></p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">👥 Utilisateurs inscrits</div>
        <div class="value">${stats.totalUsers.toLocaleString('fr-FR')}</div>
        <div class="description">Comptes créés sur la plateforme</div>
      </div>
      <div class="stat-card">
        <div class="label">🏠 Annonces publiées</div>
        <div class="value">${stats.totalProperties.toLocaleString('fr-FR')}</div>
        <div class="description">${stats.activeListings} annonces actives</div>
      </div>
      <div class="stat-card">
        <div class="label">📍 Villes couvertes</div>
        <div class="value">${stats.totalCities}</div>
        <div class="description">Présence nationale</div>
      </div>
      <div class="stat-card">
        <div class="label">⭐ Note moyenne</div>
        <div class="value">${stats.averageRating}/5</div>
        <div class="description">${stats.totalReviews} avis vérifiés</div>
      </div>
    </div>

    <div class="section">
      <h2>🎯 Indicateurs Clés</h2>
      <ul>
        <li>
          <span>Taux de conversion visiteur → inscription</span>
          <span class="highlight">En croissance</span>
        </li>
        <li>
          <span>Utilisateurs vérifiés (KYC)</span>
          <span class="highlight">${stats.verifiedUsers}</span>
        </li>
        <li>
          <span>Annonces par utilisateur (moyenne)</span>
          <span class="highlight">${stats.totalUsers > 0 ? (stats.totalProperties / stats.totalUsers).toFixed(1) : 0}</span>
        </li>
        <li>
          <span>Couverture géographique</span>
          <span class="highlight">${stats.totalCities} villes</span>
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>🚀 Points Forts</h2>
      <ul>
        <li>
          <span>✅ Application PWA installable</span>
          <span class="highlight">Mobile-first</span>
        </li>
        <li>
          <span>✅ Système de vérification KYC</span>
          <span class="highlight">Confiance</span>
        </li>
        <li>
          <span>✅ Paiement intégré (Paystack)</span>
          <span class="highlight">Monétisation</span>
        </li>
        <li>
          <span>✅ Système d'avis et notation</span>
          <span class="highlight">Social Proof</span>
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>📈 Prochaines Étapes</h2>
      <ul>
        <li>
          <span>Acquisition utilisateurs</span>
          <span>Marketing digital ciblé</span>
        </li>
        <li>
          <span>Partenariats agences</span>
          <span>B2B expansion</span>
        </li>
        <li>
          <span>Notifications push</span>
          <span>Engagement</span>
        </li>
      </ul>
    </div>

    <div class="footer">
      <p><strong>MikoiCI</strong> - La plateforme n°1 pour l'immobilier en Côte d'Ivoire</p>
      <p style="margin-top: 8px;">© ${new Date().getFullYear()} MikoiCI. Tous droits réservés.</p>
      <p style="margin-top: 8px;">Contact : support@mikoici.com</p>
    </div>
  </div>
</body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([reportContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MikoiCI_Rapport_Traction_${format(new Date(), "yyyy-MM-dd")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statItems = stats ? [
    { icon: Users, label: "Utilisateurs", value: stats.totalUsers },
    { icon: Building, label: "Annonces", value: stats.totalProperties },
    { icon: MapPin, label: "Villes", value: stats.totalCities },
    { icon: Star, label: "Note moyenne", value: `${stats.averageRating}/5` },
    { icon: Shield, label: "Vérifiés", value: stats.verifiedUsers },
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Rapport Traction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Rapport Traction MikoiCI
          </DialogTitle>
          <DialogDescription>
            Téléchargez un rapport complet des statistiques de la plateforme
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {statItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Le rapport inclut tous les indicateurs clés, les points forts de la plateforme et les prochaines étapes stratégiques.
                </p>
                <Button onClick={generateReport} className="w-full gap-2" size="lg">
                  <Download className="w-4 h-4" />
                  Télécharger le rapport
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TractionReport;
