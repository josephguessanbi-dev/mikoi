import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Home, Coins, TrendingUp, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  activeProperties: number;
  reservedProperties: number;
  totalPoints: number;
}

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  status: string;
  user_id: string;
  created_at: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string | null;
  points: number;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    reservedProperties: 0,
    totalPoints: 0,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive",
        });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, user_type, created_at");

      if (profilesError) throw profilesError;

      // Fetch points
      const { data: pointsData, error: pointsError } = await supabase
        .from("user_points")
        .select("user_id, points");

      if (pointsError) throw pointsError;

      // Combine data
      const usersWithData: UserData[] = profilesData?.map((profile) => {
        const userPoints = pointsData?.find((p) => p.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: `user-${profile.user_id.slice(0, 8)}`, // Temporary placeholder
          full_name: profile.full_name,
          user_type: profile.user_type,
          points: userPoints?.points || 0,
          created_at: profile.created_at || "",
        };
      }) || [];

      setUsers(usersWithData);

      // Fetch all properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Calculate stats
      const totalPoints = usersWithData.reduce((sum, user) => sum + user.points, 0);
      
      setStats({
        totalUsers: usersWithData.length,
        totalProperties: propertiesData?.length || 0,
        activeProperties: propertiesData?.filter((p) => p.status === "active").length || 0,
        reservedProperties: propertiesData?.filter((p) => p.status === "reserved").length || 0,
        totalPoints,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès",
      });

      fetchAdminData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const handleTogglePropertyStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "reserved" : "active";

    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Annonce marquée comme ${newStatus === "reserved" ? "réservée" : "active"}`,
      });

      fetchAdminData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  if (authLoading || adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Tableau de Bord Admin</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
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
                  <p className="text-2xl font-bold">{stats.totalProperties}</p>
                  <p className="text-sm text-muted-foreground">Annonces totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeProperties}</p>
                  <p className="text-sm text-muted-foreground">Actives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reservedProperties}</p>
                  <p className="text-sm text-muted-foreground">Réservées</p>
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
                  <p className="text-2xl font-bold">{stats.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Points totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gestion des Annonces</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.city}</TableCell>
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
                      {new Date(property.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTogglePropertyStatus(property.id, property.status)
                          }
                        >
                          {property.status === "active" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.user_type || "Utilisateur"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-primary" />
                        {user.points}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
