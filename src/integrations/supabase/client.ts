// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xizxtcniizodksshurgi.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpenh0Y25paXpvZGtzc2h1cmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzIyMTksImV4cCI6MjA3MzU0ODIxOX0.gozjI0BeXYbUhRMzTOaY7wBgUx-rzZ-0ZHj30PEzudQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "bizora.auth", // eigen key voorkomt clashes
  },
  global: {
    headers: {
      "x-bizora-client": "web-app",
    },
  },
});
