// src/pages/dashboard/Purchases.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, X, Paperclip, Download } from "lucide-react";

type Supplier = {
  id: string;
  name: string;
};

type Purchase = {
  id: string;
  number: number | null;
  number_str: string | null;
  supplier_id: string | null;
  currency: string;
  invoice_date: string;
  due_date: string | null;
  status: "draft" | "booked" | "paid" | "canceled";
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
};

type Attachment = {
  id: string;
  bucket: string;
  path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const STATUS = ["draft", "booked", "paid", "canceled"] as const;

function euro(v?: number | null) {
  if (v == null) return "€0,00";
  return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

export default function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [list, setList] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);

  // Form overlay
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Purchase>>({
    supplier_id: null,
    currency: "EUR",
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: null,
    status: "booked",
    notes: "",
  });
  const [items, setItems] = useState<Item[]>([
    { line_no: 1, description: "", qty: 1, unit_price: 0, vat_rate: 21 },
  ]);

  const supplierMap = (suppliers || []).reduce((m, s) => ({ ...m, [s.id]: s.name }), {} as Record<string,string>);

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

  const loadSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("id,name").order("name");
    if (data) setSuppliers(data as Supplier[]);
  };

  const loadPurchases = async () => {
    setLoading(true);
    setErr(null);
    let q = supabase.from("purchase_invoices").select("*").order("created_at", { ascending: false });

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

  const loadAttachments = async (purchaseId: string) => {
    const { data, error } = await supabase
      .from("attachments")
      .select("id,bucket,path,filename,mime_type,size_bytes,created_at")
      .eq("kind", "purchase")
      .eq("purchase_id", purchaseId)
      .order("created_at", { ascending: false });
    if (!error && data) setAttachments(data as Attachment[]);
  };

  useEffect(() => { loadSuppliers(); }, []);
  useEffect(() => { loadPurchases(); /*eslint-disable-next-line*/ }, [status, search]);

  const startCreate = () => {
    setEditing(null);
    setForm({
      supplier_id: null,
      currency: "EUR",
      invoice_date: new Date().toISOString().slice(0, 10),
      due_date: null,
      status: "booked",
      notes: "",
    });
    setItems([{ line_no: 1, description: "", qty: 1, unit_price: 0, vat_rate: 21 }]);
    setAttachments([]);
    setShowForm(true);
    setErr(null);
  };

  const startEdit = async (inv: Purchase) => {
    setEditing(inv);
    setForm({
      supplier_id: inv.supplier_id,
      currency: inv.currency,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      status: inv.status,
      notes: inv.notes ?? "",
    });
    const { data: its } = await supabase
      .from("purchase_items")
      .select("id,line_no,description,qty,unit_price,vat_rate")
      .eq("invoice_id", inv.id)
      .order("line_no");
    setItems((its as Item[]) || []);
    await loadAttachments(inv.id);
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

  const quickAddSupplier = async () => {
    const name = prompt("Naam leverancier:");
    if (!name || !name.trim()) return;
    const { data, error } = await supabase.from("suppliers").insert({ name: name.trim() }).select("id,name").single();
    if (!error && data) {
      setSuppliers((prev) => [...prev, data as Supplier].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((f) => ({ ...f, supplier_id: (data as Supplier).id }));
    } else if (error) {
      alert(error.message);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      let invoiceId = editing?.id;

      if (editing) {
        const { error } = await supabase
          .from("purchase_invoices")
          .update({
            supplier_id: form.supplier_id ?? null,
            currency: form.currency || "EUR",
            invoice_date: form.invoice_date || new Date().toISOString().slice(0, 10),
            due_date: form.due_date || null,
            status: (form.status as any) || "booked",
            notes: form.notes || null,
          })
          .eq("id", invoiceId);
        if (error) throw error;

        await supabase.from("purchase_items").delete().eq("invoice_id", invoiceId);
      } else {
        const { data, error } = await supabase
          .from("purchase_invoices")
          .insert({
            supplier_id: form.supplier_id ?? null,
            currency: form.currency || "EUR",
            invoice_date: form.invoice_date || new Date().toISOString().slice(0, 10),
            due_date: form.due_date || null,
            status: (form.status as any) || "booked",
            notes: form.notes || null,
          })
          .select("id")
          .single();
        if (error) throw error;
        invoiceId = (data as any).id as string;
      }

      if (!invoiceId) throw new Error("Purchase ID ontbreekt na opslaan.");

      if (items.length > 0) {
        const payload = items.map((r, i) => ({
          invoice_id: invoiceId,
          line_no: i + 1,
          description: r.description || "",
          qty: Number(r.qty) || 0,
          unit_price: Number(r.unit_price) || 0,
          vat_rate: Number(r.vat_rate) || 0,
        }));
        const { error: e2 } = await supabase.from("purchase_items").insert(payload);
        if (e2) throw e2;
      }

      setShowForm(false);
      setEditing(null);
      await loadPurchases();
    } catch (e: any) {
      setErr(e.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (inv: Purchase) => {
    if (!confirm(`Inkoopfactuur ${inv.number_str ?? inv.number ?? ""} verwijderen?`)) return;
    setErr(null);
    const { error } = await supabase.from("purchase_invoices").delete().eq("id", inv.id);
    if (error) setErr(error.message);
    else loadPurchases();
  };

  // ==== Bijlagen (inkoop) ====
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!editing?.id) {
      alert("Sla de inkoopfactuur eerst op, daarna kun je bijlagen toevoegen.");
      return;
    }
    setUploadBusy(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Geen gebruiker ingelogd.");
      const file = files[0];
      const path = `${user.id}/purchases/${editing.id}/${Date.now()}-${file.name}`;

      const { error: upErr } = await supabase
        .storage
        .from("documents")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("attachments").insert({
        owner: user.id,
        kind: "purchase",
        purchase_id: editing.id,
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inkoop</h1>
          <p className="text-white/70 mt-1">Boek je inkoopfacturen, bijlagen en voorbelasting (5b).</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              className="input pl-9 w-64"
              placeholder="Zoek op nummer/opmerking…"
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
            <Plus className="h-4 w-4 mr-2" /> Nieuwe inkoop
          </Button>
        </div>
      </div>

      {err && <p className="mt-3 text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="py-2 pr-4">Nummer</th>
              <th className="py-2 pr-4">Leverancier</th>
              <th className="py-2 pr-4">Datum</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Totaal</th>
              <th className="py-2 pr-4">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-6 text-center text-white/70">Laden…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-white/60">Nog geen inkoopfacturen.</td></tr>
            ) : list.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium">{inv.number_str ?? inv.number ?? "—"}</td>
                <td className="py-3 pr-4">{inv.supplier_id ? (supplierMap[inv.supplier_id] ?? inv.supplier_id) : "—"}</td>
                <td className="py-3 pr-4">{inv.invoice_date}</td>
                <td className="py-3 pr-4 capitalize">{inv.status}</td>
                <td className="py-3 pr-4">{euro(inv.total)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
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
                {editing ? `Inkoop ${editing.number_str ?? editing.number ?? ""}` : "Nieuwe inkoop"}
              </h2>
              <button className="btn-ghost h-9 px-3" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-1" /> Sluiten
              </button>
            </div>

            <form className="mt-4 space-y-5" onSubmit={onSubmit}>
              {/* Kop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Leverancier</Label>
                  <div className="flex gap-2">
                    <select
                      className="input mt-1 flex-1"
                      value={form.supplier_id ?? ""}
                      onChange={(e) => setForm({ ...form, supplier_id: e.target.value || null })}
                    >
                      <option value="">—</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <Button type="button" className="btn-ghost mt-1" onClick={quickAddSupplier}>Nieuwe</Button>
                  </div>
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
                    value={form.invoice_date ?? ""}
                    onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
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
                    placeholder="Bijv. boekingsreferentie…"
                  />
                </div>
              </div>

              {/* Regels */}
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
                  <p className="text-white/60 text-sm mt-2">Sla de inkoopfactuur eerst op om bijlagen toe te voegen.</p>
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
