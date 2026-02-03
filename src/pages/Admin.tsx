import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Home, Coins, TrendingUp, ArrowLeft, AlertCircle, Crown, MapPin, Star, Heart, BadgeCheck, Settings } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
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
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Tableau de Bord Admin</h1>
          <Badge variant="default" className="text-lg px-4 py-2">
            Administrateur
          </Badge>
        </div>

        {/* Statistics Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">{data.stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annonces</p>
                  <p className="text-2xl font-bold">{data.stats.totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                  <p className="text-2xl font-bold">{data.stats.activeProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/20 p-3 rounded-full">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-2xl font-bold">{data.stats.premiumUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenus/mois</p>
                  <p className="text-2xl font-bold">{data.stats.monthlyRevenue.toLocaleString()} F</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <BadgeCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vérifications en attente</p>
                  <p className="text-2xl font-bold">{data.stats.pendingVerifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Villes couvertes</p>
                  <p className="text-2xl font-bold">{data.stats.totalCities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favoris</p>
                  <p className="text-2xl font-bold">{data.stats.totalFavorites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avis</p>
                  <p className="text-2xl font-bold">{data.stats.totalReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-teal-500/20 p-3 rounded-full">
                  <Coins className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points Total</p>
                  <p className="text-2xl font-bold">{data.stats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Cities */}
        {data.stats.topCities && data.stats.topCities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Zones les plus recherchées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data.stats.topCities.map((city, index) => (
                  <Badge key={city.city} variant={index === 0 ? "default" : "secondary"} className="text-sm py-1 px-3">
                    {city.city} ({city.count} annonces)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="properties">Annonces</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="verifications">Vérifications</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminUsersTable users={data.users} onRefresh={fetchAdminData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Annonces</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.owner_name}</TableCell>
                        <TableCell>{property.city}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.property_type}</Badge>
                        </TableCell>
                        <TableCell>{property.price.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              property.status === "active"
                                ? "default"
                                : property.status === "reserved"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {property.status === "active"
                              ? "Active"
                              : property.status === "reserved"
                              ? "Réservé"
                              : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(property.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((transaction) => (
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
                        <TableCell>{transaction.amount} points</TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Vérifications en attente</CardTitle>
              </CardHeader>
              <CardContent>
                {data.pendingVerifications && data.pendingVerifications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                            <Badge variant="secondary">{verification.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(verification.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune vérification en attente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <HeroImageManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;