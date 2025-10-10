import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/cars", label: "Cars" },
    { to: "/auction", label: "Auction" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
          isScrolled
            ? "glass-effect shadow-premium py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_title || "Logo"} 
                  className="h-10 object-contain group-hover:scale-110 transition-smooth"
                />
              ) : (
                <>
                  <div className="bg-accent p-2 rounded-lg group-hover:scale-110 transition-smooth shadow-glow">
                    <Car className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span className="text-2xl font-heading font-bold">
                    {settings?.site_title || "Elite Motors"}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-medium transition-smooth hover:text-accent relative ${
                    isActive(link.to)
                      ? "text-accent after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-accent"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA & Dark Mode */}
            <div className="hidden lg:flex items-center gap-4">
              <DarkModeToggle />
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <DarkModeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground hover:text-accent transition-smooth"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-smooth ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-smooth ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] glass-effect shadow-premium transition-smooth ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-6">
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-lg font-medium transition-smooth hover:text-accent ${
                    isActive(link.to) ? "text-accent" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
