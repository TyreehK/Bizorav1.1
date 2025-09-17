// src/pages/Pricing.tsx
import { useState } from "react";
import { Check } from "lucide-react";

const TIERS = [
  {
    key: "starter",
    name: "Starter",
    monthly: 0,
    yearly: 0,
    highlight: false,
    features: ["Auth & Dashboard", "Profiel bewerken", "Basis support (community)"],
    cta: { label: "Begin gratis", href: "/register" },
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 19,
    yearly: 190, // 2 maanden gratis
    highlight: true,
    features: ["Team features", "Prioriteit support", "Integratie-hooks"],
    cta: { label: "Pro proberen", href: "/register" },
  },
  {
    key: "business",
    name: "Business",
    monthly: 49,
    yearly: 490,
    highlight: false,
    features: ["SLA & SSO", "Uitgebreide rollen", "Eigen domein & SMTP"],
    cta: { label: "Plan een demo", href: "/contact" },
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="pt-24">
      <div className="container-page">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Prijzen</h1>
            <p className="text-white/70 mt-2">Schaal mee met je product. Wij houden het simpel.</p>
          </div>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3">
            <span className={`text-sm ${!yearly ? "text-white" : "text-white/70"}`}>Maandelijks</span>
            <button
              className="relative h-8 w-14 rounded-full bg-white/10 border border-white/15"
              onClick={() => setYearly((s) => !s)}
              aria-label="Toggle billing"
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white/90 transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm ${yearly ? "text-white" : "text-white/70"}`}>Jaarlijks <span className="text-emerald-400">(-2 mnd)</span></span>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => {
            const price = yearly ? t.yearly : t.monthly;
            const suffix = t.monthly === 0 ? "" : yearly ? "/jaar" : "/mnd";
            return (
              <div key={t.key} className={`card p-6 ${t.highlight ? "ring-2 ring-emerald-400/50" : ""}`}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold">{t.name}</h3>
                  {t.highlight && (
                    <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2 py-1 rounded-full">Meest gekozen</span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-extrabold tracking-tight">
                    {t.monthly === 0 ? "Gratis" : `€${price}`}
                    <span className="text-base font-medium text-white/70 ml-1">{suffix}</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-2">
                  {t.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/85">
                      <span className="h-6 w-6 rounded-lg bg-white/10 grid place-content-center">
                        <Check className="h-4 w-4" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a href={t.cta.href} className={`mt-6 inline-flex w-full justify-center ${t.highlight ? "btn-primary" : "btn-ghost"}`}>
                  {t.cta.label}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-white/60 mt-6">Alle prijzen zijn indicatief. Voeg je eigen tiers/voorwaarden toe.</p>
      </div>
    </div>
  );
}
