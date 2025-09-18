// src/pages/auth/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, Eye, EyeOff, Loader2, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Als je al ingelogd bent → meteen door
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        navigate("/dashboard", { replace: true });
      }
    })();
  }, [navigate]);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 6 && !loading,
    [email, password, loading]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!canSubmit) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      // Veelvoorkomende meldingen mooier tonen
      if (/invalid login credentials/i.test(error.message)) {
        setErr("Onjuiste inloggegevens.");
      } else if (/email not confirmed/i.test(error.message)) {
        setErr("E-mailadres nog niet bevestigd. Klik op ‘verificatiemail opnieuw sturen’.");
      } else {
        setErr(error.message);
      }
      return;
    }

    if (data.session?.user) {
      // Succes → via laadpagina naar dashboard
      navigate("/dashboard/loading", { replace: true });
    } else {
      setErr("Kon geen sessie starten. Probeer het opnieuw.");
    }
  };

  const resendVerification = async () => {
    setErr(null);
    setMsg(null);
    const e = email.trim();
    if (!e) {
      setErr("Vul je e-mail in om de verificatiemail te versturen.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: e,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      setMsg("Verificatiemail opnieuw verstuurd. Check je inbox.");
    }
  };

  const sendReset = async () => {
    setErr(null);
    setMsg(null);
    const e = email.trim();
    if (!e) {
      setErr("Vul je e-mail in om een reset-link te ontvangen.");
      return;
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(e, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) setErr(error.message);
    else setMsg("Reset-link verstuurd. Check je inbox.");
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4">
      {/* zachte blobs */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/40 to-emerald-400/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/30 to-blue-500/30 blur-3xl" />

      <div className="w-[min(480px,92vw)] card p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Inloggen</h1>
            <p className="text-sm text-white/60">Welkom terug bij Bizora</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-white/80">E-mail</label>
            <Input
              className="input mt-1"
              type="email"
              placeholder="jij@bedrijf.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">Wachtwoord</label>
              <button
                type="button"
                className="text-xs text-white/60 hover:text-white/80 transition-colors"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPw ? (
                  <span className="inline-flex items-center gap-1"><EyeOff className="h-3.5 w-3.5" /> verberg</span>
                ) : (
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> toon</span>
                )}
              </button>
            </div>
            <Input
              className="input mt-1"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Meldingen */}
          {err && <div className="text-sm text-red-300">{err}</div>}
          {msg && <div className="text-sm text-emerald-300">{msg}</div>}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary w-full h-11 inline-flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Bezig met inloggen…" : "Inloggen"}
          </Button>

          <div className="flex items-center justify-between text-xs text-white/70">
            <button
              className="inline-flex items-center gap-1 hover:text-white/90 transition-colors"
              type="button"
              onClick={resendVerification}
              disabled={loading}
              title="E-mailverificatie opnieuw sturen"
            >
              <Mail className="h-3.5 w-3.5" />
              Verificatiemail opnieuw sturen
            </button>

            <button
              type="button"
              onClick={sendReset}
              disabled={sendingReset}
              className="hover:text-white/90 transition-colors"
              title="Wachtwoord vergeten"
            >
              {sendingReset ? "Reset sturen…" : "Wachtwoord vergeten?"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-white/70">
          Nog geen account?{" "}
          <Link to="/register" className="text-primary hover:underline">Registreren</Link>
        </div>
      </div>
    </div>
  );
}
