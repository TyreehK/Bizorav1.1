// src/pages/auth/ResetPassword.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Zorg dat er een sessie is (na reset-link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) {
        setErr("Geen geldige reset-sessie gevonden. Vraag opnieuw een reset-link aan.");
      }
    });
  }, []);

  const canSubmit = pw1.length >= 6 && pw1 === pw2 && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!canSubmit) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("Wachtwoord succesvol bijgewerkt.");
    setTimeout(() => navigate("/login", { replace: true }), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-[min(480px,92vw)] card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-primary rounded flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Nieuw wachtwoord</h1>
            <p className="text-sm text-white/60">Kies een nieuw wachtwoord voor je account.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-white/80">Nieuw wachtwoord</label>
            <Input
              className="input mt-1"
              type="password"
              placeholder="Minimaal 6 tekens"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/80">Herhaal wachtwoord</label>
            <Input
              className="input mt-1"
              type="password"
              placeholder="Herhaal"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              required
            />
          </div>

          {err && <div className="text-sm text-red-300">{err}</div>}
          {msg && (
            <div className="text-sm text-emerald-300 inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {msg}
            </div>
          )}

          <Button type="submit" disabled={!canSubmit} className="btn-primary w-full h-11 inline-flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {loading ? "Bijwerken…" : "Wachtwoord bijwerken"}
          </Button>
        </form>
      </div>
    </div>
  );
}
