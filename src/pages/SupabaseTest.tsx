// src/pages/SupabaseTest.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Status = "idle" | "ok" | "warn" | "error";

export default function SupabaseTest() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // 1) Check alleen of we kunnen praten met Supabase (geen login vereist)
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus("error");
        setMessage(`Init/auth error: ${error.message}`);
        return;
      }
      // Als er géén session is, is dat prima: we zijn anoniem verbonden.
      if (!data?.session) {
        setStatus("ok");
        setMessage("Geen sessie (anoniem) — verbinding met Supabase OK.");
      } else {
        setStatus("ok");
        setMessage("Ingelogde sessie gevonden — verbinding met Supabase OK.");
      }
    }).catch((e) => {
      setStatus("error");
      setMessage(`Netwerk/Init exception: ${(e as Error).message}`);
    });
  }, []);

  const handleLogSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log("Supabase session:", data, "error:", error);
    alert("Session gelogd in de console.");
  };

  const handleTryUser = async () => {
    // 2) Optioneel: laat zien dat getUser() zonder sessie een nette waarschuwing geeft
    const { data, error } = await supabase.auth.getUser();
    if (error?.message?.toLowerCase().includes("session missing")) {
      setStatus("warn");
      setMessage("getUser(): geen sessie aanwezig (verwacht). Login is nog niet opgezet.");
    } else if (error) {
      setStatus("error");
      setMessage(`getUser() error: ${error.message}`);
    } else {
      setStatus("ok");
      setMessage(`getUser(): user gevonden: ${data.user?.email ?? data.user?.id}`);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Verbindingscheck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium">
              {status === "idle" && "Controleren..."}
              {status === "ok" && "✅ OK — verbinding werkt"}
              {status === "warn" && "⚠️ Let op — geen sessie (verwacht zonder login)"}
              {status === "error" && "❌ Fout — zie bericht hieronder"}
            </div>
          </div>

          {message && (
            <pre className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
              {message}
            </pre>
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleLogSession}>
              Session naar console loggen
            </Button>
            <Button onClick={handleTryUser}>
              Probeer getUser()
            </Button>
            <a className="text-sm underline" href="/">
              Terug naar Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
