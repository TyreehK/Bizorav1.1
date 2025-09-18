// src/pages/dashboard/Loading.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function monthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const d2 = (d: Date) => d.toISOString().slice(0, 10);
  return { start: d2(start), end: d2(end) };
}

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const doneRef = useRef(false);

  useEffect(() => {
    const { start, end } = monthRange();

    // Prefetch KPI's + korte lijsten (niet strikt nodig, maar voelt snel)
    const prefetch = Promise.all([
      supabase.rpc("dashboard_kpis", { p_start: start, p_end: end }),
      supabase.from("invoices").select("id").order("created_at", { ascending: false }).limit(5),
      supabase.from("bank_transactions").select("id").eq("matched", false).order("tx_date", { ascending: false }).limit(5),
    ]).catch(() => { /* stil falen; UI gaat toch door */ });

    // Simuleer prettige voortgang
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p < 90) return p + Math.ceil(Math.random() * 10);
        return p;
      });
    }, 120);

    prefetch.finally(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      // Laat hem mooi naar 100 lopen
      const endTimer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            clearInterval(endTimer);
            navigate("/dashboard", { replace: true });
            return 100;
          }
          return p + 5;
        });
      }, 60);
    });

    return () => {
      clearInterval(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-[min(560px,92vw)] card p-6">
        <h1 className="text-xl font-semibold">Je omgeving wordt klaargezet…</h1>
        <p className="text-white/70 mt-1">Data ophalen en widgets voorbereiden</p>

        <div className="mt-6 h-3 w-full bg-white/10 rounded">
          <div
            className="h-3 rounded bg-primary transition-[width] duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-right text-white/70 text-sm mt-2">{Math.min(progress, 100)}%</div>
      </div>
    </div>
  );
}
