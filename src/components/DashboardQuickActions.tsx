import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlusCircle, 
  Home, 
  Search, 
  Coins, 
  MapPin, 
  Key, 
  Building2,
  TrendingUp
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count?: number;
  countLabel?: string;
  gradient: string;
  iconColor: string;
}

interface DashboardQuickActionsProps {
  totalProperties: number;
  activeProperties: number;
  forSale: number;
  forRent: number;
  points: number;
}

export const DashboardQuickActions = ({
  totalProperties,
  activeProperties,
  forSale,
  forRent,
  points,
}: DashboardQuickActionsProps) => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Publier une annonce",
      description: "Créez une nouvelle annonce immobilière",
      icon: PlusCircle,
      href: "/publish",
      gradient: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-600",
    },
    {
      title: "Mes Biens",
      description: "Gérez vos propriétés publiées",
      icon: Home,
      href: "#my-properties",
      count: totalProperties,
      countLabel: totalProperties === 1 ? "bien" : "biens",
      gradient: "from-blue-500/20 to-indigo-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Annonces Actives",
      description: "Vos annonces visibles en ligne",
      icon: TrendingUp,
      href: "#my-properties",
      count: activeProperties,
      countLabel: activeProperties === 1 ? "annonce" : "annonces",
      gradient: "from-purple-500/20 to-violet-500/10",
      iconColor: "text-purple-600",
    },
    {
      title: "Biens à Vendre",
      description: "Propriétés en vente",
      icon: Building2,
      href: "/listings?type=vente",
      count: forSale,
      countLabel: forSale === 1 ? "propriété" : "propriétés",
      gradient: "from-orange-500/20 to-amber-500/10",
      iconColor: "text-orange-600",
    },
    {
      title: "Biens en Location",
      description: "Propriétés à louer",
      icon: Key,
      href: "/listings?type=location",
      count: forRent,
      countLabel: forRent === 1 ? "propriété" : "propriétés",
      gradient: "from-teal-500/20 to-cyan-500/10",
      iconColor: "text-teal-600",
    },
    {
      title: "Mes Points",
      description: "Solde disponible pour publier",
      icon: Coins,
      href: "#points",
      count: points,
      countLabel: points === 1 ? "point" : "points",
      gradient: "from-yellow-500/20 to-amber-500/10",
      iconColor: "text-yellow-600",
    },
    {
      title: "Explorer les Annonces",
      description: "Découvrez toutes les propriétés",
      icon: Search,
      href: "/listings",
      gradient: "from-pink-500/20 to-rose-500/10",
      iconColor: "text-pink-600",
    },
    {
      title: "Rechercher par Ville",
      description: "Trouvez des biens par localisation",
      icon: MapPin,
      href: "/listings",
      gradient: "from-indigo-500/20 to-blue-500/10",
      iconColor: "text-indigo-600",
    },
  ];

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <Card
          key={action.title}
          className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br ${action.gradient} border-0`}
          onClick={() => handleClick(action.href)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-background/80 shadow-sm group-hover:shadow-md transition-shadow ${action.iconColor}`}>
                <action.icon className="w-6 h-6" />
              </div>
              {action.count !== undefined && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">{action.count}</p>
                  <p className="text-xs text-muted-foreground">{action.countLabel}</p>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {action.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
