// src/pages/auth/CompleteProfile.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "bizora.pendingProfile";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) {
        setErr("Geen geldige sessie gevonden. Log in.");
        setState("error");
        return;
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Niks te doen; ga door
        setState("done");
        setTimeout(() => navigate("/dashboard/loading", { replace: true }), 400);
        return;
      }

      try {
        const payload = JSON.parse(raw);
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: user.id, ...payload }, { onConflict: "id" });

        if (error) {
          setErr(error.message);
          setState("error");
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        setState("done");
        setTimeout(() => navigate("/dashboard/loading", { replace: true }), 500);
      } catch (e: any) {
        setErr(e?.message || "Onbekende fout");
        setState("error");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-[min(520px,92vw)] card p-6 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-white/80" />
            <div className="mt-2 text-white/80">Bezig met afronden…</div>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400" />
            <div className="mt-2 text-white/80">Profiel afgerond. Je wordt doorgestuurd…</div>
          </>
        )}
        {state === "error" && (
          <>
            <div className="text-red-300 font-medium">Er ging iets mis</div>
            <div className="mt-1 text-white/70 text-sm">{err}</div>
          </>
        )}
      </div>
    </div>
  );
}
