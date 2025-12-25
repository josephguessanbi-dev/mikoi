import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Home, Coins, TrendingUp, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  activeProperties: number;
  reservedProperties: number;
  totalPoints: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
  points: number;
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
  owner_email: string;
  created_at: string;
}

interface Transaction {
  id: string;
  user_email: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchAllData();
    } catch (error) {
      console.error("Error checking admin role:", error);
      navigate("/");
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchProperties(),
        fetchTransactions(),
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: properties } = await supabase.from("properties").select("status");
    const { data: points } = await supabase.from("user_points").select("points");

    setStats({
      totalUsers: profiles?.length || 0,
      totalProperties: properties?.length || 0,
      activeProperties: properties?.filter((p) => p.status === "active").length || 0,
      reservedProperties: properties?.filter((p) => p.status === "reserved").length || 0,
      totalPoints: points?.reduce((sum, p) => sum + p.points, 0) || 0,
    });
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: points } = await supabase.from("user_points").select("*");

    const usersWithPoints = profiles?.map((profile) => {
      const userPoints = points?.find((p) => p.user_id === profile.user_id);
      return {
        id: profile.user_id,
        email: profile.user_id, // We'll need to get actual email separately
        full_name: profile.full_name,
        phone: profile.phone,
        user_type: profile.user_type,
        points: userPoints?.points || 0,
        created_at: profile.created_at,
      };
    });

    setUsers(usersWithPoints || []);
  };

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        price,
        city,
        status,
        listing_type,
        property_type,
        user_id,
        created_at
      `)
      .order("created_at", { ascending: false });

    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");

    const propertiesWithOwner = data?.map((property) => {
      const owner = profiles?.find((p) => p.user_id === property.user_id);
      return {
        ...property,
        owner_email: owner?.full_name || "Inconnu",
      };
    });

    setProperties(propertiesWithOwner || []);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("points_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");

    const transactionsWithUser = data?.map((transaction) => {
      const user = profiles?.find((p) => p.user_id === transaction.user_id);
      return {
        ...transaction,
        user_email: user?.full_name || "Inconnu",
      };
    });

    setTransactions(transactionsWithUser || []);
  };

  if (authLoading || loading || !isAdmin) {
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
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Tableau de Bord Admin</h1>
          <Badge variant="default" className="text-lg px-4 py-2">
            Administrateur
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers}</p>
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
                  <p className="text-2xl font-bold">{stats?.totalProperties}</p>
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
                  <p className="text-2xl font-bold">{stats?.activeProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Home className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Réservées</p>
                  <p className="text-2xl font-bold">{stats?.reservedProperties}</p>
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
                  <p className="text-sm text-muted-foreground">Points Total</p>
                  <p className="text-2xl font-bold">{stats?.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="properties">Annonces</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Inscrit le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || "Non renseigné"}
                        </TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.user_type || "user"}</Badge>
                        </TableCell>
                        <TableCell>{user.points}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.owner_email}</TableCell>
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.user_email}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
