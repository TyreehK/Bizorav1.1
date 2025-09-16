// src/pages/auth/Login.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingPw, setLoadingPw] = useState(false);
  const [loadingMl, setLoadingMl] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const loginWithMagicLink = async () => {
    setLoadingMl(true);
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    setLoadingMl(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("Magic link verstuurd. Check je e-mail.");
  };

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Inloggen</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={loginWithPassword}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Wachtwoord</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button type="submit" disabled={loadingPw} className="w-full">
              {loadingPw ? "Bezig..." : "Inloggen"}
            </Button>

            <Button type="button" variant="secondary" disabled={loadingMl} className="w-full mt-2" onClick={loginWithMagicLink}>
              {loadingMl ? "Verzenden..." : "Stuur magic link"}
            </Button>

            {msg && <p className="text-green-600 text-sm mt-2">{msg}</p>}
            {err && <p className="text-red-600 text-sm mt-2">{err}</p>}

            <div className="mt-4 text-sm flex justify-between">
              <a href="/register" className="underline">
                Account aanmaken
              </a>
              <a href="/reset-password" className="underline">
                Wachtwoord vergeten
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
