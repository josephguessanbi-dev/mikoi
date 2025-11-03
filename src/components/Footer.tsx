import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MikoiCI</h3>
            <p className="text-sm text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("nav.listings")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings" className="text-muted-foreground hover:text-primary">
                  {t("nav.listings")}
                </Link>
              </li>
              <li>
                <Link to="/publish" className="text-muted-foreground hover:text-primary">
                  {t("nav.publish")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("about.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t("legal.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal" className="text-muted-foreground hover:text-primary">
                  {t("legal.title")}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-muted-foreground hover:text-primary">
                  {t("legal.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} MikoiCI SARL. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
