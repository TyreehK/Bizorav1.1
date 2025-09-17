import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const { loading, user } = useSupabaseAuth();

  const navItems = [
    { name: "Functies", path: "/features" },
    { name: "Zakelijke rekening", path: "/business-account" },
    { name: "Prijzen", path: "/pricing" },
    { name: "Ondersteuning", path: "/contact" },
    { name: "Accountants", path: "/about" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 w-full header-glass z-50">
      <div className="container-page">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="group flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 grid place-content-center shadow">
              <span className="text-white font-extrabold text-lg">B</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight group-hover:opacity-90">
              Bizora
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={`${item.name}-${item.path}`}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white/90 flex items-center gap-1",
                  location.pathname === item.path ? "text-white" : "text-white/70"
                )}
              >
                <span>{item.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-11 w-36 bg-white/5 rounded-xl animate-pulse" />
            ) : user ? (
              <>
                <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                <Link to="/profile" className="btn-ghost">Profiel</Link>
                <button className="btn-primary" onClick={handleLogout}>
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Inloggen</Link>
                <Link to="/register" className="btn-primary">Registreren</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
