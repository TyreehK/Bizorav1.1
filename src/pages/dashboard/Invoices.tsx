// src/pages/dashboard/Invoices.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Printer, X, Paperclip, Download, Send } from "lucide-react";

type Invoice = {
  id: string;
  number: number | null;
  number_str: string | null;
  customer_id: string | null;
  currency: string;
  issue_date: string;
  due_date: string | null;
  status: "draft" | "sent" | "paid" | "canceled";
  notes: string | null;
  subtotal: number;
  vat_total: number;
  total: number;
  created_at: string;
  updated_at: string;
};

type Item = {
  id?: string;
  line_no: number;
  description: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
  line_subtotal?: number;
  line_vat?: number;
  line_total?: number;
};

type Customer = { id: string; name: string; email?: string | null };

type Attachment = {
  id: string;
  bucket: string;
  path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

type EmailLog = {
  id: string;
  to_email: string;
  subject: string | null;
  status: string;
  opened_at: string | null;
  created_at: string;
};

const STATUS = ["draft", "sent", "paid", "canceled"] as const;

function euro(v?: number | null) {
  if (v == null) return "€0,00";
  return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

// Bepaal functions base URL vanuit Vite env of Supabase URL
const VITE_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const FUNCTIONS_BASE =
  (import.meta as any).env?.VITE_FUNCTIONS_URL ||
  (VITE_SUPABASE_URL ? VITE_SUPABASE_URL.replace(".supabase.co", ".functions.supabase.co") : "");

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [list, setList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const customerMap = useMemo(() => {
    const m: Record<string, { name: string; email?: string | null }> = {};
    customers.forEach((c) => (m[c.id] = { name: c.name, email: c.email }));
    return m;
  }, [customers]);

  // Form overlay
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Invoice>>({
    customer_id: null,
    currency: "EUR",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: null,
    status: "draft",
    notes: "",
  });
  const [items, setItems] = useState<Item[]>([
    { line_no: 1, description: "", qty: 1, unit_price: 0, vat_rate: 21 },
  ]);

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);

  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const computed = useMemo(() => {
    const sub = items.reduce((s, it) => s + (it.qty || 0) * (it.unit_price || 0), 0);
    const vat = items.reduce((s, it) => s + ((it.qty || 0) * (it.unit_price || 0)) * ((it.vat_rate || 0) / 100), 0);
    const tot = sub + vat;
    return {
      subtotal: Math.round(sub * 100) / 100,
      vat_total: Math.round(vat * 100) / 100,
      total: Math.round(tot * 100) / 100,
    };
  }, [items]);

  const loadCustomers = async () => {
    const { data } = await supabase.from("customers").select("id,name,email").order("name");
    if (data) setCustomers(data as Customer[]);
  };

  const loadInvoices = async () => {
    setLoading(true);
    setErr(null);
    let q = supabase.from("invoices").select("*").order("created_at", { ascending: false });

    if (status !== "all") q = q.eq("status", status);
    if (search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      q = q.or(`number_str.ilike.${s},notes.ilike.${s}`);
    }

    const { data, error } = await q;
    if (error) {
      setErr(error.message);
      setList([]);
    } else {
      setList(data || []);
    }
    setLoading(false);
  };

  const loadAttachments = async (invoiceId: string) => {
    const { data } = await supabase
      .from("attachments")
      .select("id,bucket,path,filename,mime_type,size_bytes,created_at")
      .eq("kind", "invoice")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });
    if (data) setAttachments(data as Attachment[]);
  };

  const loadEmailLogs = async (invoiceId: string) => {
    const { data } = await supabase
      .from("email_logs")
      .select("id,to_email,subject,status,opened_at,created_at")
      .eq("kind", "invoice")
      .eq("target_id", invoiceId)
      .order("created_at", { ascending: false });
    if (data) setEmailLogs(data as EmailLog[]);
  };

  useEffect(() => { loadCustomers(); }, []);
  useEffect(() => { loadInvoices(); /*eslint-disable-next-line*/ }, [status, search]);

  const startCreate = () => {
    setEditing(null);
    setForm({
      customer_id: null,
      currency: "EUR",
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: null,
      status: "draft",
      notes: "",
    });
    setItems([{ line_no: 1, description: "", qty: 1, unit_price: 0, vat_rate: 21 }]);
    setAttachments([]);
    setEmailLogs([]);
    setEmailTo("");
    setEmailSubject("");
    setEmailMessage("");
    setShowForm(true);
    setErr(null);
  };

  const startEdit = async (inv: Invoice) => {
    setEditing(inv);
    setForm({
      customer_id: inv.customer_id,
      currency: inv.currency,
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      status: inv.status,
      notes: inv.notes ?? "",
    });
    const { data: its } = await supabase
      .from("invoice_items")
      .select("id,line_no,description,qty,unit_price,vat_rate")
      .eq("invoice_id", inv.id)
      .order("line_no");
    setItems((its as Item[]) || []);
    await loadAttachments(inv.id);
    await loadEmailLogs(inv.id);

    // default e-mail velden
    const customer = inv.customer_id ? customerMap[inv.customer_id] : undefined;
    setEmailTo(customer?.email || "");
    setEmailSubject(`Factuur ${inv.number_str ?? inv.number ?? inv.id.slice(0,8)}`);
    setEmailMessage(`Beste ${customer?.name || ""},

Bij deze ontvangt u de factuur ${inv.number_str ?? inv.number ?? inv.id.slice(0,8)}.

Met vriendelijke groet,
Bizora`);
    setShowForm(true);
    setErr(null);
  };

  const addRow = () => {
    const next = (items[items.length - 1]?.line_no ?? 0) + 1;
    setItems([...items, { line_no: next, description: "", qty: 1, unit_price: 0, vat_rate: 21 }]);
  };

  const removeRow = (line_no: number) => {
    setItems(items.filter((r) => r.line_no !== line_no).map((r, i) => ({ ...r, line_no: i + 1 })));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      let invoiceId = editing?.id;

      if (editing) {
        const { error } = await supabase
          .from("invoices")
          .update({
            customer_id: form.customer_id ?? null,
            currency: form.currency || "EUR",
            issue_date: form.issue_date || new Date().toISOString().slice(0, 10),
            due_date: form.due_date || null,
            status: (form.status as any) || "draft",
            notes: form.notes || null,
          })
          .eq("id", invoiceId);
        if (error) throw error;

        // Items reset & insert
        await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
      } else {
        const { data, error } = await supabase
          .from("invoices")
          .insert({
            customer_id: form.customer_id ?? null,
            currency: form.currency || "EUR",
            issue_date: form.issue_date || new Date().toISOString().slice(0, 10),
            due_date: form.due_date || null,
            status: (form.status as any) || "draft",
            notes: form.notes || null,
          })
          .select("id")
          .single();
        if (error) throw error;
        invoiceId = (data as any).id as string;
      }

      if (!invoiceId) throw new Error("Invoice ID ontbreekt na opslaan.");

      if (items.length > 0) {
        const payload = items.map((r, i) => ({
          invoice_id: invoiceId,
          line_no: i + 1,
          description: r.description || "",
          qty: Number(r.qty) || 0,
          unit_price: Number(r.unit_price) || 0,
          vat_rate: Number(r.vat_rate) || 0,
        }));
        const { error: e2 } = await supabase.from("invoice_items").insert(payload);
        if (e2) throw e2;
      }

      setShowForm(false);
      setEditing(null);
      await loadInvoices();
    } catch (e: any) {
      setErr(e.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (inv: Invoice) => {
    if (!confirm(`Factuur ${inv.number_str ?? inv.number ?? ""} verwijderen?`)) return;
    setErr(null);
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id);
    if (error) setErr(error.message);
    else loadInvoices();
  };

  // ==== Bijlagen ====
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!editing?.id) {
      alert("Sla de factuur eerst op, daarna kun je bijlagen toevoegen.");
      return;
    }
    setUploadBusy(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Geen gebruiker ingelogd.");
      const file = files[0];
      const path = `${user.id}/invoices/${editing.id}/${Date.now()}-${file.name}`;

      const { error: upErr } = await supabase
        .storage
        .from("documents")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("attachments").insert({
        owner: user.id,
        kind: "invoice",
        invoice_id: editing.id,
        bucket: "documents",
        path,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size
      });
      if (insErr) throw insErr;

      await loadAttachments(editing.id);
    } catch (e: any) {
      alert(e.message ?? "Upload mislukt.");
    } finally {
      setUploadBusy(false);
    }
  };

  const downloadAttachment = async (a: Attachment) => {
    const { data, error } = await supabase
      .storage
      .from(a.bucket)
      .createSignedUrl(a.path, 60);
    if (error || !data?.signedUrl) {
      alert(error?.message ?? "Kon geen download-link maken.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const deleteAttachment = async (a: Attachment) => {
    if (!confirm(`Verwijder bijlage "${a.filename}"?`)) return;
    try {
      const { error: delErr } = await supabase.storage.from(a.bucket).remove([a.path]);
      if (delErr) throw delErr;
      const { error: dbErr } = await supabase.from("attachments").delete().eq("id", a.id);
      if (dbErr) throw dbErr;
      if (editing?.id) await loadAttachments(editing.id);
    } catch (e: any) {
      alert(e.message ?? "Verwijderen mislukt.");
    }
  };

  // ==== E-mail verzenden ====
  const sendEmail = async () => {
    if (!editing?.id) return;
    if (!FUNCTIONS_BASE) {
      setEmailErr("Functions URL ontbreekt. Zet VITE_SUPABASE_URL of VITE_FUNCTIONS_URL.");
      return;
    }
    setEmailBusy(true);
    setEmailErr(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch(`${FUNCTIONS_BASE}/send-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          invoice_id: editing.id,
          to: emailTo,
          subject: emailSubject,
          message: emailMessage,
          attach_pdf: true,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Versturen mislukt.");
      await loadEmailLogs(editing.id);
      alert("E-mail verzonden.");
    } catch (e: any) {
      setEmailErr(e.message ?? "Versturen mislukt.");
    } finally {
      setEmailBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Facturen</h1>
          <p className="text-white/70 mt-1">Beheer facturen, items, bijlagen en verstuur per e-mail (met tracking).</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              className="input pl-9 w-64"
              placeholder="Zoek op nummer/omschrijving…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input h-11 w-40"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Alle statussen</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button className="btn-primary" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nieuwe factuur
          </Button>
        </div>
      </div>

      {err && <p className="mt-3 text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="py-2 pr-4">Nummer</th>
              <th className="py-2 pr-4">Klant</th>
              <th className="py-2 pr-4">Datum</th>
              <th className="py-2 pr-4">Vervaldatum</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Totaal</th>
              <th className="py-2 pr-4">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-6 text-center text-white/70">Laden…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="py-6 text-center text-white/60">Nog geen facturen.</td></tr>
            ) : list.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium">{inv.number_str ?? inv.number ?? "—"}</td>
                <td className="py-3 pr-4">
                  {inv.customer_id ? (customerMap[inv.customer_id]?.name ?? inv.customer_id) : "—"}
                </td>
                <td className="py-3 pr-4">{inv.issue_date}</td>
                <td className="py-3 pr-4">{inv.due_date ?? "—"}</td>
                <td className="py-3 pr-4 capitalize">{inv.status}</td>
                <td className="py-3 pr-4">{euro(inv.total)}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/dashboard/invoices/${inv.id}/print`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost h-9 px-3"
                      title="Print"
                    >
                      <Printer className="h-4 w-4 mr-1" /> Print
                    </a>
                    <button className="btn-ghost h-9 px-3" onClick={() => startEdit(inv)}>
                      <Pencil className="h-4 w-4 mr-1" /> Bewerken
                    </button>
                    <button className="btn-ghost h-9 px-3" onClick={() => onDelete(inv)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Verwijderen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overlay form */}
      {showForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-background p-6 card rounded-none overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? `Factuur ${editing.number_str ?? editing.number ?? ""}` : "Nieuwe factuur"}
              </h2>
              <button className="btn-ghost h-9 px-3" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-1" /> Sluiten
              </button>
            </div>

            <form className="mt-4 space-y-6" onSubmit={onSubmit}>
              {/* Kop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Klant</Label>
                  <select
                    className="input mt-1"
                    value={form.customer_id ?? ""}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value || null })}
                  >
                    <option value="">—</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    className="input mt-1"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Factuurdatum</Label>
                  <Input
                    className="input mt-1"
                    type="date"
                    value={form.issue_date ?? ""}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Vervaldatum</Label>
                  <Input
                    className="input mt-1"
                    type="date"
                    value={form.due_date ?? ""}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value || null })}
                  />
                </div>
                <div>
                  <Label>Valuta</Label>
                  <Input
                    className="input mt-1"
                    value={form.currency || "EUR"}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Opmerkingen</Label>
                  <Input
                    className="input mt-1"
                    value={form.notes ?? ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Bijv. betalingsvoorwaarden…"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Regels</h3>
                  <Button type="button" className="btn-ghost" onClick={addRow}>
                    <Plus className="h-4 w-4 mr-1" /> Regel toevoegen
                  </Button>
                </div>
                <div className="mt-2 overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/70 border-b border-white/10">
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Omschrijving</th>
                        <th className="py-2 pr-3">Aantal</th>
                        <th className="py-2 pr-3">Prijs</th>
                        <th className="py-2 pr-3">BTW %</th>
                        <th className="py-2 pr-3">Totaal (incl.)</th>
                        <th className="py-2 pr-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r, idx) => {
                        const subtotal = (Number(r.qty)||0) * (Number(r.unit_price)||0);
                        const vat = subtotal * ((Number(r.vat_rate)||0)/100);
                        const tot = subtotal + vat;
                        return (
                          <tr key={idx} className="border-b border-white/5">
                            <td className="py-2 pr-3 w-10 text-right">{idx+1}</td>
                            <td className="py-2 pr-3">
                              <Input className="input h-9"
                                value={r.description}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setItems(items.map((it,i)=> i===idx? {...it, description: v}: it));
                                }}
                                placeholder="Omschrijving"
                              />
                            </td>
                            <td className="py-2 pr-3 w-24">
                              <Input className="input h-9" type="number" step="0.01"
                                value={r.qty}
                                onChange={(e)=> {
                                  const v = Number(e.target.value);
                                  setItems(items.map((it,i)=> i===idx? {...it, qty: v}: it));
                                }}/>
                            </td>
                            <td className="py-2 pr-3 w-32">
                              <Input className="input h-9" type="number" step="0.01"
                                value={r.unit_price}
                                onChange={(e)=> {
                                  const v = Number(e.target.value);
                                  setItems(items.map((it,i)=> i===idx? {...it, unit_price: v}: it));
                                }}/>
                            </td>
                            <td className="py-2 pr-3 w-24">
                              <Input className="input h-9" type="number" step="0.01"
                                value={r.vat_rate}
                                onChange={(e)=> {
                                  const v = Number(e.target.value);
                                  setItems(items.map((it,i)=> i===idx? {...it, vat_rate: v}: it));
                                }}/>
                            </td>
                            <td className="py-2 pr-3 w-32">{euro(tot)}</td>
                            <td className="py-2 pr-3 w-28">
                              <button type="button" className="btn-ghost h-9 px-3" onClick={()=> removeRow(r.line_no)}>
                                <X className="h-4 w-4 mr-1" /> Verwijder
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totalen */}
              <div className="flex flex-col items-end gap-1">
                <div className="text-white/80 text-sm">Subtotaal: <span className="font-medium ml-2">{euro(computed.subtotal)}</span></div>
                <div className="text-white/80 text-sm">BTW: <span className="font-medium ml-2">{euro(computed.vat_total)}</span></div>
                <div className="text-lg font-bold">Totaal: <span className="ml-2">{euro(computed.total)}</span></div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Opslaan..." : "Opslaan"}
                </Button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuleren</button>
              </div>

              {err && <p className="text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

              {/* Bijlagen */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><Paperclip className="h-4 w-4" /> Bijlagen</h3>
                  <label className="btn-ghost cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e)=> handleUpload(e.target.files)}
                      disabled={uploadBusy || !editing?.id}
                    />
                    <span>{uploadBusy ? "Uploaden…" : "Upload"}</span>
                  </label>
                </div>
                {!editing?.id ? (
                  <p className="text-white/60 text-sm mt-2">Sla de factuur eerst op om bijlagen toe te voegen.</p>
                ) : attachments.length === 0 ? (
                  <p className="text-white/60 text-sm mt-2">Nog geen bijlagen.</p>
                ) : (
                  <div className="mt-2 divide-y divide-white/10">
                    {attachments.map((a) => (
                      <div key={a.id} className="py-2 flex items-center justify-between">
                        <div className="truncate">
                          <div className="font-medium truncate">{a.filename}</div>
                          <div className="text-xs text-white/60">
                            {(a.size_bytes ?? 0).toLocaleString()} bytes · {new Date(a.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="btn-ghost h-9 px-3" onClick={() => downloadAttachment(a)}>
                            <Download className="h-4 w-4 mr-1" /> Download
                          </button>
                          <button className="btn-ghost h-9 px-3" onClick={() => deleteAttachment(a)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Verwijderen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* E-mail verzenden */}
              <div className="mt-8 card p-4">
                <h3 className="font-semibold flex items-center gap-2"><Send className="h-4 w-4" /> Verstuur e-mail</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label>Aan (e-mail)</Label>
                    <Input className="input mt-1" value={emailTo} onChange={(e)=> setEmailTo(e.target.value)} placeholder="klant@domein.nl" />
                  </div>
                  <div>
                    <Label>Onderwerp</Label>
                    <Input className="input mt-1" value={emailSubject} onChange={(e)=> setEmailSubject(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Bericht</Label>
                    <textarea
                      className="input mt-1 h-32"
                      value={emailMessage}
                      onChange={(e)=> setEmailMessage(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button type="button" className="btn-primary" onClick={sendEmail} disabled={emailBusy || !editing?.id}>
                    <Send className="h-4 w-4 mr-1" /> {emailBusy ? "Versturen…" : "Verstuur"}
                  </Button>
                  {emailErr && <span className="text-red-400 text-sm">{emailErr}</span>}
                </div>

                {/* Historie */}
                <div className="mt-4">
                  <div className="text-sm text-white/70 mb-1">Verzendhistorie</div>
                  {emailLogs.length === 0 ? (
                    <div className="text-white/60 text-sm">Nog geen e-mails verzonden.</div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {emailLogs.map(l => (
                        <div key={l.id} className="py-2 text-sm flex items-center justify-between">
                          <div className="truncate">
                            <div className="font-medium truncate">{l.subject || "(geen onderwerp)"}</div>
                            <div className="text-white/60">Aan: {l.to_email}</div>
                          </div>
                          <div className="text-right text-white/70">
                            <div>Status: <span className="capitalize">{l.status}</span></div>
                            <div>{new Date(l.created_at).toLocaleString()}</div>
                            {l.opened_at && <div className="text-emerald-400">Geopend: {new Date(l.opened_at).toLocaleString()}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
