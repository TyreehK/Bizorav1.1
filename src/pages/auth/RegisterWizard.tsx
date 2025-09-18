// src/pages/auth/RegisterWizard.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

type ProfilePayload = {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  kvk: string;
  vat_number: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  city: string;
  country: string;
};

const emptyProfile: ProfilePayload = {
  email: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  phone: "",
  company_name: "",
  kvk: "",
  vat_number: "",
  address_line1: "",
  address_line2: "",
  postal_code: "",
  city: "",
  country: "Nederland",
};

const STORAGE_KEY = "bizora.pendingProfile";

export default function RegisterWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=account,2=persoonlijk,3=bedrijf,4=adres,5=overzicht
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // account
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  // profieldata
  const [p, setP] = useState<ProfilePayload>(emptyProfile);
  const [accepted, setAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // al ingelogd? ga weg
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) navigate("/dashboard", { replace: true });
    })();
  }, [navigate]);

  // Vul email in profiel live mee
  useEffect(() => {
    setP((prev) => ({ ...prev, email }));
  }, [email]);

  const pwStrength = useMemo(() => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0..5
  }, [pw]);

  const pwOk = pw.length >= 8 && pw === pw2;

  // Validaties per stap
  const stepValid = useMemo(() => {
    if (step === 1) return email.trim().length > 3 && pwOk && accepted;
    if (step === 2) return p.first_name.trim() && p.last_name.trim();
    if (step === 3) return p.company_name.trim().length > 1;
    if (step === 4) return p.address_line1.trim() && p.postal_code.trim() && p.city.trim() && p.country.trim();
    if (step === 5) return true;
    return false;
  }, [step, email, pwOk, accepted, p]);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const update = (field: keyof ProfilePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP((prev) => ({ ...prev, [field]: e.target.value }));

  // Eindactie: signUp + profiel opslaan
  const submitAll = async () => {
    setErr(null);
    setMsg(null);
    setLoading(true);

    const redirectTo = `${window.location.origin}/complete-profile`;

    const { data: sign, error: signErr } = await supabase.auth.signUp({
      email: email.trim(),
      password: pw,
      options: { emailRedirectTo: redirectTo },
    });

    if (signErr) {
      setLoading(false);
      if (/already registered/i.test(signErr.message)) {
        setErr("Dit e-mailadres is al geregistreerd. Log in of reset je wachtwoord.");
      } else {
        setErr(signErr.message);
      }
      return;
    }

    // Prepare profiel payload
    const payload: ProfilePayload = {
      ...p,
      email: email.trim(),
    };

    if (sign.session?.user) {
      // Email confirm UIT → direct upsert
      const userId = sign.session.user.id;
      const { error: upErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...payload }, { onConflict: "id" });
      setLoading(false);
      if (upErr) {
        setErr(upErr.message);
        return;
      }
      // Klaar → laad en naar dashboard
      navigate("/dashboard/loading", { replace: true });
      return;
    }

    // Email confirm AAN → tijdelijk bewaren in localStorage en naar verify
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLoading(false);
    setMsg("Account aangemaakt. Check je mailbox om je e-mailadres te bevestigen.");
    setTimeout(() => navigate("/verify-email", { replace: true, state: { email } }), 700);
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4">
      {/* zachte blobs */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/40 to-emerald-400/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/30 to-blue-500/30 blur-3xl" />

      <div className="w-[min(720px,95vw)] card p-6 relative">
        <Header step={step} />

        {/* STEPS */}
        <div className="mt-4 space-y-4">
          {step === 1 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">E-mail</label>
                <Input className="input mt-1" type="email" placeholder="jij@bedrijf.nl" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">Wachtwoord</label>
                  <button type="button" className="text-xs text-white/60 hover:text-white/80" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? "verberg" : "toon"}
                  </button>
                </div>
                <Input className="input mt-1" type={showPw ? "text" : "password"}
                  placeholder="Minimaal 8 tekens, bijv. Bedrijf!2025" value={pw} onChange={(e) => setPw(e.target.value)} />
                <StrengthBar score={pwStrength} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">Herhaal wachtwoord</label>
                  <button type="button" className="text-xs text-white/60 hover:text-white/80" onClick={() => setShowPw2((v) => !v)}>
                    {showPw2 ? "verberg" : "toon"}
                  </button>
                </div>
                <Input className="input mt-1" type={showPw2 ? "text" : "password"} placeholder="Herhaal" value={pw2} onChange={(e) => setPw2(e.target.value)} />
                {pw2 && pw !== pw2 && <div className="text-xs text-red-300 mt-1">Wachtwoorden komen niet overeen.</div>}
              </div>
              <label className="md:col-span-2 flex items-center gap-3 text-sm mt-1">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4" />
                <span className="text-white/80">Ik accepteer de <a href="/terms" className="text-primary hover:underline">voorwaarden</a> en <a href="/privacy" className="text-primary hover:underline">privacy</a>.</span>
              </label>
            </section>
          )}

          {step === 2 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-white/80">Voornaam</label>
                <Input className="input mt-1" value={p.first_name} onChange={update("first_name")} placeholder="Jan" />
              </div>
              <div>
                <label className="text-sm text-white/80">Tussenvoegsel</label>
                <Input className="input mt-1" value={p.middle_name} onChange={update("middle_name")} placeholder="van" />
              </div>
              <div>
                <label className="text-sm text-white/80">Achternaam</label>
                <Input className="input mt-1" value={p.last_name} onChange={update("last_name")} placeholder="Dijk" />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm text-white/80">Telefoon</label>
                <Input className="input mt-1" value={p.phone} onChange={update("phone")} placeholder="+31 6 1234 5678" />
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/80">Bedrijfsnaam</label>
                <Input className="input mt-1" value={p.company_name} onChange={update("company_name")} placeholder="Voorbeeld BV" />
              </div>
              <div>
                <label className="text-sm text-white/80">KvK</label>
                <Input className="input mt-1" value={p.kvk} onChange={update("kvk")} placeholder="12345678" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">BTW-nummer</label>
                <Input className="input mt-1" value={p.vat_number} onChange={update("vat_number")} placeholder="NL123456789B01" />
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">Adres</label>
                <Input className="input mt-1" value={p.address_line1} onChange={update("address_line1")} placeholder="Straat 1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">Adres (2e regel, optioneel)</label>
                <Input className="input mt-1" value={p.address_line2} onChange={update("address_line2")} placeholder="Bus/Unit/Etage" />
              </div>
              <div>
                <label className="text-sm text-white/80">Postcode</label>
                <Input className="input mt-1" value={p.postal_code} onChange={update("postal_code")} placeholder="1234 AB" />
              </div>
              <div>
                <label className="text-sm text-white/80">Plaats</label>
                <Input className="input mt-1" value={p.city} onChange={update("city")} placeholder="Amsterdam" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-white/80">Land</label>
                <Input className="input mt-1" value={p.country} onChange={update("country")} placeholder="Nederland" />
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-2 text-sm">
              <div className="text-white/80">Controleer je gegevens en klik <span className="text-white">Account aanmaken</span>.</div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li className="p-2 rounded bg-white/5">
                  <div className="font-medium">Account</div>
                  <div className="text-white/70">{email}</div>
                </li>
                <li className="p-2 rounded bg-white/5">
                  <div className="font-medium">Naam</div>
                  <div className="text-white/70">{[p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ") || "—"}</div>
                </li>
                <li className="p-2 rounded bg-white/5">
                  <div className="font-medium">Telefoon</div>
                  <div className="text-white/70">{p.phone || "—"}</div>
                </li>
                <li className="p-2 rounded bg-white/5">
                  <div className="font-medium">Bedrijf</div>
                  <div className="text-white/70">{p.company_name || "—"} {p.kvk ? `• KvK ${p.kvk}` : ""}</div>
                </li>
                <li className="p-2 rounded bg-white/5 md:col-span-2">
                  <div className="font-medium">Adres</div>
                  <div className="text-white/70">
                    {[p.address_line1, p.address_line2, `${p.postal_code} ${p.city}`, p.country].filter(Boolean).join(", ")}
                  </div>
                </li>
                <li className="p-2 rounded bg-white/5 md:col-span-2">
                  <div className="font-medium">BTW</div>
                  <div className="text-white/70">{p.vat_number || "—"}</div>
                </li>
              </ul>
            </section>
          )}

          {/* Meldingen */}
          {err && <div className="text-sm text-red-300">{err}</div>}
          {msg && <div className="text-sm text-emerald-300 inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> {msg}</div>}
        </div>

        {/* Navigatie */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-white/70">
            Al een account? <Link to="/login" className="text-primary hover:underline">Inloggen</Link>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button type="button" variant="ghost" className="h-10" onClick={prev}>Vorige</Button>
            )}
            {step < 5 ? (
              <Button type="button" className="btn-primary h-10" disabled={!stepValid} onClick={next}>
                Volgende
              </Button>
            ) : (
              <Button
                type="button"
                className="btn-primary h-10 inline-flex items-center gap-2"
                onClick={submitAll}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Account maken…" : "Account aanmaken"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ step }: { step: number }) {
  const steps = [
    { n: 1, t: "Account" },
    { n: 2, t: "Persoonlijk" },
    { n: 3, t: "Bedrijf" },
    { n: 4, t: "Adres" },
    { n: 5, t: "Overzicht" },
  ];
  return (
    <div>
      <h1 className="text-xl font-semibold">Account aanmaken</h1>
      <p className="text-sm text-white/60">Stap {step} van {steps.length}</p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {steps.map((s) => (
          <div key={s.n} className={`h-1.5 rounded ${step >= s.n ? "bg-primary" : "bg-white/10"}`} />
        ))}
      </div>
    </div>
  );
}

function StrengthBar({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const color = score <= 2 ? "bg-red-400" : score === 3 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-white/10 rounded">
        <div className={`h-1.5 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
