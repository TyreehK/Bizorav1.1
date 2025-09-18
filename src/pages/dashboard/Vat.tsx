// src/pages/dashboard/VAT.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Calculator, RefreshCcw } from "lucide-react";

type VatSummary = {
  base_21: number; vat_21: number;
  base_9: number;  vat_9: number;
  base_0: number;  vat_0: number;
  base_other: number; vat_other: number;
  base_total: number; vat_total: number; total_gross: number;
  lines_count: number; invoices_count: number;
};

type PeriodType = "month" | "quarter" | "year";

function euro(v?: number | null) {
  const n = v ?? 0;
  try { return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" }); }
  catch { return `€ ${n.toFixed(2)}`; }
}

function startEnd(periodType: PeriodType, year: number, monthOrQuarter?: number) {
  if (periodType === "year") {
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }
  if (periodType === "month") {
    const m = monthOrQuarter ?? 1;
    const last = new Date(year, m, 0).getDate();
    return { start: `${year}-${String(m).padStart(2,"0")}-01`, end: `${year}-${String(m).padStart(2,"0")}-${last}` };
  }
  const q = monthOrQuarter ?? 1;
  const mStart = (q-1)*3 + 1;
  const mEnd = mStart + 2;
  const last = new Date(year, mEnd, 0).getDate();
  return {
    start: `${year}-${String(mStart).padStart(2,"0")}-01`,
    end:   `${year}-${String(mEnd).padStart(2,"0")}-${last}`
  };
}

export default function VAT() {
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = today.getMonth() + 1;
  const defaultQuarter = Math.floor((defaultMonth-1)/3) + 1;

  const [periodType, setPeriodType] = useState<PeriodType>("quarter");
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);
  const [quarter, setQuarter] = useState<number>(defaultQuarter);

  const [sales, setSales] = useState<VatSummary | null>(null);
  const [purchases, setPurchases] = useState<VatSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { start, end } = useMemo(() => {
    if (periodType === "month") return startEnd("month", year, month);
    if (periodType === "quarter") return startEnd("quarter", year, quarter);
    return startEnd("year", year);
  }, [periodType, year, month, quarter]);

  const load = async () => {
    setLoading(true); setErr(null);
    const [r1, r2] = await Promise.all([
      supabase.rpc("vat_summary", { p_start: start, p_end: end }),
      supabase.rpc("input_vat_summary", { p_start: start, p_end: end })
    ]);
    if (r1.error) { setErr(r1.error.message); setLoading(false); return; }
    if (r2.error) { setErr(r2.error.message); setLoading(false); return; }
    setSales(r1.data as VatSummary);
    setPurchases(r2.data as VatSummary);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [start, end]);

  const outputVat = (sales?.vat_total ?? 0);
  const inputVat  = (purchases?.vat_total ?? 0);
  const toPay     = Math.max(0, outputVat - inputVat);
  const toClaim   = Math.max(0, inputVat - outputVat);

  return (
    <div>
      <h1 className="text-2xl font-bold">BTW-aangifte</h1>
      <p className="text-white/70 mt-1">
        Verkoop (1a/1b) en Voorbelasting (5b) op basis van facturen en inkoopfacturen.
      </p>

      {/* Filters */}
      <div className="card p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Periode</Label>
            <select className="input mt-1" value={periodType} onChange={(e) => setPeriodType(e.target.value as PeriodType)}>
              <option value="month">Maand</option>
              <option value="quarter">Kwartaal</option>
              <option value="year">Jaar</option>
            </select>
          </div>
          {periodType === "month" && (
            <div>
              <Label>Maand</Label>
              <select className="input mt-1" value={month} onChange={(e)=> setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_,i)=> <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
            </div>
          )}
          {periodType === "quarter" && (
            <div>
              <Label>Kwartaal</Label>
              <select className="input mt-1" value={quarter} onChange={(e)=> setQuarter(Number(e.target.value))}>
                {[1,2,3,4].map(q=> <option key={q} value={q}>Q{q}</option>)}
              </select>
            </div>
          )}
          <div>
            <Label>Jaar</Label>
            <Input className="input mt-1" type="number" value={year} onChange={(e)=> setYear(Number(e.target.value))}/>
          </div>
          <div className="flex items-end">
            <Button className="btn-ghost w-full md:w-auto" onClick={load} disabled={loading}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Vernieuwen
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-white/70 flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Periode: <span className="text-white ml-1">{start}</span> t/m <span className="text-white">{end}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <div className="card p-5">
          <div className="text-sm text-white/70">Omzet excl. btw</div>
          <div className="text-2xl font-extrabold mt-1">{euro(sales?.base_total)}</div>
          <div className="text-white/70 text-sm mt-1">Output-btw: <span className="text-white">{euro(sales?.vat_total)}</span></div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/70">Inkoop excl. btw</div>
          <div className="text-2xl font-extrabold mt-1">{euro(purchases?.base_total)}</div>
          <div className="text-white/70 text-sm mt-1">Voorbelasting (5b): <span className="text-white">{euro(purchases?.vat_total)}</span></div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/70">Netto</div>
          <div className="text-2xl font-extrabold mt-1">{toPay > 0 ? euro(toPay) : `-${euro(toClaim)}`}</div>
          <div className="text-white/70 text-sm mt-1">{toPay > 0 ? "Te betalen" : "Terug te vragen"}</div>
        </div>
      </div>

      {/* Samenvatting */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Samenvatting voor aangifte</h2>
          <div className="text-white/60 text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Verkoop: status sent/paid · Inkoop: status booked/paid
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-white/70">Laden…</p>
        ) : err ? (
          <p className="mt-4 text-red-400 whitespace-pre-wrap">{err}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>1a Leveringen/diensten belast 21% — Omzet</div>
                <div>{euro(sales?.base_21)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>1a BTW 21%</div>
                <div>{euro(sales?.vat_21)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>1b Leveringen/diensten belast 9% — Omzet</div>
                <div>{euro(sales?.base_9)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>1b BTW 9%</div>
                <div>{euro(sales?.vat_9)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>1e Leveringen 0%/vrijgesteld — Omzet</div>
                <div>{euro((sales?.base_0 ?? 0) + (sales?.base_other ?? 0))}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>Omzet totaal excl. btw</div>
                <div>{euro(sales?.base_total)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Output-btw</div>
                <div>{euro(sales?.vat_total)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>5b Voorbelasting (inkoop-btw)</div>
                <div>{euro(purchases?.vat_total)}</div>
              </div>
              <div className="flex items-center justify-between text-xl font-extrabold">
                <div>Te betalen / terug te vragen</div>
                <div>{toPay > 0 ? euro(toPay) : `-${euro(toClaim)}`}</div>
              </div>
            </div>
          </div>
        )}

        <p className="text-white/60 text-xs mt-4">
          Tip: boek inkoopfacturen op status <strong>booked</strong> of <strong>paid</strong> om ze in 5b mee te tellen.
        </p>
      </div>
    </div>
  );
}
