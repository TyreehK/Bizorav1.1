// src/pages/auth/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const [msg, setMsg] = useState("Verifiëren...");

  useEffect(() => {
    // Als je via magic link/verify terugkomt, is de sessie al gezet door Supabase SDK.
    // We doen hier enkel een check en sturen dan door.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setMsg("E-mail geverifieerd. Je wordt doorgestuurd naar het dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setMsg("Geen actieve sessie gevonden. Je kunt nu inloggen.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    });
  }, []);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      <div className="text-sm text-muted-foreground">{msg}</div>
    </div>
  );
}
