// src/pages/dashboard/invoices/InvoicePrint.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Invoice = {
  id: string;
  number_str: string | null;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  subtotal: number;
  vat_total: number;
  total: number;
  currency: string;
  customer_id: string | null;
};

type Item = {
  line_no: number;
  description: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
};

type Customer = { id: string; name: string; address: string | null; city: string | null; postal_code: string | null; country: string | null; vat_number: string | null };

function euro(v: number, c: string) {
  try {
    return v.toLocaleString("nl-NL", { style: "currency", currency: c || "EUR" });
  } catch {
    return `€ ${v.toFixed(2)}`;
  }
}

export default function InvoicePrint() {
  const { id } = useParams();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [cust, setCust] = useState<Customer | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: i } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
      setInv(i || null);
      const { data: its } = await supabase
        .from("invoice_items")
        .select("line_no,description,qty,unit_price,vat_rate,line_total")
        .eq("invoice_id", id)
        .order("line_no");
      setItems((its as Item[]) || []);
      if (i?.customer_id) {
        const { data: c } = await supabase
          .from("customers")
          .select("id,name,address,city,postal_code,country,vat_number")
          .eq("id", i.customer_id)
          .single();
        setCust((c as any) || null);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (inv) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [inv]);

  if (!inv) return <div className="p-6">Laden…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white text-black">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-2xl font-bold">Factuur {inv.number_str ?? ""}</div>
          <div className="text-sm mt-1">Datum: {inv.issue_date}</div>
          {inv.due_date && <div className="text-sm">Vervaldatum: {inv.due_date}</div>}
        </div>
        <div className="text-right">
          <div className="font-semibold">Bizora</div>
          <div className="text-sm">www.bizora.local</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <div className="font-semibold">Factuur aan:</div>
          {cust ? (
            <div className="text-sm mt-1">
              <div>{cust.name}</div>
              {cust.address && <div>{cust.address}</div>}
              <div>{[cust.postal_code, cust.city].filter(Boolean).join(" ")}</div>
              {cust.country && <div>{cust.country}</div>}
              {cust.vat_number && <div>BTW: {cust.vat_number}</div>}
            </div>
          ) : (
            <div className="text-sm mt-1">—</div>
          )}
        </div>
      </div>

      <table className="w-full text-sm mt-6 border-collapse">
        <thead>
          <tr>
            <th className="text-left border-b p-2">#</th>
            <th className="text-left border-b p-2">Omschrijving</th>
            <th className="text-right border-b p-2">Aantal</th>
            <th className="text-right border-b p-2">Prijs</th>
            <th className="text-right border-b p-2">BTW %</th>
            <th className="text-right border-b p-2">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td className="p-2">{r.line_no}</td>
              <td className="p-2">{r.description}</td>
              <td className="p-2 text-right">{r.qty}</td>
              <td className="p-2 text-right">{euro(r.unit_price, inv.currency)}</td>
              <td className="p-2 text-right">{r.vat_rate}%</td>
              <td className="p-2 text-right">{euro(r.line_total ?? (r.qty*r.unit_price*(1+r.vat_rate/100)), inv.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between">
            <div>Subtotaal</div>
            <div>{euro(inv.subtotal, inv.currency)}</div>
          </div>
          <div className="flex justify-between">
            <div>BTW</div>
            <div>{euro(inv.vat_total, inv.currency)}</div>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t mt-2 pt-2">
            <div>Totaal</div>
            <div>{euro(inv.total, inv.currency)}</div>
          </div>
        </div>
      </div>

      {inv.notes && (
        <div className="mt-6">
          <div className="font-semibold">Opmerkingen</div>
          <div className="text-sm mt-1">{inv.notes}</div>
        </div>
      )}
    </div>
  );
}
