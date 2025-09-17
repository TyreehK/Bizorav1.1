// src/pages/auth/ResetPassword.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    setLoading(true); setMsg(null); setErr(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/verify-email`,
    });

    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Reset-mail verstuurd. Check je inbox.");
  };

  return (
    <div className="pt-24">
      <div className="container-page min-h-[calc(100vh-8rem)] grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT: Form */}
        <div className="order-2 md:order-1">
          <Card className="card p-6 md:p-8">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl tracking-tight">Wachtwoord resetten</CardTitle>
              <p className="text-white/70 text-sm mt-2">We sturen je een link om je wachtwoord te wijzigen.</p>
            </CardHeader>
            <CardContent className="p-0 mt-6">
              <form className="space-y-5" onSubmit={onSubmit} noValidate>
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

                <Button type="submit" disabled={!emailValid || loading} className="btn-primary w-full">
                  {loading ? "Bezig..." : <span className="inline-flex items-center">Verzend reset-link <ArrowRight className="ml-2 h-4 w-4" /></span>}
                </Button>

                {msg && <p className="text-emerald-400 text-sm whitespace-pre-wrap">{msg}</p>}
                {err && <p className="text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

                <div className="flex justify-between text-sm text-white/80">
                  <Link to="/login" className="underline">Terug naar inloggen</Link>
                  <Link to="/register" className="underline">Account aanmaken</Link>
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
                Veilig & simpel
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">Herstel toegang in een paar stappen.</h2>
              <p className="mt-3 text-white/75">We sturen je een magic link (SMTP vereist). Volg de stappen in je e-mail.</p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: <ShieldCheck className="h-4 w-4" />, text: "Eén klik vanuit je mailbox" },
                  { icon: <Sparkles className="h-4 w-4" />, text: "Geen complexe formulieren" },
                  { icon: <ArrowRight className="h-4 w-4" />, text: "Snel terug naar je dashboard" },
                ].map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="h-8 w-8 grid place-content-center rounded-xl bg-white/10">{i.icon}</div>
                    <span className="text-white/85">{i.text}</span>
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
