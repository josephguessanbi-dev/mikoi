import { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navbar
    "nav.home": "Accueil",
    "nav.listings": "Nos biens",
    "nav.publish": "Publier",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.dashboard": "Tableau de bord",
    "nav.admin": "Admin",
    "nav.login": "Connexion",
    "nav.logout": "Déconnexion",
    
    // Home
    "home.hero.title": "Trouvez votre bien immobilier en Côte d'Ivoire",
    "home.hero.subtitle": "MikoiCI connecte acheteurs, vendeurs et locataires partout en Côte d'Ivoire",
    "home.hero.cta": "Voir les offres",
    "home.hero.publish": "Publier une annonce",
    "home.stats.listings": "Annonces actives",
    "home.stats.cities": "Villes couvertes",
    "home.stats.clients": "Clients satisfaits",
    "home.featured.title": "Annonces en vedette",
    "home.features.secure": "Transactions sécurisées",
    "home.features.secure.desc": "Paiements et données protégés",
    "home.features.coverage": "Couverture nationale",
    "home.features.coverage.desc": "Présents dans toute la Côte d'Ivoire",
    "home.features.transparent": "Prix transparents",
    "home.features.transparent.desc": "Aucun frais caché",
    "home.cta.title": "Prêt à trouver votre bien idéal ?",
    "home.cta.subtitle": "Rejoignez des milliers d'Ivoiriens qui ont trouvé leur propriété avec MikoiCI",
    "home.cta.button": "Commencer maintenant",
    
    // Listings
    "listings.title": "Toutes les annonces",
    "listings.count": "propriétés disponibles",
    "listings.loading": "Chargement des annonces...",
    "listings.empty": "Aucune annonce trouvée",
    "listings.search.city": "Ville",
    "listings.search.type": "Type de bien",
    "listings.search.maxPrice": "Prix maximum",
    "listings.search.button": "Rechercher",
    "listings.search.all": "Toutes",
    "listings.search.apartment": "Appartement",
    "listings.search.house": "Maison",
    "listings.search.land": "Terrain",
    "listings.search.office": "Bureau",
    
    // Listing Detail
    "detail.bedrooms": "chambres",
    "detail.surface": "m²",
    "detail.call": "Appeler",
    "detail.message": "Message",
    "detail.description": "Description",
    "detail.notFound": "Annonce introuvable",
    "detail.loading": "Chargement...",
    
    // Publish
    "publish.title": "Publier une annonce",
    "publish.subtitle": "Remplissez les informations de votre bien",
    "publish.info": "Informations de base",
    "publish.form.title": "Titre de l'annonce",
    "publish.form.type": "Type de bien",
    "publish.form.listingType": "Type d'annonce",
    "publish.form.sale": "Vente",
    "publish.form.rent": "Location",
    "publish.form.price": "Prix (FCFA)",
    "publish.form.location": "Localisation",
    "publish.form.city": "Ville",
    "publish.form.district": "Quartier",
    "publish.form.details": "Détails",
    "publish.form.bedrooms": "Nombre de chambres",
    "publish.form.surface": "Surface (m²)",
    "publish.form.description": "Description",
    "publish.form.images": "Photos",
    "publish.form.imagesDrop": "Glissez vos photos ici ou cliquez pour sélectionner",
    "publish.form.imagesSelected": "photo(s) sélectionnée(s)",
    "publish.form.draft": "Enregistrer comme brouillon",
    "publish.form.publish": "Publier l'annonce",
    
    // Dashboard
    "dashboard.title": "Mon tableau de bord",
    "dashboard.welcome": "Bienvenue",
    "dashboard.profile": "Profil",
    "dashboard.fullName": "Nom complet",
    "dashboard.phone": "Téléphone",
    "dashboard.userType": "Type de compte",
    "dashboard.points": "Mes points",
    "dashboard.buyPoints": "Acheter des points",
    "dashboard.stats": "Statistiques",
    "dashboard.stats.total": "Total de biens",
    "dashboard.stats.active": "Biens actifs",
    "dashboard.stats.forSale": "À vendre",
    "dashboard.properties": "Mes annonces",
    "dashboard.new": "Nouvelle annonce",
    "dashboard.noProperties": "Aucune annonce pour le moment",
    "dashboard.edit": "Modifier",
    "dashboard.reserved": "Réservé",
    "dashboard.unreserved": "Annuler réservation",
    "dashboard.delete": "Supprimer",
    
    // About
    "about.title": "À propos de MikoiCI",
    "about.subtitle": "Votre partenaire immobilier de confiance en Côte d'Ivoire",
    "about.mission.title": "Notre Mission",
    "about.mission.text": "MikoiCI est une plateforme ivoirienne innovante qui connecte acheteurs, vendeurs et locataires à travers toute la Côte d'Ivoire. Nous facilitons l'accès au marché immobilier ivoirien en offrant une expérience transparente, sécurisée et efficace.",
    "about.vision.title": "Notre Vision",
    "about.vision.text": "Devenir la référence de l'immobilier en Côte d'Ivoire en digitalisant et en modernisant le secteur pour le rendre accessible à tous.",
    "about.values.title": "Nos Valeurs",
    "about.values.transparency": "Transparence",
    "about.values.transparency.desc": "Des prix clairs et des informations vérifiées",
    "about.values.security": "Sécurité",
    "about.values.security.desc": "Protection de vos données et transactions",
    "about.values.innovation": "Innovation",
    "about.values.innovation.desc": "Technologie au service de l'immobilier",
    "about.values.trust": "Confiance",
    "about.values.trust.desc": "Relations durables avec nos utilisateurs",
    
    // Contact
    "contact.title": "Contactez-nous",
    "contact.subtitle": "Une question ? Notre équipe est là pour vous aider",
    "contact.form.name": "Nom complet",
    "contact.form.email": "Email",
    "contact.form.message": "Votre message",
    "contact.form.send": "Envoyer",
    "contact.info.title": "Informations de contact",
    "contact.info.email": "Email",
    "contact.info.phone": "Téléphone",
    "contact.info.address": "Adresse",
    "contact.info.addressValue": "Abidjan, Côte d'Ivoire",
    "contact.success": "Message envoyé avec succès !",
    "contact.error": "Erreur lors de l'envoi du message",
    
    // Legal
    "legal.title": "Mentions légales",
    "legal.privacy": "Politique de confidentialité",
    "legal.terms": "Conditions d'utilisation",
    "legal.company": "MikoiCI SARL",
    "legal.companyInfo": "Société à Responsabilité Limitée immatriculée en Côte d'Ivoire",
    "legal.rccm": "RCCM",
    "legal.address": "Siège social",
    
    // Common
    "common.fcfa": "FCFA",
    "common.month": "mois",
    "common.sale": "Vente",
    "common.rent": "Location",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.listings": "Listings",
    "nav.publish": "Publish",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    
    // Home
    "home.hero.title": "Find your dream property in Côte d'Ivoire",
    "home.hero.subtitle": "MikoiCI connects buyers, sellers and renters across Côte d'Ivoire",
    "home.hero.cta": "See listings",
    "home.hero.publish": "Publish listing",
    "home.stats.listings": "Active listings",
    "home.stats.cities": "Cities covered",
    "home.stats.clients": "Satisfied clients",
    "home.featured.title": "Featured listings",
    "home.features.secure": "Secure transactions",
    "home.features.secure.desc": "Protected payments and data",
    "home.features.coverage": "National coverage",
    "home.features.coverage.desc": "Present throughout Côte d'Ivoire",
    "home.features.transparent": "Transparent pricing",
    "home.features.transparent.desc": "No hidden fees",
    "home.cta.title": "Ready to find your ideal property?",
    "home.cta.subtitle": "Join thousands of Ivorians who found their property with MikoiCI",
    "home.cta.button": "Get started now",
    
    // Listings
    "listings.title": "All listings",
    "listings.count": "properties available",
    "listings.loading": "Loading listings...",
    "listings.empty": "No listings found",
    "listings.search.city": "City",
    "listings.search.type": "Property type",
    "listings.search.maxPrice": "Max price",
    "listings.search.button": "Search",
    "listings.search.all": "All",
    "listings.search.apartment": "Apartment",
    "listings.search.house": "House",
    "listings.search.land": "Land",
    "listings.search.office": "Office",
    
    // Listing Detail
    "detail.bedrooms": "bedrooms",
    "detail.surface": "sqm",
    "detail.call": "Call",
    "detail.message": "Message",
    "detail.description": "Description",
    "detail.notFound": "Listing not found",
    "detail.loading": "Loading...",
    
    // Publish
    "publish.title": "Publish a listing",
    "publish.subtitle": "Fill in your property information",
    "publish.info": "Basic information",
    "publish.form.title": "Listing title",
    "publish.form.type": "Property type",
    "publish.form.listingType": "Listing type",
    "publish.form.sale": "Sale",
    "publish.form.rent": "Rent",
    "publish.form.price": "Price (FCFA)",
    "publish.form.location": "Location",
    "publish.form.city": "City",
    "publish.form.district": "District",
    "publish.form.details": "Details",
    "publish.form.bedrooms": "Number of bedrooms",
    "publish.form.surface": "Surface (sqm)",
    "publish.form.description": "Description",
    "publish.form.images": "Photos",
    "publish.form.imagesDrop": "Drag your photos here or click to select",
    "publish.form.imagesSelected": "photo(s) selected",
    "publish.form.draft": "Save as draft",
    "publish.form.publish": "Publish listing",
    
    // Dashboard
    "dashboard.title": "My Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.profile": "Profile",
    "dashboard.fullName": "Full name",
    "dashboard.phone": "Phone",
    "dashboard.userType": "Account type",
    "dashboard.points": "My points",
    "dashboard.buyPoints": "Buy points",
    "dashboard.stats": "Statistics",
    "dashboard.stats.total": "Total properties",
    "dashboard.stats.active": "Active properties",
    "dashboard.stats.forSale": "For sale",
    "dashboard.properties": "My listings",
    "dashboard.new": "New listing",
    "dashboard.noProperties": "No listings yet",
    "dashboard.edit": "Edit",
    "dashboard.reserved": "Reserved",
    "dashboard.unreserved": "Cancel reservation",
    "dashboard.delete": "Delete",
    
    // About
    "about.title": "About MikoiCI",
    "about.subtitle": "Your trusted real estate partner in Côte d'Ivoire",
    "about.mission.title": "Our Mission",
    "about.mission.text": "MikoiCI is an innovative Ivorian platform connecting buyers, sellers and renters throughout Côte d'Ivoire. We facilitate access to the Ivorian real estate market by offering a transparent, secure and efficient experience.",
    "about.vision.title": "Our Vision",
    "about.vision.text": "To become the reference for real estate in Côte d'Ivoire by digitalizing and modernizing the sector to make it accessible to all.",
    "about.values.title": "Our Values",
    "about.values.transparency": "Transparency",
    "about.values.transparency.desc": "Clear prices and verified information",
    "about.values.security": "Security",
    "about.values.security.desc": "Protection of your data and transactions",
    "about.values.innovation": "Innovation",
    "about.values.innovation.desc": "Technology serving real estate",
    "about.values.trust": "Trust",
    "about.values.trust.desc": "Lasting relationships with our users",
    
    // Contact
    "contact.title": "Contact us",
    "contact.subtitle": "Have a question? Our team is here to help",
    "contact.form.name": "Full name",
    "contact.form.email": "Email",
    "contact.form.message": "Your message",
    "contact.form.send": "Send",
    "contact.info.title": "Contact information",
    "contact.info.email": "Email",
    "contact.info.phone": "Phone",
    "contact.info.address": "Address",
    "contact.info.addressValue": "Abidjan, Côte d'Ivoire",
    "contact.success": "Message sent successfully!",
    "contact.error": "Error sending message",
    
    // Legal
    "legal.title": "Legal notice",
    "legal.privacy": "Privacy policy",
    "legal.terms": "Terms of use",
    "legal.company": "MikoiCI SARL",
    "legal.companyInfo": "Limited Liability Company registered in Côte d'Ivoire",
    "legal.rccm": "RCCM",
    "legal.address": "Head office",
    
    // Common
    "common.fcfa": "FCFA",
    "common.month": "month",
    "common.sale": "Sale",
    "common.rent": "Rent",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
