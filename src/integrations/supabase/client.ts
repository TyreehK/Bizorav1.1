// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Hard fail early so je het meteen merkt in dev
  throw new Error(
    "Supabase env ontbreekt. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

// Standaard browser client
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
