import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, Loader2, Check, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const HeroImageManager = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current hero image setting
  const { data: heroImageUrl, isLoading } = useQuery({
    queryKey: ["hero-image-setting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image")
        .single();

      if (error) throw error;
      return data?.value || null;
    },
  });

  // Update hero image mutation
  const updateHeroImage = useMutation({
    mutationFn: async (imageUrl: string | null) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("site_settings")
        .update({ 
          value: imageUrl, 
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq("key", "hero_image");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-image-setting"] });
      queryClient.invalidateQueries({ queryKey: ["hero-image"] });
      toast({
        title: "Image mise à jour",
        description: "L'image d'accueil a été modifiée avec succès.",
      });
    },
    onError: (error) => {
      console.error("Error updating hero image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'image.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5 Mo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-image-${Date.now()}.${fileExt}`;

      // Delete old image if exists
      if (heroImageUrl) {
        const oldPath = heroImageUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("site-assets").remove([oldPath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      // Update setting
      await updateHeroImage.mutateAsync(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!heroImageUrl) return;

    try {
      // Delete from storage
      const oldPath = heroImageUrl.split("/").pop();
      if (oldPath) {
        await supabase.storage.from("site-assets").remove([oldPath]);
      }

      // Clear setting
      await updateHeroImage.mutateAsync(null);
    } catch (error) {
      console.error("Remove error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Image d'accueil
        </CardTitle>
        <CardDescription>
          Modifiez l'image de fond de la section hero sur la page d'accueil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Current image preview */}
            <div className="space-y-2">
              <Label>Image actuelle</Label>
              <div className="relative aspect-video rounded-lg border bg-muted overflow-hidden">
                {heroImageUrl ? (
                  <img
                    src={heroImageUrl}
                    alt="Hero actuel"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Image par défaut utilisée</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload section */}
            <div className="space-y-2">
              <Label htmlFor="hero-upload">Nouvelle image</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="hero-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
                {heroImageUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format recommandé : 1920x1080px, max 5 Mo (JPG, PNG, WebP)
              </p>
            </div>

            {/* Upload status */}
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Upload en cours...</span>
              </div>
            )}

            {updateHeroImage.isSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Image mise à jour avec succès</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HeroImageManager;
