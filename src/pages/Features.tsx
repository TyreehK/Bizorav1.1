// src/pages/Features.tsx
import { ShieldCheck, Database, Rocket, Layers, Link2, Cog, LockKeyhole, BarChart3 } from "lucide-react";

const items = [
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Auth klaar", desc: "Supabase login, RLS policies en robuuste triggers." },
  { icon: <Database className="h-5 w-5" />, title: "Datamodel", desc: "Heldere structuur, makkelijk uitbreidbaar voor je domein." },
  { icon: <LockKeyhole className="h-5 w-5" />, title: "Beveiliging", desc: "Row-level security, minimaal oppervlakte in de client." },
  { icon: <Layers className="h-5 w-5" />, title: "Componenten", desc: "Consistente cards, buttons en formulieren met shadcn/ui." },
  { icon: <Link2 className="h-5 w-5" />, title: "Integraties", desc: "Makkelijk koppelen met APIs en webhooks." },
  { icon: <BarChart3 className="h-5 w-5" />, title: "Analytics-ready", desc: "Duidelijke UI-patronen voor grafieken en tabellen." },
  { icon: <Cog className="h-5 w-5" />, title: "Config", desc: "Env-based settings, duidelijke scheiding client/server." },
  { icon: <Rocket className="h-5 w-5" />, title: "Snel live", desc: "Minimalistisch design zodat je sneller shipt." },
];

export default function Features() {
  return (
    <div className="pt-24">
      <div className="container-page">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Functies</h1>
          <p className="text-white/70 mt-2">Alles wat je nodig hebt om snel van 0 → 1 te gaan, met een strakke basis.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <div key={i} className="card p-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-content-center">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <a href="/pricing" className="btn-primary">Bekijk prijzen</a>
        </div>
      </div>
    </div>
  );
}
