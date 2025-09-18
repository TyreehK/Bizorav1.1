// src/pages/dashboard/Customers.tsx
import { useMemo, useState } from "react";
import { useCustomers, useCustomerMutations, Customer } from "@/hooks/useCustomers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

type FormState = Partial<Customer>;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const emptyForm: FormState = useMemo(() => ({
    name: "",
    email: "",
    phone: "",
    company: "",
    vat_number: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    notes: "",
  }), []);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { list, count, key } = useCustomers(search);
  const { create, update, remove } = useCustomerMutations(key);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage(null);
    setErr(null);
  };

  const startEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      company: c.company ?? "",
      vat_number: c.vat_number ?? "",
      address: c.address ?? "",
      city: c.city ?? "",
      postal_code: c.postal_code ?? "",
      country: c.country ?? "",
      notes: c.notes ?? "",
    });
    setShowForm(true);
    setMessage(null);
    setErr(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); setErr(null);
    try {
      if (!form.name || form.name.trim().length < 2) {
        setErr("Naam is verplicht (min. 2 tekens).");
        return;
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, patch: form });
        setMessage("Klant bijgewerkt.");
      } else {
        await create.mutateAsync(form);
        setMessage("Klant toegevoegd.");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (e: any) {
      setErr(e.message ?? "Er ging iets mis.");
    }
  };

  const onDelete = async (c: Customer) => {
    if (!confirm(`Verwijder klant "${c.name}"?`)) return;
    setErr(null); setMessage(null);
    try {
      await remove.mutateAsync(c.id);
      setMessage("Klant verwijderd.");
    } catch (e: any) {
      setErr(e.message ?? "Verwijderen mislukt.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Klanten</h1>
          <p className="text-white/70 mt-1">
            Beheer relaties en klantgegevens.
            {typeof count.data === "number" && (
              <span className="ml-2 text-white/60">Totaal: {count.data}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              className="input pl-9 w-64"
              placeholder="Zoek op naam, e-mail, bedrijf, stad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="btn-primary" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nieuwe klant
          </Button>
        </div>
      </div>

      {/* Meldingen */}
      {message && <p className="mt-3 text-emerald-400 text-sm">{message}</p>}
      {err && <p className="mt-3 text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

      {/* Tabel */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="py-2 pr-4">Naam</th>
              <th className="py-2 pr-4">E-mail</th>
              <th className="py-2 pr-4">Bedrijf</th>
              <th className="py-2 pr-4">Plaats</th>
              <th className="py-2 pr-4">Aangemaakt</th>
              <th className="py-2 pr-4">Acties</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading ? (
              <tr><td colSpan={6} className="py-6 text-center text-white/70">Laden…</td></tr>
            ) : (list.data || []).length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-white/60">Geen klanten gevonden.</td></tr>
            ) : (
              list.data!.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{c.name}</td>
                  <td className="py-3 pr-4">{c.email ?? "-"}</td>
                  <td className="py-3 pr-4">{c.company ?? "-"}</td>
                  <td className="py-3 pr-4">{c.city ?? "-"}</td>
                  <td className="py-3 pr-4">{formatDate(c.created_at)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost h-9 px-3" onClick={() => startEdit(c)}>
                        <Pencil className="h-4 w-4 mr-1" /> Bewerken
                      </button>
                      <button className="btn-ghost h-9 px-3" onClick={() => onDelete(c)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Verwijderen
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Overlay Form (simpel, geen externe Dialog nodig) */}
      {showForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-background p-6 card rounded-none">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? "Klant bewerken" : "Nieuwe klant"}
              </h2>
              <button className="btn-ghost h-9 px-3" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-1" /> Sluiten
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="name">Naam *</Label>
                <Input id="name" className="input mt-1"
                       value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" className="input mt-1" type="email"
                         value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefoon</Label>
                  <Input id="phone" className="input mt-1"
                         value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Bedrijf</Label>
                <Input id="company" className="input mt-1"
                       value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vat_number">BTW-nummer</Label>
                  <Input id="vat_number" className="input mt-1"
                         value={form.vat_number || ""} onChange={(e) => setForm({ ...form, vat_number: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="country">Land</Label>
                  <Input id="country" className="input mt-1"
                         value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Input id="address" className="input mt-1"
                       value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Plaats</Label>
                  <Input id="city" className="input mt-1"
                         value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postcode</Label>
                  <Input id="postal_code" className="input mt-1"
                         value={form.postal_code || ""} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="notes">Opmerking</Label>
                  <Input id="notes" className="input mt-1"
                         value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="submit" className="btn-primary">
                  {editing ? "Opslaan" : "Toevoegen"}
                </Button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuleren</button>
              </div>

              {err && <p className="text-red-400 text-sm whitespace-pre-wrap">{err}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
