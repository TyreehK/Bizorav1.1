// src/pages/auth/EmailDiagnostics.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailDiagnostics() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState<string>("");

  const redirect = `${window.location.origin}/verify-email`;

  const trySignup = async () => {
    setOut("Signup: bezig...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: crypto.getRandomValues(new Uint32Array(1))[0].toString(36) + "Aa1!",
      options: { emailRedirectTo: redirect },
    });
    if (error) setOut(`Signup error: ${error.message}`);
    else setOut(`Signup OK. Data: ${JSON.stringify(data)}`);
  };

  const tryMagicLink = async () => {
    setOut("Magic link: bezig...");
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    });
    if (error) setOut(`Magic link error: ${error.message}`);
    else setOut(`Magic link OK. Data: ${JSON.stringify(data)}`);
  };

  return (
    <div className="container mx-auto max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>SMTP / Email Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Test e-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourdomain.nl" />
          </div>
          <div className="flex gap-2">
            <Button onClick={trySignup}>Test Signup (met bevestigingsmail)</Button>
            <Button variant="secondary" onClick={tryMagicLink}>Test Magic Link</Button>
          </div>
          {out && (
            <pre className="mt-4 whitespace-pre-wrap text-sm bg-muted p-3 rounded">{out}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
