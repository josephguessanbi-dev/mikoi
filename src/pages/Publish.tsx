import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Upload } from "lucide-react";

const Publish = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Publier une annonce</h1>
          <p className="text-muted-foreground text-lg">
            Partagez votre bien avec des milliers d'acheteurs potentiels
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Informations sur le bien
            </CardTitle>
            <CardDescription>
              Remplissez tous les champs pour créer une annonce attractive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'annonce</Label>
              <Input id="title" placeholder="Ex: Villa moderne 4 chambres - Cocody" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'annonce</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="vente">Vente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-type">Type de bien</Label>
                <Select>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Select>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Choisir une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abidjan">Abidjan</SelectItem>
                    <SelectItem value="bouake">Bouaké</SelectItem>
                    <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
                    <SelectItem value="san-pedro">San Pedro</SelectItem>
                    <SelectItem value="korhogo">Korhogo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">Quartier</Label>
                <Input id="district" placeholder="Ex: Cocody" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input id="price" type="number" placeholder="Ex: 450000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input id="bedrooms" type="number" placeholder="Ex: 4" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input id="surface" type="number" placeholder="Ex: 180" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Décrivez votre bien en détail..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-1">
                  Glissez vos photos ici ou cliquez pour parcourir
                </p>
                <p className="text-sm text-muted-foreground">
                  Minimum 6 photos (JPG, PNG - Max 5MB chacune)
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1">
                Enregistrer comme brouillon
              </Button>
              <Button variant="hero" className="flex-1">
                Publier l'annonce
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Publish;
