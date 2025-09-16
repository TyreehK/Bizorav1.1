// src/pages/Dashboard.tsx
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useSupabaseAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welkom {user?.email}</p>

      <div className="flex gap-2">
        <Button onClick={handleLogout}>Uitloggen</Button>
        <a className="underline text-sm" href="/">
          Terug naar Home
        </a>
      </div>
    </div>
  );
}
