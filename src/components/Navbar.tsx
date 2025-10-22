import { Button } from "@/components/ui/button";
import { Home, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Home className="w-8 h-8" />
            <span>MikoiCI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/listings" className="text-foreground hover:text-primary transition-colors">
              Annonces
            </Link>
            <Link to="/publish" className="text-foreground hover:text-primary transition-colors">
              Publier
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <User className="w-4 h-4" />
              Connexion
            </Button>
            <Button size="sm" className="hidden md:flex">
              Inscription
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
