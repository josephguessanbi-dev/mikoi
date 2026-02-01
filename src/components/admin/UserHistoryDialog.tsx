import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Ban, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface UserHistoryDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Warning {
  id: string;
  reason: string;
  created_at: string;
}

interface Suspension {
  id: string;
  reason: string;
  is_permanent: boolean;
  suspended_until: string | null;
  created_at: string;
  lifted_at: string | null;
}

export const UserHistoryDialog = ({
  userId,
  userName,
  open,
  onOpenChange,
}: UserHistoryDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);

  useEffect(() => {
    if (userId && open) {
      fetchHistory();
    }
  }, [userId, open]);

  const fetchHistory = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [warningsResult, suspensionsResult] = await Promise.all([
        supabase
          .from("user_warnings")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_suspensions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      setWarnings((warningsResult.data as Warning[]) || []);
      setSuspensions((suspensionsResult.data as Suspension[]) || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Historique de l'utilisateur</DialogTitle>
          <DialogDescription>{userName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Warnings Section */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Avertissements ({warnings.length})
                </h3>
                {warnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun avertissement</p>
                ) : (
                  <div className="space-y-3">
                    {warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-amber-600">
                            Avertissement
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(warning.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{warning.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Suspensions Section */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Ban className="w-4 h-4 text-destructive" />
                  Suspensions ({suspensions.length})
                </h3>
                {suspensions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune suspension</p>
                ) : (
                  <div className="space-y-3">
                    {suspensions.map((suspension) => (
                      <div
                        key={suspension.id}
                        className={`border rounded-lg p-3 ${
                          suspension.lifted_at
                            ? "bg-muted/50 border-muted"
                            : "bg-destructive/10 border-destructive/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {suspension.lifted_at ? (
                              <Badge variant="outline" className="text-muted-foreground">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Levée
                              </Badge>
                            ) : suspension.is_permanent ? (
                              <Badge variant="destructive">Permanente</Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Temporaire
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(suspension.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{suspension.reason}</p>
                        {!suspension.is_permanent && suspension.suspended_until && !suspension.lifted_at && (
                          <p className="text-xs text-muted-foreground">
                            Jusqu'au: {new Date(suspension.suspended_until).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                        {suspension.lifted_at && (
                          <p className="text-xs text-muted-foreground">
                            Levée le: {new Date(suspension.lifted_at).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
