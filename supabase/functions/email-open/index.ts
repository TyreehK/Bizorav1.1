// supabase/functions/email-open/index.ts
// Tracking pixel: markeert email_logs.status='opened' en zet opened_at.
// Geen auth (ontvanger laadt dit). Service role key vereist.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 1x1 transparante PNG
const PIXEL = Uint8Array.from([
  0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
  0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,
  0x89,0x00,0x00,0x00,0x0A,0x49,0x44,0x41,0x54,0x78,0x9C,0x63,0x00,0x01,0x00,0x00,
  0x05,0x00,0x01,0x0D,0x0A,0x2D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,
  0x42,0x60,0x82
]);

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const logId = url.searchParams.get("log_id");
    if (logId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from("email_logs")
        .update({ status: "opened", opened_at: new Date().toISOString() })
        .eq("id", logId)
        .neq("status", "failed"); // niet overschrijven als failed
    }
  } catch (_e) {
    // stil falen; we leveren hoe dan ook een pixel terug
  }
  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
});
