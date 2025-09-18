// src/components/dashboard/HeaderBar.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut, Search } from "lucide-react";

export default function HeaderBar() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const initial = useMemo(() => (email ? email.charAt(0).toUpperCase() : "U"), [email]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className="
        sticky top-0 z-30
        h-16
        border-b border-white/10
        bg-background/70 backdrop-blur
        supports-[backdrop-filter]:bg-background/50
      "
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Zoekveld */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            className="input pl-9 h-11 w-full"
            placeholder="Zoek in Bizora…"
            // onChange={(e)=> setQuery(e.target.value)}
          />
        </div>

        {/* Avatar + uitloggen */}
        <div className="flex items-center gap-3">
          <div
            title={email || undefined}
            className="
              h-9 w-9 rounded-full bg-primary text-white
              font-semibold flex items-center justify-center
              select-none
            "
          >
            {initial}
          </div>
          <div className="hidden md:block text-sm text-white/80 truncate max-w-[18ch]">
            {email ?? "Ingelogd"}
          </div>
          <Button onClick={logout} className="btn-ghost h-9">
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>
    </header>
  );
}
