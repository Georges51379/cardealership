import { Link } from "react-router-dom";
import { Car, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: settings } = useSiteSettings();

  return (
    <footer className="gradient-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_title || "Logo"} 
                  className="h-10 object-contain"
                />
              ) : (
                <>
                  <div className="bg-accent p-2 rounded-lg shadow-glow">
                    <Car className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span className="text-2xl font-heading font-bold">
                    {settings?.site_title || "Elite Motors"}
                  </span>
                </>
              )}
            </Link>
            <p className="text-muted-foreground mb-6">
              Your premier destination for luxury vehicles. Excellence in every drive.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent transition-smooth" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-smooth" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-smooth" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-smooth" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-accent transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cars" className="text-muted-foreground hover:text-accent transition-smooth">
                  Cars
                </Link>
              </li>
              <li>
                <Link to="/auction" className="text-muted-foreground hover:text-accent transition-smooth">
                  Auction
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-accent transition-smooth">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground hover:text-accent transition-smooth cursor-pointer">
                Luxury Cars
              </li>
              <li className="text-muted-foreground hover:text-accent transition-smooth cursor-pointer">
                Sports Cars
              </li>
              <li className="text-muted-foreground hover:text-accent transition-smooth cursor-pointer">
                SUVs
              </li>
              <li className="text-muted-foreground hover:text-accent transition-smooth cursor-pointer">
                Electric Vehicles
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>123 Luxury Avenue, Premium District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <span>info@elitemotors.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {currentYear} {settings?.site_title || "Elite Motors"}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-accent transition-smooth">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-smooth">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-smooth">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
