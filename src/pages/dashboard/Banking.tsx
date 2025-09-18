// src/pages/dashboard/Banking.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadCloud, RefreshCcw, Check, X, Search } from "lucide-react";

type Tx = {
  id: string;
  tx_date: string;
  amount: number;
  currency: string;
  description: string | null;
  counterparty: string | null;
  iban: string | null;
  reference: string | null;
  source: string | null;
  matched: boolean;
  matched_invoice_id: string | null;
  matched_purchase_id: string | null;
};

type InvoiceLite = { id: string; number_str: string | null; total: number; issue_date: string; status: string };
type PurchaseLite = { id: string; number_str: string | null; total: number; invoice_date: string; status: string };

function euro(v: number) {
  return v.toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function parseNumber(s: string): number {
  // ondersteunt "1.234,56" (NL) en "1,234.56" / "1234.56"
  let t = s.trim();
  if (!t) return 0;
  // als komma als decimaal gebruikt wordt:
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && !hasDot) {
    t = t.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && hasDot) {
    // 1.234,56 -> verwijder punten (thousands), vervang komma door punt
    if (t.lastIndexOf(",") > t.lastIndexOf(".")) {
      t = t.replace(/\./g, "").replace(",", ".");
    } else {
      t = t.replace(/,/g, "");
    }
  } else {
    t = t.replace(/,/g, "");
  }
  const n = Number(t);
  return isNaN(n) ? 0 : n;
}

function simpleCSV(text: string): string[][] {
  // Zeer eenvoudige CSV parser met ondersteuning voor quotes en ; of , als delimiter.
  const firstLine = text.split(/\r?\n/)[0] || "";
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows: string[][] = [];
  let i = 0, field = "", row: string[] = [], inQuotes = false;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      } else { field += c; i++; continue; }
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === delimiter) { row.push(field); field = ""; i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      if (c === '\r') { i++; continue; }
      field += c; i++; continue;
    }
  }
  // laatste veld
  row.push(field);
  rows.push(row);
  // verwijder lege trailing rijen
  return rows.filter(r => r.some(cell => cell.trim() !== ""));
}

function sha1(str: string) {
  // simpele hash (niet cryptografisch sterk, wel stabiel genoeg voor dedupe in UI)
  let h = 0, i, chr;
  if (str.length === 0) return "0";
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    h = ((h << 5) - h) + chr;
    h |= 0;
  }
  return String(h);
}

export default function BankingPage() {
  const [unmatched, setUnmatched] = useState<Tx[]>([]);
  const [matched, setMatched] = useState<Tx[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const [openInvoices, setOpenInvoices] = useState<InvoiceLite[]>([]);
  const [openPurchases, setOpenPurchases] = useState<PurchaseLite[]>([]);

  const filteredUnmatched = useMemo(() => {
    if (!search.trim()) return unmatched;
    const q = search.toLowerCase();
    return unmatched.filter(tx =>
      (tx.description || "").toLowerCase().includes(q) ||
      (tx.counterparty || "").toLowerCase().includes(q) ||
      (tx.reference || "").toLowerCase().includes(q)
    );
  }, [unmatched, search]);

  const load = async () => {
    setErr(null);
    const [txs, txs2, inv, pur] = await Promise.all([
      supabase.from("bank_transactions").select("*").eq("matched", false).order("tx_date", { ascending: false }),
      supabase.from("bank_transactions").select("*").eq("matched", true).order("tx_date", { ascending: false }).limit(50),
      supabase.from("invoices").select("id, number_str, total, issue_date, status").in("status", ["draft","sent"]),
      supabase.from("purchase_invoices").select("id, number_str, total, invoice_date, status").in("status", ["draft","booked"])
    ]);
    if (txs.error) setErr(txs.error.message);
    else setUnmatched((txs.data as Tx[]) || []);
    if (txs2.error) setErr(txs2.error.message);
    else setMatched((txs2.data as Tx[]) || []);
    if (!inv.error && inv.data) setOpenInvoices(inv.data as InvoiceLite[]);
    if (!pur.error && pur.data) setOpenPurchases(pur.data as PurchaseLite[]);
  };

  useEffect(() => { load(); }, []);

  // Auto-suggestie: exacte bedrag + datum in bereik
  function suggest(tx: Tx): { kind: "invoice"|"purchase"; id: string; label: string } | null {
    const windowDays = 30;
    const txDate = new Date(tx.tx_date).getTime();
    if (tx.amount > 0) {
      // inkomend -> verkoopfacturen
      const hit = openInvoices.find(i =>
        Math.abs(i.total - tx.amount) < 0.005 &&
        Math.abs(new Date(i.issue_date).getTime() - txDate) <= windowDays*86400000
      );
      return hit ? { kind: "invoice", id: hit.id, label: hit.number_str || hit.id.slice(0,8) } : null;
    } else if (tx.amount < 0) {
      const hit = openPurchases.find(p =>
        Math.abs(p.total - Math.abs(tx.amount)) < 0.005 &&
        Math.abs(new Date(p.invoice_date).getTime() - txDate) <= windowDays*86400000
      );
      return hit ? { kind: "purchase", id: hit.id, label: hit.number_str || hit.id.slice(0,8) } : null;
    }
    return null;
  }

  async function importCSV(file: File) {
    setBusy(true); setErr(null);
    try {
      const text = await file.text();
      const rows = simpleCSV(text);
      if (!rows.length) throw new Error("Leeg CSV-bestand");
      const headers = rows[0].map(h => h.trim().toLowerCase());

      // autodetect kolommen
      const idxDate = headers.findIndex(h => ["date","datum","boekdatum","transactiedatum"].includes(h));
      const idxDesc = headers.findIndex(h => ["description","omschrijving","naam tegenpartij","mededelingen","omschrijving/mededelingen"].includes(h));
      const idxAmount = headers.findIndex(h => ["amount","bedrag","mutatie","saldo mutatie"].includes(h));
      const idxCred = headers.findIndex(h => ["credit","bij","bijschrijving"].includes(h));
      const idxDeb = headers.findIndex(h => ["debit","af","afschrijving"].includes(h));
      const idxIban = headers.findIndex(h => ["iban","rekening","rekeningnummer"].includes(h));
      const idxRef  = headers.findIndex(h => ["reference","kenmerk","betalingskenmerk","omschrijving 1"].includes(h));
      const idxCp   = headers.findIndex(h => ["counterparty","tegenrekening","naam tegenpartij"].includes(h));

      if (idxDate < 0 || (idxAmount < 0 && (idxCred < 0 || idxDeb < 0))) {
        throw new Error("Kopregels niet herkend. Vereist: datum + (bedrag of credit+debit).");
      }

      const payload: any[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const rawDate = (row[idxDate] || "").trim();
        if (!rawDate) continue;

        // probeer ISO, anders dd-mm-yyyy of dd/mm/yyyy
        let iso = rawDate;
        if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(rawDate)) {
          const [d, m, y] = rawDate.split(/[-/]/);
          iso = `${y}-${m}-${d}`;
        }

        let amount = 0;
        if (idxAmount >= 0 && row[idxAmount]) {
          amount = parseNumber(String(row[idxAmount]));
        } else {
          const credit = idxCred >= 0 ? parseNumber(String(row[idxCred] || "0")) : 0;
          const debit  = idxDeb >= 0 ? parseNumber(String(row[idxDeb]  || "0")) : 0;
          amount = credit - debit; // bij - af
        }

        const desc = idxDesc >= 0 ? row[idxDesc] || "" : "";
        const cp   = idxCp  >= 0 ? row[idxCp]  || "" : "";
        const iban = idxIban>= 0 ? row[idxIban]|| "" : "";
        const ref  = idxRef >= 0 ? row[idxRef] || "" : "";
        const source = `csv:${file.name}`;

        const hash = sha1([iso, amount.toFixed(2), desc, cp, iban, ref].join("|").toLowerCase());

        payload.push({
          owner: (await supabase.auth.getUser()).data.user?.id,
          tx_date: iso,
          amount,
          currency: "EUR",
          description: desc || null,
          counterparty: cp || null,
          iban: iban || null,
          reference: ref || null,
          source,
          hash,
          matched: false
        });
      }

      if (!payload.length) throw new Error("Geen rijen om te importeren.");

      // upsert met dedupe op (owner, hash)
      const { error } = await supabase
        .from("bank_transactions")
        .upsert(payload, { onConflict: "owner,hash", ignoreDuplicates: true });
      if (error) throw error;

      await load();
    } catch (e: any) {
      setErr(e.message ?? "Import mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function reconcileInvoice(txId: string, invoiceId: string) {
    setBusy(true); setErr(null);
    const { error } = await supabase.rpc("reconcile_invoice_payment", { p_tx: txId, p_invoice: invoiceId });
    if (error) setErr(error.message);
    await load();
    setBusy(false);
  }

  async function reconcilePurchase(txId: string, purchaseId: string) {
    setBusy(true); setErr(null);
    const { error } = await supabase.rpc("reconcile_purchase_payment", { p_tx: txId, p_purchase: purchaseId });
    if (error) setErr(error.message);
    await load();
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bank / Transacties</h1>
          <p className="text-white/70 mt-1">Importeer, bekijk en letter af op facturen/inkoop.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              className="input pl-9 w-64"
              placeholder="Zoek in omschrijving/tegenrekening…"
              value={search}
              onChange={(e)=> setSearch(e.target.value)}
            />
          </div>
          <Label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            <span>CSV import</span>
            <input type="file" className="hidden" accept=".csv,text/csv" onChange={(e)=> e.target.files && importCSV(e.target.files[0])} disabled={busy}/>
          </Label>
          <Button className="btn-ghost" onClick={load} disabled={busy}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Vernieuwen
          </Button>
        </div>
      </div>

      {err && <p className="mt-3 text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

      {/* Onverwerkt */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Onverwerkt</h2>
          <div className="text-white/60 text-sm">{filteredUnmatched.length} transacties</div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-white/70 border-b border-white/10">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Omschrijving</th>
                <th className="py-2 pr-4">Tegenpartij</th>
                <th className="py-2 pr-4">Bedrag</th>
                <th className="py-2 pr-4">Suggestie</th>
                <th className="py-2 pr-4">Actie</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnmatched.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-white/60">Geen onverwerkte transacties.</td></tr>
              ) : filteredUnmatched.map(tx => {
                const s = suggest(tx);
                return (
                  <tr key={tx.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">{tx.tx_date}</td>
                    <td className="py-3 pr-4">{tx.description || "-"}</td>
                    <td className="py-3 pr-4">{tx.counterparty || tx.iban || "-"}</td>
                    <td className="py-3 pr-4">{euro(tx.amount)}</td>
                    <td className="py-3 pr-4">{s ? (s.kind === "invoice" ? `Factuur ${s.label}` : `Inkoop ${s.label}`) : "—"}</td>
                    <td className="py-3 pr-4">
                      {s ? (
                        <Button
                          className="btn-primary h-9 px-3"
                          onClick={() => s.kind === "invoice" ? reconcileInvoice(tx.id, s.id) : reconcilePurchase(tx.id, s.id)}
                          disabled={busy}
                        >
                          <Check className="h-4 w-4 mr-1" /> Afletteren
                        </Button>
                      ) : (
                        <span className="text-white/50 text-xs">Geen match</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verwerkt (laatste 50) */}
      <div className="card p-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Verwerkt (laatste)</h2>
          <div className="text-white/60 text-sm">{matched.length} transacties</div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-white/70 border-b border-white/10">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Omschrijving</th>
                <th className="py-2 pr-4">Bedrag</th>
                <th className="py-2 pr-4">Gekoppeld aan</th>
              </tr>
            </thead>
            <tbody>
              {matched.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-white/60">Nog niets verwerkt.</td></tr>
              ) : matched.map(tx => (
                <tr key={tx.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">{tx.tx_date}</td>
                  <td className="py-3 pr-4">{tx.description || "-"}</td>
                  <td className="py-3 pr-4">{euro(tx.amount)}</td>
                  <td className="py-3 pr-4">
                    {tx.matched_invoice_id ? `Factuur ${tx.matched_invoice_id.slice(0,8)}` :
                     tx.matched_purchase_id ? `Inkoop ${tx.matched_purchase_id.slice(0,8)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
