import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, Mail, Home, Edit, Trash2, Coins, CheckCircle2, ArrowLeft, Star } from "lucide-react";
import { BuyPointsButton } from "@/components/BuyPointsButton";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import { VerificationBadge } from "@/components/VerificationBadge";
import { UserRating } from "@/components/UserRating";
import { ReviewsList } from "@/components/ReviewsList";
import { WhatsAppSupport } from "@/components/WhatsAppSupport";

interface Profile {
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
}

interface UserPoints {
  points: number;
}

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  district: string | null;
  property_type: string;
  listing_type: string;
  status: string;
  images: string[];
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProperties();
      fetchUserPoints();
      fetchFavoritesCount();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      setUserPoints(data);
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  const fetchFavoritesCount = async () => {
    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      if (error) throw error;
      setFavoritesCount(count || 0);
    } catch (error) {
      console.error("Error fetching favorites count:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès",
      });

      fetchProperties();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const handleToggleReserved = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "reserved" ? "active" : "reserved";
    const statusLabel = newStatus === "reserved" ? "réservée" : "active";

    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Annonce marquée comme ${statusLabel}`,
      });

      fetchProperties();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Mon Tableau de Bord</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenue, {profile?.full_name || "Utilisateur"} !
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div id="points" className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{userPoints?.points || 0} points</span>
            </div>
            <BuyPointsButton onSuccess={fetchUserPoints} className="rounded-full" />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
          <DashboardQuickActions
            totalProperties={properties.length}
            activeProperties={properties.filter((p) => p.status === "active").length}
            forSale={properties.filter((p) => p.listing_type === "vente").length}
            forRent={properties.filter((p) => p.listing_type === "location").length}
            points={userPoints?.points || 0}
            favoritesCount={favoritesCount}
          />
        </section>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Mes Informations
              {user && <VerificationBadge userId={user.id} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">{profile?.full_name || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{profile?.phone || "Non renseigné"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Type de compte</p>
                  <Badge variant="secondary">{profile?.user_type || "Utilisateur"}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Star className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ma réputation</p>
                  {user && <UserRating userId={user.id} />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Reviews Section */}
        <Card className="mb-8" id="reviews">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Avis reçus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user && <ReviewsList userId={user.id} />}
          </CardContent>
        </Card>

        {/* Properties List */}
        <div id="my-properties">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes Annonces</CardTitle>
              <Button onClick={() => navigate("/publish")}>
                Nouvelle annonce
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez pas encore publié d'annonces</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/publish")}
                >
                  Publier ma première annonce
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <Badge variant={
                          property.status === "reserved" ? "secondary" : 
                          property.status === "active" ? "default" : "outline"
                        }>
                          {property.status === "reserved" ? "Réservé" : 
                           property.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {property.city}
                        {property.district && `, ${property.district}`}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{property.property_type}</Badge>
                        <Badge variant="outline">
                          {property.listing_type === "location" ? "À louer" : "À vendre"}
                        </Badge>
                        <span className="font-semibold text-primary">
                          {property.price.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit/${property.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        variant={property.status === "reserved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleReserved(property.id, property.status)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {property.status === "reserved" ? "Activer" : "Réserver"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <WhatsAppSupport variant="floating" />
      </div>
    </div>
  );
};

export default Dashboard;
