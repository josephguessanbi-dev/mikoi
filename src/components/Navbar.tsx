import { Button } from "@/components/ui/button";
import { Home, PlusCircle, LogOut, LogIn, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import InstallPWAButton from "./InstallPWAButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t("common.success"),
      description: "À bientôt sur MikoiCI",
    });
    navigate("/");
  };

  const navLinks = [
    { to: "/listings", label: t("nav.listings") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Home className="w-6 h-6 text-primary" />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MikoiCI
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-primary/10 transition-colors duration-200"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Shield className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">{t("nav.admin")}</span>
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1">{t("nav.dashboard")}</span>
                </Button>
              </Link>
              <Link to="/publish">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="default" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden lg:inline ml-1">{t("nav.publish")}</span>
                  </Button>
                </motion.div>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline ml-1">{t("nav.logout")}</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="default" size="sm" className="shadow-md">
                  <LogIn className="w-4 h-4" />
                  <span className="ml-1">{t("nav.login")}</span>
                </Button>
              </motion.div>
            </Link>
          )}
          
          <InstallPWAButton variant="outline" size="sm" />
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <InstallPWAButton variant="ghost" size="icon" showText={false} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-50"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-card/95 backdrop-blur-lg border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={link.to} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      {link.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
              
              {user ? (
                <>
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link to="/publish" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-start">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {t("nav.publish")}
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("nav.logout")}
                    </Button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full justify-start">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("nav.login")}
                    </Button>
                  </Link>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-2 border-t"
              >
                <LanguageSwitcher />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
