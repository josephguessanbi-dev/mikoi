import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LogOut, LogIn, LayoutDashboard, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t("common.success"),
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
        
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/listings">
            <Button variant="ghost" size="sm">{t("nav.listings")}</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" size="sm">{t("nav.about")}</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="sm">{t("nav.contact")}</Button>
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">{t("nav.admin")}</span>
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">{t("nav.dashboard")}</span>
                </Button>
              </Link>
              <Link to="/publish">
                <Button variant="default" size="sm">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">{t("nav.publish")}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-1">{t("nav.logout")}</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline ml-1">{t("nav.login")}</span>
              </Button>
            </Link>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
