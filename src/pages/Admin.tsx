import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Users, Home, Coins, TrendingUp, ArrowLeft, AlertCircle, 
  Crown, MapPin, Star, Heart, BadgeCheck, Settings, Activity,
  BarChart3, Shield, Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminPropertiesTable } from "@/components/admin/AdminPropertiesTable";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import HeroImageManager from "@/components/admin/HeroImageManager";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  activeProperties: number;
  reservedProperties: number;
  totalPoints: number;
  premiumUsers: number;
  pendingVerifications: number;
  totalCities: number;
  totalFavorites: number;
  totalReviews: number;
  monthlyRevenue: number;
  topCities: { city: string; count: number }[];
}

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
  points: number;
  status?: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  status: string;
  listing_type: string;
  property_type: string;
  owner_name: string;
  created_at: string;
}

interface Transaction {
  id: string;
  user_name: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface PendingVerification {
  id: string;
  user_name: string;
  verification_type: string;
  status: string;
  created_at: string;
}

interface AdminData {
  stats: AdminStats;
  users: User[];
  properties: Property[];
  transactions: Transaction[];
  pendingVerifications: PendingVerification[];
}

const Admin = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      fetchAdminData();
    }
  }, [session]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await supabase.functions.invoke('admin-dashboard', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch admin data');
      }

      const result = response.data;

      if (result.error) {
        if (result.error === 'Unauthorized: Admin access required') {
          navigate("/");
          return;
        }
        throw new Error(result.error);
      }

      setData(result);
    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Une erreur s'est produite");
      toast({
        title: "Erreur",
        description: err.message || "Impossible de charger les données admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto border-destructive/20">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/")} variant="outline">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Tableau de Bord Admin
              </h1>
            </div>
            <p className="text-muted-foreground ml-12">Gérez votre plateforme en temps réel</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1.5 border-green-500/30 bg-green-500/10 text-green-600">
              <Activity className="w-3 h-3 mr-1.5 animate-pulse" />
              En ligne
            </Badge>
            <Badge className="text-sm px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80">
              <Crown className="w-3 h-3 mr-1.5" />
              Administrateur
            </Badge>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <AdminStatsCard
            title="Utilisateurs"
            value={data.stats.totalUsers}
            icon={Users}
            colorClass="bg-blue-500/10 text-blue-600"
          />
          <AdminStatsCard
            title="Annonces"
            value={data.stats.totalProperties}
            icon={Home}
            subtitle={`${data.stats.activeProperties} actives`}
            colorClass="bg-green-500/10 text-green-600"
          />
          <AdminStatsCard
            title="Revenus/mois"
            value={`${data.stats.monthlyRevenue.toLocaleString()} F`}
            icon={Coins}
            colorClass="bg-amber-500/10 text-amber-600"
          />
          <AdminStatsCard
            title="Premium"
            value={data.stats.premiumUsers}
            icon={Crown}
            colorClass="bg-purple-500/10 text-purple-600"
          />
          <AdminStatsCard
            title="Vérifications"
            value={data.stats.pendingVerifications}
            icon={BadgeCheck}
            subtitle="en attente"
            colorClass="bg-orange-500/10 text-orange-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalCities}</p>
                  <p className="text-xs text-muted-foreground">Villes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalFavorites}</p>
                  <p className="text-xs text-muted-foreground">Favoris</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">Avis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Cities */}
        {data.stats.topCities && data.stats.topCities.length > 0 && (
          <Card className="mb-8 border-0 bg-gradient-to-r from-card to-card/80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                Zones les plus actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.stats.topCities.map((city, index) => (
                  <Badge 
                    key={city.city} 
                    variant={index === 0 ? "default" : "secondary"} 
                    className={`text-sm py-1.5 px-4 ${index === 0 ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
                  >
                    <MapPin className="w-3 h-3 mr-1.5" />
                    {city.city} ({city.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-muted/50">
            <TabsTrigger value="properties" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Home className="w-4 h-4 mr-2" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Coins className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BadgeCheck className="w-4 h-4 mr-2" />
              Vérifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Gestion des Annonces
                  </CardTitle>
                  <Badge variant="outline">{data.properties.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminPropertiesTable properties={data.properties} onRefresh={fetchAdminData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Gestion des Utilisateurs
                  </CardTitle>
                  <Badge variant="outline">{data.users.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AdminUsersTable users={data.users} onRefresh={fetchAdminData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  Historique des Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Aucune transaction
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.user_name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.transaction_type === "purchase"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {transaction.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{transaction.amount} points</TableCell>
                            <TableCell className="text-muted-foreground">{transaction.description || "-"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString("fr-FR")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    Vérifications en attente
                  </CardTitle>
                  {data.pendingVerifications.length > 0 && (
                    <Badge variant="destructive">{data.pendingVerifications.length} en attente</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {data.pendingVerifications && data.pendingVerifications.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.pendingVerifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">
                              {verification.user_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{verification.verification_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                {verification.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(verification.created_at).toLocaleDateString("fr-FR")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <BadgeCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-muted-foreground">Aucune vérification en attente</p>
                    <p className="text-sm text-muted-foreground mt-1">Toutes les demandes ont été traitées</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Paramètres du site
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <HeroImageManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
