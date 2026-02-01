import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Ban, Trash2, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserManagementDialogProps {
  user: {
    id: string;
    full_name: string | null;
    phone: string | null;
    user_type: string | null;
    points: number;
    status?: string;
    warning_count?: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}

export const UserManagementDialog = ({
  user,
  open,
  onOpenChange,
  onActionComplete,
}: UserManagementDialogProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [suspendDays, setSuspendDays] = useState(7);
  const [anonymize, setAnonymize] = useState(true);

  if (!user) return null;

  const isSuspended = user.status === "suspended";

  const handleAction = async (action: "warn" | "suspend" | "unsuspend" | "delete") => {
    if (!reason.trim() && action !== "unsuspend") {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const suspendedUntil = isPermanent ? undefined : new Date(Date.now() + suspendDays * 24 * 60 * 60 * 1000).toISOString();

      const response = await supabase.functions.invoke("admin-user-actions", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: {
          action,
          targetUserId: user.id,
          reason: reason || "Levée de suspension",
          isPermanent,
          suspendedUntil,
          anonymize,
        },
      });

      if (response.error) throw response.error;

      const actionLabels = {
        warn: "Avertissement envoyé",
        suspend: "Utilisateur suspendu",
        unsuspend: "Suspension levée",
        delete: "Utilisateur supprimé",
      };

      toast({
        title: "Succès",
        description: actionLabels[action],
      });

      setReason("");
      onOpenChange(false);
      onActionComplete();
    } catch (error: any) {
      console.error("Action error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Gérer l'utilisateur
            {isSuspended && (
              <Badge variant="destructive" className="ml-2">Suspendu</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {user.full_name || "Utilisateur"} - {user.phone || "Pas de téléphone"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isSuspended ? "unsuspend" : "warn"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="warn" className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Avertir
            </TabsTrigger>
            <TabsTrigger value="suspend" className="flex items-center gap-1">
              {isSuspended ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {isSuspended ? "Lever" : "Suspendre"}
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex items-center gap-1">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="warn" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warn-reason">Raison de l'avertissement *</Label>
              <Textarea
                id="warn-reason"
                placeholder="Décrivez la raison de l'avertissement..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Après 3 avertissements, l'utilisateur sera automatiquement suspendu pour 30 jours.
              </p>
            </div>
            <Button
              onClick={() => handleAction("warn")}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
              Envoyer l'avertissement
            </Button>
          </TabsContent>

          <TabsContent value="suspend" className="space-y-4">
            {isSuspended ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="unsuspend-reason">Raison de la levée</Label>
                  <Textarea
                    id="unsuspend-reason"
                    placeholder="Pourquoi lever la suspension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => handleAction("unsuspend")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                  Lever la suspension
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="suspend-reason">Raison de la suspension *</Label>
                  <Textarea
                    id="suspend-reason"
                    placeholder="Décrivez la raison de la suspension..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="permanent">Suspension permanente</Label>
                  <Switch
                    id="permanent"
                    checked={isPermanent}
                    onCheckedChange={setIsPermanent}
                  />
                </div>

                {!isPermanent && (
                  <div className="space-y-2">
                    <Label htmlFor="days">Durée (jours)</Label>
                    <Input
                      id="days"
                      type="number"
                      min={1}
                      max={365}
                      value={suspendDays}
                      onChange={(e) => setSuspendDays(parseInt(e.target.value) || 7)}
                    />
                  </div>
                )}

                <Button
                  onClick={() => handleAction("suspend")}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                  Suspendre l'utilisateur
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Cette action est irréversible
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-reason">Raison de la suppression *</Label>
              <Textarea
                id="delete-reason"
                placeholder="Décrivez la raison de la suppression..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymize">Anonymiser les données</Label>
                <p className="text-xs text-muted-foreground">
                  Conserve l'historique de manière anonyme
                </p>
              </div>
              <Switch
                id="anonymize"
                checked={anonymize}
                onCheckedChange={setAnonymize}
              />
            </div>

            <Button
              onClick={() => handleAction("delete")}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Supprimer définitivement
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
