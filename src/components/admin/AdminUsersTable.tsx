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
import { MoreHorizontal, Search, AlertTriangle, Ban, History, UserCheck } from "lucide-react";
import { UserManagementDialog } from "./UserManagementDialog";
import { UserHistoryDialog } from "./UserHistoryDialog";

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
  points: number;
  created_at: string;
  status?: string;
  warning_count?: number;
}

interface AdminUsersTableProps {
  users: User[];
  onRefresh: () => void;
}

export const AdminUsersTable = ({ users, onRefresh }: AdminUsersTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);
  const [historyUserName, setHistoryUserName] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && (!user.status || user.status === "active")) ||
      (statusFilter === "suspended" && user.status === "suspended") ||
      (statusFilter === "deleted" && user.status === "deleted");

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "suspended":
        return <Badge variant="destructive">Suspendu</Badge>;
      case "deleted":
        return <Badge variant="outline" className="text-muted-foreground">Supprimé</Badge>;
      default:
        return <Badge variant="default" className="bg-green-600">Actif</Badge>;
    }
  };

  const openManagement = (user: User) => {
    setSelectedUser(user);
    setManagementDialogOpen(true);
  };

  const openHistory = (user: User) => {
    setHistoryUserId(user.id);
    setHistoryUserName(user.full_name || "Utilisateur");
    setHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Actifs
          </Button>
          <Button
            variant={statusFilter === "suspended" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("suspended")}
          >
            <Ban className="w-4 h-4 mr-1" />
            Suspendus
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.status === "deleted" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">
                    {user.full_name || "Non renseigné"}
                  </TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.user_type || "user"}</Badge>
                  </TableCell>
                  <TableCell>{user.points}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={user.status === "deleted"}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openHistory(user)}>
                          <History className="w-4 h-4 mr-2" />
                          Voir l'historique
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openManagement(user)}>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Avertir
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openManagement(user)}
                          className="text-destructive"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {user.status === "suspended" ? "Lever suspension" : "Suspendre"}
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

      {/* Dialogs */}
      <UserManagementDialog
        user={selectedUser}
        open={managementDialogOpen}
        onOpenChange={setManagementDialogOpen}
        onActionComplete={onRefresh}
      />

      <UserHistoryDialog
        userId={historyUserId}
        userName={historyUserName}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  );
};
