// supabase/functions/send-invoice/index.ts
// Deno Edge Function: verstuurt factuur per e-mail via Resend + logt status.
// - Auth: verwacht Bearer JWT van ingelogde user in Authorization header (RLS actief)
// - Attachments: pakt eerste PDF-bijlage uit 'attachments' (kind='invoice'), indien aanwezig
// - Tracking: voegt pixel toe die /email-open aanroept met log_id

// npm: supabase-js v2 via ESM
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SendBody = {
  invoice_id: string;
  to: string;
  subject?: string;
  message?: string;
  attach_pdf?: boolean; // default true
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!; // stel in via supabase secrets
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "invoices@yourdomain.tld";
const FUNCTION_BASE_URL = Deno.env.get("FUNCTION_BASE_URL") || ""; // bv: https://<ref>.functions.supabase.co

function htmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// helper: blob -> base64
async function blobToBase64(blob: Blob): Promise<string> {
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const auth = req.headers.get("Authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });

    const body = (await req.json()) as SendBody;
    if (!body?.invoice_id || !body?.to) {
      return new Response(JSON.stringify({ error: "invoice_id en to zijn vereist" }), { status: 400 });
    }
    const attachPdf = body.attach_pdf ?? true;

    // 1) Haal invoice & items op (RLS: user moet owner zijn)
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("id, owner, number, number_str, currency, issue_date, due_date, status, subtotal, vat_total, total, notes, customer_id")
      .eq("id", body.invoice_id)
      .single();
    if (invErr || !inv) throw new Error(invErr?.message || "Factuur niet gevonden");

    const { data: items } = await supabase
      .from("invoice_items")
      .select("line_no, description, qty, unit_price, vat_rate")
      .eq("invoice_id", inv.id)
      .order("line_no");

    const { data: cust } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("id", inv.customer_id ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    // 2) Log record aanmaken (status = queued)
    const { data: logRow, error: logErr } = await supabase
      .from("email_logs")
      .insert({
        owner: inv.owner,
        kind: "invoice",
        target_id: inv.id,
        to_email: body.to,
        subject: body.subject ?? `Factuur ${inv.number_str ?? inv.number ?? inv.id.slice(0,8)}`,
        body: body.message ?? "",
        status: "queued",
      })
      .select("id, subject, body")
      .single();
    if (logErr || !logRow) throw new Error(logErr?.message || "Kon email_log niet aanmaken");

    const euro = (v?: number | null) =>
      (v ?? 0).toLocaleString("nl-NL", { style: "currency", currency: inv.currency || "EUR" });

    // 3) Optioneel: pak eerste PDF-bijlage
    let attachment: { filename: string; content: string; contentType: string } | null = null;
    if (attachPdf) {
      const { data: atts } = await supabase
        .from("attachments")
        .select("bucket, path, filename, mime_type")
        .eq("kind", "invoice")
        .eq("invoice_id", inv.id)
        .order("created_at", { ascending: false })
        .limit(5);
      const pdf = (atts || []).find((a) => (a.mime_type || "").toLowerCase().includes("pdf"));
      if (pdf) {
        // download via Storage (met user-JWT: toegang tot eigen files)
        const dl = await supabase.storage.from(pdf.bucket).download(pdf.path);
        if (dl.error) {
          // niet fataal; we sturen zonder attachment
          console.warn("Attachment download error:", dl.error.message);
        } else if (dl.data) {
          const b64 = await blobToBase64(dl.data);
          attachment = { filename: pdf.filename, content: b64, contentType: pdf.mime_type || "application/pdf" };
        }
      }
    }

    // 4) HTML body (incl. tracking pixel)
    const trackingPixel =
      FUNCTION_BASE_URL
        ? `<img src="${FUNCTION_BASE_URL}/email-open?log_id=${logRow.id}" width="1" height="1" style="display:block" alt="" />`
        : "";

    const linesHtml = (items || [])
      .map((it) => {
        const sub = (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
        const vat = sub * ((Number(it.vat_rate) || 0) / 100);
        const tot = sub + vat;
        return `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${it.line_no}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${htmlEscape(it.description || "")}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right;">${it.qty}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right;">${euro(it.unit_price)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right;">${it.vat_rate}%</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee; text-align:right;">${euro(tot)}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html><body style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;color:#0f172a;">
  <h2 style="margin:0 0 8px 0;">Factuur ${htmlEscape(inv.number_str ?? inv.number ?? "")}</h2>
  <div style="font-size:14px;color:#334155;">
    ${cust?.name ? `<div>Klant: <strong>${htmlEscape(cust.name)}</strong></div>` : ""}
    <div>Datum: ${htmlEscape(inv.issue_date)}</div>
    ${inv.due_date ? `<div>Vervaldatum: ${htmlEscape(inv.due_date)}</div>` : ""}
  </div>

  ${body.message ? `<p style="margin-top:16px;">${htmlEscape(body.message)}</p>` : ""}

  <table style="border-collapse:collapse;margin-top:12px;width:100%;font-size:14px;">
    <thead>
      <tr>
        <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #0ea5e9;">#</th>
        <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #0ea5e9;">Omschrijving</th>
        <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #0ea5e9;">Aantal</th>
        <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #0ea5e9;">Prijs</th>
        <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #0ea5e9;">BTW</th>
        <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #0ea5e9;">Totaal</th>
      </tr>
    </thead>
    <tbody>${linesHtml}</tbody>
  </table>

  <div style="margin-top:12px;font-size:14px;">
    <div>Subtotaal: <strong>${euro(inv.subtotal)}</strong></div>
    <div>BTW: <strong>${euro(inv.vat_total)}</strong></div>
    <div style="font-size:16px;">Totaal: <strong>${euro(inv.total)}</strong></div>
  </div>

  <p style="margin-top:16px;color:#64748b;font-size:12px;">Verzonden met Bizora • ${new Date().toLocaleDateString("nl-NL")}</p>
  ${trackingPixel}
</body></html>`;

    // 5) Resend API aanroepen (REST)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [body.to],
        subject: logRow.subject,
        html,
        text: body.message || "",
        attachments: attachment ? [{ filename: attachment.filename, content: attachment.content, contentType: attachment.contentType }] : undefined,
      }),
    });

    const out = await res.json();

    if (!res.ok) {
      const msg = out?.message || JSON.stringify(out);
      // status -> failed
      await supabase.from("email_logs").update({ status: "failed", error: msg }).eq("id", logRow.id);
      return new Response(JSON.stringify({ error: msg }), { status: 500 });
    }

    // status -> sent
    await supabase
      .from("email_logs")
      .update({ status: "sent", provider_msg_id: out?.id || null })
      .eq("id", logRow.id);

    return new Response(JSON.stringify({ ok: true, id: out?.id || null, log_id: logRow.id }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
});
