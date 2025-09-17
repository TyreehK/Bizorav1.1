import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const [msg, setMsg] = useState("Verifiëren...");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setMsg("E-mail geverifieerd. Doorschakelen naar dashboard...");
        setTimeout(() => (window.location.href = "/dashboard"), 700);
      } else {
        setMsg("Geen actieve sessie gevonden. Je kunt nu inloggen.");
        setTimeout(() => (window.location.href = "/login"), 1100);
      }
    });
  }, []);

  return (
    <div className="pt-24">
      <div className="container-page max-w-md">
        <div className="card p-8 text-center">
          <p className="text-white/90">{msg}</p>
        </div>
      </div>
    </div>
  );
}
