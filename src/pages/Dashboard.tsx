import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BarChart3, PlusCircle, Settings } from "lucide-react";

export default function Dashboard() {
  const { user } = useSupabaseAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="pt-24">
      <div className="container-page space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welkom, {user?.email}</h1>
            <p className="text-white/70 mt-2">Je bent ingelogd. Kies een actie om te starten.</p>
          </div>
          <div className="flex gap-2">
            <a href="/profile" className="btn-ghost">Profiel</a>
            <button className="btn-primary" onClick={handleLogout}>Uitloggen</button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Overzicht", desc: "Kernstatistieken en recente activiteit.", icon: <BarChart3 className="h-5 w-5" /> },
            { title: "Nieuwe item", desc: "Snel iets nieuws toevoegen.", icon: <PlusCircle className="h-5 w-5" /> },
            { title: "Instellingen", desc: "Beheer je voorkeuren en integraties.", icon: <Settings className="h-5 w-5" /> },
          ].map((c, i) => (
            <div key={i} className="card p-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-content-center text-white">
                {c.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{c.desc}</p>
              <div className="mt-4">
                <button className="btn-ghost">Openen</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
