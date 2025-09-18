// src/pages/PostLogin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PostLogin() {
  const nav = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: number;
    let step = 0;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        nav("/login", { replace: true });
        return;
      }
      // Fake load → ~1.5s
      timer = window.setInterval(() => {
        step += 2 + Math.round(Math.random() * 3);
        setProgress((p) => Math.min(100, p + step));
      }, 90);
    };

    check();

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [nav]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => nav("/dashboard", { replace: true }), 300);
      return () => clearTimeout(t);
    }
  }, [progress, nav]);

  return (
    <div className="pt-24">
      <div className="container-page max-w-xl">
        <div className="card p-8">
          <h1 className="text-2xl font-bold">Je omgeving wordt klaargezet…</h1>
          <p className="text-white/70 mt-2">Modules initialiseren en je profiel inladen.</p>
          <div className="mt-6">
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right text-sm text-white/80 mt-2">{progress}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
