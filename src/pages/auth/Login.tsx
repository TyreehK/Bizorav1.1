// src/pages/auth/Login.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const emailValid = useMemo(
    () => /^\S+@\S+\.\S+$/.test(email),
    [email]
  );
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const formValid = emailValid && passwordValid;

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setLoadingPw(true);
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoadingPw(false);

    if (error) {
      setErr(error.message);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div className="pt-24">
      <div className="container-page min-h-[calc(100vh-8rem)] grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT: Form card */}
        <div className="order-2 md:order-1">
          <Card className="card p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl tracking-tight">
                Inloggen
              </CardTitle>
              <p className="text-white/70 text-sm mt-2">
                Welkom terug. Log in om je dashboard te openen.
              </p>
            </CardHeader>

            <CardContent className="p-0 mt-6">
              <form className="space-y-5" onSubmit={loginWithPassword} noValidate>
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-white/90">E-mail</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      className="input pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jij@voorbeeld.nl"
                      aria-invalid={!emailValid && email.length > 0}
                      required
                    />
                  </div>
                  {!emailValid && email.length > 0 && (
                    <p className="text-xs text-red-400 mt-1">Voer een geldig e-mailadres in.</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-white/90">Wachtwoord</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      className="input pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-invalid={!passwordValid && password.length > 0}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg hover:bg-white/10 transition"
                      aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4 text-white/70" /> : <Eye className="h-4 w-4 text-white/70" />}
                    </button>
                  </div>
                  {!passwordValid && password.length > 0 && (
                    <p className="text-xs text-red-400 mt-1">Minimaal 6 tekens.</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!formValid || loadingPw}
                  className="btn-primary w-full"
                >
                  {loadingPw ? "Bezig..." : (
                    <span className="inline-flex items-center">
                      Inloggen <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* Feedback */}
                {msg && <p className="text-emerald-400 text-sm whitespace-pre-wrap">{msg}</p>}
                {err && <p className="text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

                {/* Links */}
                <div className="flex justify-between text-sm text-white/80">
                  <Link to="/register" className="underline">Account aanmaken</Link>
                  <Link to="/reset-password" className="underline">Wachtwoord vergeten</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Visual panel */}
        <div className="order-1 md:order-2">
          <div className="card p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/40 to-emerald-400/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/30 to-blue-500/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Strak & snel
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                Minimalistisch. Modern. Focus op de content.
              </h2>
              <p className="mt-3 text-white/75">
                Consistente spacing, glas-effecten en duidelijke hiërarchie.
                Geen ruis—alleen wat je nodig hebt om productief te zijn.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  { icon: <ShieldCheck className="h-4 w-4" />, text: "Veilig inloggen via Supabase" },
                  { icon: <Sparkles className="h-4 w-4" />, text: "Schone formulieren met inline validatie" },
                  { icon: <ArrowRight className="h-4 w-4" />, text: "Direct door naar je dashboard" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 grid place-content-center rounded-xl bg-white/10">{f.icon}</div>
                    <span className="text-white/85">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
