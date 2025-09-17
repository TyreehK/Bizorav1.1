// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function Profile() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("email, full_name, avatar_url")
        .eq("id", user.id)
        .single<ProfileRow>();

      if (error) {
        setError(error.message);
      } else if (data) {
        setEmail(data.email ?? user.email ?? "");
        setFullName(data.full_name ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setOk(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        // email in profiles is optioneel/informatief; auth email wijzig je via Supabase Auth flows
        email: email || user.email || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      setOk("Profiel opgeslagen.");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profiel</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-20 rounded bg-muted animate-pulse" />
          ) : (
            <form className="space-y-4" onSubmit={onSave}>
              <div>
                <Label htmlFor="email">E-mail (alleen-weergave)</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Om je login-e-mailadres te wijzigen, moet je de Supabase Auth flow gebruiken (niet hier).
                </p>
              </div>

              <div>
                <Label htmlFor="full_name">Volledige naam</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Bijv. Jane Doe"
                />
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Opslaan..." : "Opslaan"}
                </Button>
                <a className="underline text-sm" href="/dashboard">
                  Terug naar dashboard
                </a>
              </div>

              {ok && <p className="text-green-600 text-sm">{ok}</p>}
              {error && <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
