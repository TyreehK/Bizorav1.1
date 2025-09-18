// src/components/auth/RequireAuth.tsx
import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAuth({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [hasUser, setHasUser] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // 1) Initial session ophalen
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasUser(!!data.session?.user);
      setReady(true);
    });

    // 2) Luisteren op wijzigingen (incl. 'INITIAL_SESSION' event in v2)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasUser(!!session?.user);
      setReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!hasUser) {
      // niet ingelogd: wegleiden naar login
      navigate("/login", { replace: true });
    }
  }, [ready, hasUser, navigate]);

  if (!ready) {
    // eenvoudige skeleton, je kunt dit stylen zoals je wilt
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-[min(560px,92vw)] card p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="h-5 w-64 bg-white/10 rounded" />
            <div className="h-5 w-56 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // klaar en ingelogd
  return <>{children}</>;
}
