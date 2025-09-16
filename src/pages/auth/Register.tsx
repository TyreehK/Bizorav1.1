// src/pages/auth/Register.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    // Confirm email UIT in Supabase → geen redirect nodig
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // emailRedirectTo: NIET meegeven in deze dev-variant
      },
    });

    setLoading(false);

    if (error) {
      const hint =
        error.status === 500
          ? "Mogelijk staat je Codespaces/localhost redirect niet whitelisted óf Confirm email staat nog aan zonder SMTP."
          : "";
      setErr(`${error.message}${hint ? `\n\n${hint}` : ""}`);
      return;
    }

    setMsg("Registratie gelukt. Je kunt nu inloggen met je wachtwoord.");
  };

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Account aanmaken</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="full_name">Naam</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Bezig..." : "Registreren"}
            </Button>

            {msg && (
              <p className="text-green-600 text-sm mt-2 whitespace-pre-wrap">
                {msg}
              </p>
            )}
            {err && (
              <p className="text-red-600 text-sm mt-2 whitespace-pre-wrap">
                {err}
              </p>
            )}

            <div className="mt-4 text-sm">
              Heb je al een account?{" "}
              <a href="/login" className="underline">
                Inloggen
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
