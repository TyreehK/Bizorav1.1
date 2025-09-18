// src/pages/Boot.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function Boot() {
  const { user } = useSupabaseAuth();
  const nav = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // beveiligd: als niet ingelogd, terug naar /login
    if (!user) {
      nav("/login", { replace: true });
      return;
    }
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.floor(Math.random() * 10) + 5, 100);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => nav("/dashboard", { replace: true }), 500);
        }
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [user, nav]);

  return (
    <div className="pt-24">
      <div className="container-page max-w-xl">
        <Card className="card p-8">
          <h1 className="text-2xl font-bold">Je omgeving wordt klaargezet…</h1>
          <p className="text-white/70 mt-2 text-sm">
            We laden je modules en voorkeuren. Een momentje maar.
          </p>

          <div className="mt-6">
            <div className="w-full h-3 rounded-xl bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-white/80">{progress}%</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
