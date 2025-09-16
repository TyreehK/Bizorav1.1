// src/components/Navigation.tsx
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  // Unieke paden (geen dubbele "/features")
  const navItems = [
    { name: "Functies", path: "/features" },
    { name: "Zakelijke rekening", path: "/business-account" },
    { name: "Prijzen", path: "/pricing" },
    { name: "Ondersteuning", path: "/contact" },
    { name: "Accountants", path: "/about" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-foreground">Bizora</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={`${item.name}-${item.path}`} // unieke key
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1",
                  location.pathname === item.path ? "text-primary" : "text-foreground"
                )}
              >
                <span>{item.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-foreground">
                Inloggen
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Registreren
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
