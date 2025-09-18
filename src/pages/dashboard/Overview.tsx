// src/pages/dashboard/Overview.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  FileText,
  Plus,
  UploadCloud,
  Users,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RcTooltip,
  Legend,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Types */
type KPIs = {
  revenue: number;
  expenses: number;
  open_count: number;
  open_total: number;
  overdue_count: number;
  overdue_total: number;
  unmatched_bank_count: number;
  vat_5b: number;
};
type InvoiceRow = {
  id: string;
  number: number | null;
  number_str: string | null;
  customer_id: string | null;
  total: number;
  status: "draft" | "sent" | "paid" | "canceled";
  issue_date: string;
  due_date: string | null;
};
type BankTx = {
  id: string;
  tx_date: string;
  amount: number;
  description: string | null;
  counterparty: string | null;
};
type MRE = { month_start: string; revenue: number; expenses: number };
type WCF = { week_start: string; incoming: number; outgoing: number; net: number };
type Aging = { bucket: string; count: number; total: number };

type AlertRow = {
  kind: "overdue" | "bank_unmatched" | "email_failed" | "profile_incomplete";
  message: string;
  severity: "info" | "warning" | "danger";
  link: string;
  count: number | null;
  total: number | null;
};

type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

type Onboarding = {
  has_profile: boolean;
  has_customer: boolean;
  has_invoice: boolean;
  has_bank_tx: boolean;
  steps_done: number;
  steps_total: number;
  progress: number;
};

/** Helpers */
function monthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const d2 = (d: Date) => d.toISOString().slice(0, 10);
  return { start: d2(start), end: d2(end) };
}
function euro(v?: number | null) {
  const n = Number(v || 0);
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}
function monthLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleString("nl-NL", { month: "short", year: "2-digit" });
}
function weekLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const dd = d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
  return `wk ${dd}`;
}

export default function Overview() {
  const [{ start, end }] = useState(monthRange);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [inv, setInv] = useState<InvoiceRow[]>([]);
  const [bank, setBank] = useState<BankTx[]>([]);
  const [mre, setMre] = useState<MRE[]>([]);
  const [wcf, setWcf] = useState<WCF[]>([]);
  const [aging, setAging] = useState<Aging[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [ob, setOb] = useState<Onboarding | null>(null);

  const [loading, setLoading] = useState(true);
  const [gLoading, setGLoading] = useState(true);
  const [aLoading, setALoading] = useState(true);
  const [tLoading, setTLoading] = useState(true);
  const [oLoading, setOLoading] = useState(true);

  const periodLabel = useMemo(() => {
    const d = new Date(start);
    return d.toLocaleString("nl-NL", { month: "long", year: "numeric" });
  }, [start]);

  /** Basis + lijsten */
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const [k, i, b] = await Promise.all([
        supabase.rpc("dashboard_kpis", { p_start: start, p_end: end }),
        supabase
          .from("invoices")
          .select("id,number,number_str,customer_id,total,status,issue_date,due_date")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("bank_transactions")
          .select("id,tx_date,amount,description,counterparty")
          .eq("matched", false)
          .order("tx_date", { ascending: false })
          .limit(5),
      ]);
      if (!alive) return;
      const krow = Array.isArray(k.data) ? (k.data[0] as KPIs | undefined) : null;
      setKpis(krow ?? null);
      setInv((i.data as InvoiceRow[]) || []);
      setBank((b.data as BankTx[]) || []);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [start, end]);

  /** Grafieken */
  useEffect(() => {
    let alive = true;
    async function loadCharts() {
      setGLoading(true);
      const [m, w, a] = await Promise.all([
        supabase.rpc("monthly_revenue_expense", { p_months: 12 }),
        supabase.rpc("weekly_cashflow", { p_weeks: 12 }),
        supabase.rpc("ar_aging"),
      ]);
      if (!alive) return;
      setMre(((m.data as MRE[]) || []).sort((x, y) => x.month_start.localeCompare(y.month_start)));
      setWcf(((w.data as WCF[]) || []).sort((x, y) => x.week_start.localeCompare(y.week_start)));
      setAging((a.data as Aging[]) || []);
      setGLoading(false);
    }
    loadCharts();
    return () => { alive = false; };
  }, []);

  /** Alerts */
  useEffect(() => {
    let alive = true;
    async function loadAlerts() {
      setALoading(true);
      const { data, error } = await supabase.rpc("dashboard_alerts");
      if (!alive) return;
      if (!error && data) setAlerts(data as AlertRow[]);
      setALoading(false);
    }
    loadAlerts();
    return () => { alive = false; };
  }, []);

  /** Taken */
  useEffect(() => {
    let alive = true;
    async function loadTasks() {
      setTLoading(true);
      const { data, error } = await supabase
        .from("user_tasks")
        .select("id,title,done,due_date,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!alive) return;
      if (!error && data) setTasks(data as Task[]);
      setTLoading(false);
    }
    loadTasks();
    return () => { alive = false; };
  }, []);

  /** Onboarding */
  useEffect(() => {
    let alive = true;
    async function loadOnboarding() {
      setOLoading(true);
      const { data, error } = await supabase.rpc("onboarding_state");
      if (!alive) return;
      if (!error) {
        const row = Array.isArray(data) ? (data[0] as Onboarding | undefined) : null;
        setOb(row ?? null);
      }
      setOLoading(false);
    }
    loadOnboarding();
    return () => { alive = false; };
  }, []);

  // Recharts data
  const mreData = useMemo(
    () => (mre || []).map((r) => ({ ...r, label: monthLabel(r.month_start) })),
    [mre]
  );
  const wcfData = useMemo(
    () => (wcf || []).map((r) => ({ ...r, label: weekLabel(r.week_start) })),
    [wcf]
  );
  const agingColors = ["#60a5fa", "#34d399", "#f59e0b", "#f87171"]; // 0-30, 31-60, 61-90, 90+

  /** Taken — acties */
  const refreshTasks = async () => {
    const { data } = await supabase
      .from("user_tasks")
      .select("id,title,done,due_date,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setTasks((data as Task[]) || []);
  };

  const addTask = async () => {
    const title = newTask.trim();
    if (!title) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase
      .from("user_tasks")
      .insert({ owner: user.id, title });
    if (!error) {
      setNewTask("");
      refreshTasks();
    } else {
      alert(error.message);
    }
  };

  const toggleTask = async (t: Task) => {
    const { error } = await supabase
      .from("user_tasks")
      .update({ done: !t.done })
      .eq("id", t.id);
    if (!error) refreshTasks();
  };

  const deleteTask = async (t: Task) => {
    if (!confirm(`Verwijder taak: "${t.title}"?`)) return;
    const { error } = await supabase.from("user_tasks").delete().eq("id", t.id);
    if (!error) refreshTasks();
  };

  /** UI */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overzicht</h1>
        <p className="text-white/70 mt-1">
          Periode: <span className="font-medium capitalize">
            {new Date(start).toLocaleString("nl-NL", { month: "long", year: "numeric" })}
          </span>
        </p>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Omzet (MTD)" value={kpis ? euro(kpis.revenue) : "—"} link="/dashboard/invoices" />
        <KpiCard title="Uitgaven (MTD)" value={kpis ? euro(kpis.expenses) : "—"} link="/dashboard/purchases" />
        <KpiCard title="Openstaand" value={kpis ? `${kpis.open_count} • ${euro(kpis.open_total)}` : "—"} link="/dashboard/invoices" />
        <KpiCard title="Achterstallig" value={kpis ? `${kpis.overdue_count} • ${euro(kpis.overdue_total)}` : "—"} link="/dashboard/invoices" />
        <KpiCard title="Te matchen bank" value={kpis ? String(kpis.unmatched_bank_count) : "—"} link="/dashboard/banking" />
        <KpiCard title="BTW 5b (MTD)" value={kpis ? euro(kpis.vat_5b) : "—"} link="/dashboard/vat" />
      </div>

      {/* Grafieken */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Omzet vs. Uitgaven (12 maanden)</h2>
          </div>
          <div className="h-64 mt-2">
            {gLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mreData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RcTooltip formatter={(v: any) => euro(Number(v))} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Omzet" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="expenses" name="Uitgaven" stroke="#34d399" fill="#34d399" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cashflow (12 weken)</h2>
          </div>
          <div className="h-64 mt-2">
            {gLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={wcfData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RcTooltip formatter={(v: any) => euro(Number(v))} />
                  <Legend />
                  <Bar dataKey="incoming" name="In" />
                  <Bar dataKey="outgoing" name="Uit" />
                  <Area type="monotone" dataKey="net" name="Netto" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Aging + Lijsten */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">A/R Aging (openstaand)</h2>
          </div>
          <div className="h-64 mt-2 flex items-center justify-center">
            {gLoading ? <ChartSkeleton /> : aging.length === 0 ? (
              <div className="text-white/60 text-sm">Geen openstaande facturen — netjes! 🎉</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RcTooltip formatter={(v: any) => euro(Number(v))} />
                  <Legend />
                  <Pie
                    data={aging.map((a) => ({ name: a.bucket, value: a.total }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {aging.map((_, i) => (
                      <Cell key={i} fill={["#60a5fa", "#34d399", "#f59e0b", "#f87171"][i % 4]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recente facturen</h2>
              <Link to="/dashboard/invoices" className="text-primary text-sm flex items-center gap-1">
                Alles bekijken <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-3 divide-y divide-white/10">
              {loading ? <SkeletonRows /> : inv.length === 0 ? (
                <div className="py-6 text-white/60 text-sm">Nog geen facturen.</div>
              ) : inv.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between">
                  <div className="truncate">
                    <div className="font-medium">
                      {f.number_str ?? f.number ?? f.id.slice(0, 8)}{" "}
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 ml-1 capitalize">{f.status}</span>
                    </div>
                    <div className="text-xs text-white/60">
                      Datum {f.issue_date} {f.due_date ? `• Vervaldatum ${f.due_date}` : ""}
                    </div>
                  </div>
                  <div className="text-right font-medium">{euro(f.total)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Te matchen banktransacties</h2>
              <Link to="/dashboard/banking" className="text-primary text-sm flex items-center gap-1">
                Naar bank <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-3 divide-y divide-white/10">
              {loading ? <SkeletonRows /> : bank.length === 0 ? (
                <div className="py-6 text-white/60 text-sm">Alles is gematcht. 🎉</div>
              ) : bank.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="truncate">
                    <div className="font-medium truncate">{t.description || t.counterparty || "Transactie"}</div>
                    <div className="text-xs text-white/60">{t.tx_date}</div>
                  </div>
                  <div className={`text-right font-medium ${t.amount < 0 ? "text-red-300" : "text-emerald-300"}`}>
                    {euro(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS + TAKEN + ONBOARDING */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Alerts */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alerts</h2>
            <Link to="/dashboard/settings" className="text-primary text-sm flex items-center gap-1">
              Instellingen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {aLoading ? (
              <SkeletonLines />
            ) : alerts.length === 0 ? (
              <div className="text-white/60 text-sm">Geen alerts.</div>
            ) : (
              alerts.map((a, i) => <AlertItem key={i} a={a} />)
            )}
          </div>
        </div>

        {/* Taken */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Taken</h2>
          <div className="mt-3 flex gap-2">
            <Input
              className="input flex-1"
              placeholder="Nieuwe taak…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button className="btn-primary" onClick={addTask}>
              <Plus className="h-4 w-4 mr-1" /> Toevoegen
            </Button>
          </div>
          <div className="mt-3 divide-y divide-white/10">
            {tLoading ? (
              <SkeletonRows />
            ) : tasks.length === 0 ? (
              <div className="py-6 text-white/60 text-sm">Nog geen taken.</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="py-2 flex items-center justify-between gap-3">
                  <button className="btn-ghost h-8 px-2" onClick={() => toggleTask(t)} title={t.done ? "Markeer als open" : "Markeer als klaar"}>
                    {t.done ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-white/70" />}
                  </button>
                  <div className={`flex-1 truncate ${t.done ? "line-through text-white/50" : ""}`}>{t.title}</div>
                  <button className="btn-ghost h-8 px-2" onClick={() => deleteTask(t)} title="Verwijderen">
                    <Trash2 className="h-4 w-4 text-white/70" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Onboarding checklist */}
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Onboarding</h2>
          {oLoading || !ob ? (
            <SkeletonLines />
          ) : (
            <>
              <div className="mt-2 h-2 w-full bg-white/10 rounded">
                <div
                  className="h-2 rounded bg-primary transition-[width]"
                  style={{ width: `${Math.min(ob.progress, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-white/70">
                Voortgang: {ob.steps_done}/{ob.steps_total} • {ob.progress}%
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <OnbRow ok={ob.has_profile} label="Profiel invullen" link="/dashboard/settings" />
                <OnbRow ok={ob.has_customer} label="Eerste klant toevoegen" link="/dashboard/customers" />
                <OnbRow ok={ob.has_invoice} label="Eerste factuur maken" link="/dashboard/invoices" />
                <OnbRow ok={ob.has_bank_tx} label="Bank CSV importeren" link="/dashboard/banking" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Snelacties */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Snelacties</h2>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction to="/dashboard/invoices" icon={<FileText className="h-4 w-4" />} label="Nieuwe factuur" />
          <QuickAction to="/dashboard/purchases" icon={<UploadCloud className="h-4 w-4" />} label="Inkoop uploaden" />
          <QuickAction to="/dashboard/customers" icon={<Users className="h-4 w-4" />} label="Nieuwe klant" />
          <QuickAction to="/dashboard/banking" icon={<Banknote className="h-4 w-4" />} label="Bank CSV import" />
        </div>
      </div>
    </div>
  );
}

/** Subcomponents */
function KpiCard({ title, value, link }: { title: string; value: string; link: string }) {
  return (
    <Link to={link} className="card p-4 hover:bg-white/5 transition-colors">
      <div className="text-sm text-white/60">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Link>
  );
}
function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="btn-ghost h-11 flex items-center justify-center gap-2">
      <Plus className="h-4 w-4" /> {icon} <span className="font-medium">{label}</span>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="py-3 flex items-center justify-between">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
function SkeletonLines() {
  return (
    <div className="animate-pulse space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-4 w-full bg-white/10 rounded" />
      ))}
    </div>
  );
}
function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse w-full">
        <div className="h-40 bg-white/10 rounded" />
      </div>
    </div>
  );
}

function AlertItem({ a }: { a: AlertRow }) {
  const Icon = a.severity === "danger" ? AlertTriangle : a.severity === "warning" ? AlertTriangle : Info;
  const tone =
    a.severity === "danger" ? "text-red-300" :
    a.severity === "warning" ? "text-amber-300" :
    "text-white/80";
  return (
    <Link to={a.link} className="flex items-start gap-3 p-2 rounded hover:bg-white/5">
      <Icon className={`h-4 w-4 ${tone} mt-0.5`} />
      <div className="flex-1">
        <div className="text-sm">{a.message}</div>
        {typeof a.total === "number" && a.total > 0 ? (
          <div className="text-xs text-white/60">{euro(a.total)}</div>
        ) : null}
      </div>
    </Link>
  );
}

function OnbRow({ ok, label, link }: { ok: boolean; label: string; link: string }) {
  return (
    <Link to={link} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
      {ok ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-white/70" />}
      <span className={ok ? "text-white/70 line-through" : ""}>{label}</span>
    </Link>
  );
}
