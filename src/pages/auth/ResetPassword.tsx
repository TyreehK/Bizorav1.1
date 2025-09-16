// src/pages/auth/ResetPassword.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/verify-email`,
    });

    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      setMsg("Reset e-mail verstuurd. Check je inbox.");
    }
  };

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Wachtwoord resetten</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Bezig..." : "Verzend reset-link"}
            </Button>
            {msg && <p className="text-green-600 text-sm mt-2">{msg}</p>}
            {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
