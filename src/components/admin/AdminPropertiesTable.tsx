import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Search, Ban, Trash2, CheckCircle, Eye, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

interface AdminPropertiesTableProps {
  properties: Property[];
  onRefresh: () => void;
}

export const AdminPropertiesTable = ({ properties, onRefresh }: AdminPropertiesTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      searchQuery === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.owner_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
      case "reserved":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Réservée</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspendue</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openActionDialog = (property: Property, action: 'suspend' | 'activate' | 'delete') => {
    setSelectedProperty(property);
    setActionType(action);
    setReason("");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedProperty || !actionType) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('admin-property-actions', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: {
          action: actionType,
          propertyId: selectedProperty.id,
          reason: reason || undefined,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data.error) throw new Error(response.data.error);

      toast({
        title: "Succès",
        description: response.data.message,
      });

      setActionDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'suspend':
        return "Suspendre l'annonce";
      case 'activate':
        return "Réactiver l'annonce";
      case 'delete':
        return "Supprimer l'annonce";
      default:
        return "";
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'suspend':
        return `Voulez-vous suspendre l'annonce "${selectedProperty?.title}" ? Elle ne sera plus visible publiquement.`;
      case 'activate':
        return `Voulez-vous réactiver l'annonce "${selectedProperty?.title}" ? Elle sera de nouveau visible.`;
      case 'delete':
        return `Voulez-vous supprimer définitivement l'annonce "${selectedProperty?.title}" ? Cette action est irréversible.`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, ville ou propriétaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Toutes
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Actives
          </Button>
          <Button
            variant={statusFilter === "reserved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("reserved")}
          >
            <Home className="w-4 h-4 mr-1" />
            Réservées
          </Button>
          <Button
            variant={statusFilter === "suspended" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("suspended")}
          >
            <Ban className="w-4 h-4 mr-1" />
            Suspendues
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredProperties.length} annonce(s) affichée(s)</span>
        <span>•</span>
        <span className="text-green-600">{properties.filter(p => p.status === 'active').length} actives</span>
        <span>•</span>
        <span className="text-destructive">{properties.filter(p => p.status === 'suspended').length} suspendues</span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Titre</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucune annonce trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property.id} className={property.status === "suspended" ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.owner_name}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit">{property.property_type}</Badge>
                      <span className="text-xs text-muted-foreground">{property.listing_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {property.price.toLocaleString()} F
                    {property.listing_type === "location" && <span className="text-xs text-muted-foreground">/mois</span>}
                  </TableCell>
                  <TableCell>{getStatusBadge(property.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(property.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.open(`/listings/${property.id}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir l'annonce
                        </DropdownMenuItem>
                        {property.status === "suspended" ? (
                          <DropdownMenuItem onClick={() => openActionDialog(property, 'activate')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Réactiver
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => openActionDialog(property, 'suspend')}>
                            <Ban className="w-4 h-4 mr-2" />
                            Suspendre
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => openActionDialog(property, 'delete')}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {getActionDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Raison (optionnel)</label>
            <Textarea
              placeholder="Indiquez la raison de cette action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={loading}
              className={actionType === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {loading ? "En cours..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
