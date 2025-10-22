import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LogOut, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur MikoiCI",
    });
    navigate("/");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">MikoiCI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/listings">
            <Button variant="ghost">Annonces</Button>
          </Link>
          {user ? (
            <>
              <Link to="/publish">
                <Button variant="hero" size="sm">
                  <PlusCircle className="w-4 h-4" />
                  Publier
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="hero" size="sm">
                <LogIn className="w-4 h-4" />
                Connexion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
