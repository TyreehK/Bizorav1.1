// src/hooks/useSupabaseAuth.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSupabaseAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, user };
}
