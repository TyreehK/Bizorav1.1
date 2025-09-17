import { ArrowRight, ShieldCheck, Sparkles, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="pt-20">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="container-page py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Bouw sneller met een <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">strakke</span> en <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">moderne</span> UI.
            </h1>
            <p className="mt-6 text-white/80 text-base md:text-lg leading-relaxed">
              Auth, dashboard en formulieren staan. Voeg je data toe en ga live met een consistente, minimalistische interface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Nu starten <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/features" className="btn-ghost">Ontdek functies</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page pb-20 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: <Sparkles className="h-5 w-5" />,
            title: "Clean design",
            desc: "Witruimte, glas, zachte schaduwen en duidelijke typografie."
          },
          {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: "RLS-proof",
            desc: "Supabase policies en triggers zijn robuust en production-ready."
          },
          {
            icon: <BarChart3 className="h-5 w-5" />,
            title: "Schaalbaar",
            desc: "Herbruikbare componenten en consistente lay-outstructuur."
          }
        ].map((f, i) => (
          <div key={i} className="card p-6">
            <div className="h-10 w-10 rounded-xl bg-white/10 grid place-content-center text-white">
              {f.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
