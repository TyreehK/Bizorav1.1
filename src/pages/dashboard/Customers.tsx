// src/pages/dashboard/Customers.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  created_at?: string;
};

export default function Customers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("id,name,email,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) setErrorMsg(error.message);
    setList((data as Customer[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nameTrim = name.trim();
    if (!nameTrim) {
      setErrorMsg("Naam is verplicht.");
      return;
    }

    // ✅ Zeker weten dat we een geldige sessie hebben (voorkomt 401)
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      setErrorMsg("Je sessie is verlopen. Log opnieuw in.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("customers")
      .insert([{ name: nameTrim, email: email.trim() || null }])
      .select();

    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setName("");
    setEmail("");
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Klanten</h1>
        <p className="text-white/70 mt-1">
          Voeg klanten toe en beheer je relaties. Je bent ingelogd; RLS zet de rij op jouw account.
        </p>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold">Nieuwe klant</h2>
        <form onSubmit={onSubmit} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            className="input"
            placeholder="Bedrijfsnaam *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            className="input"
            type="email"
            placeholder="E-mail (optioneel)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Opslaan…" : "Toevoegen"}
          </Button>
        </form>
        {errorMsg && <div className="text-red-300 text-sm mt-2">{errorMsg}</div>}
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold">Laatst toegevoegd</h2>
        {loading ? (
          <div className="animate-pulse mt-3 space-y-2">
            <div className="h-4 w-2/3 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
            <div className="h-4 w-3/5 bg-white/10 rounded" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-white/60 text-sm mt-3">Nog geen klanten.</div>
        ) : (
          <ul className="mt-3 divide-y divide-white/10">
            {list.map((c) => (
              <li key={c.id} className="py-2">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-white/60">{c.email || "—"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
