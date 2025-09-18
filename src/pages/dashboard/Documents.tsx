// src/pages/dashboard/Documents.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FolderPlus, Search, Eye, Download, Trash2, UploadCloud, X } from "lucide-react";

type FileRow = {
  id?: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, any> | null;
  // size komt niet altijd terug in list(); we proberen 'm via getPublic/Head niet te doen (geen public).
};

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const v = bytes / Math.pow(1024, i);
  return `${v.toFixed(1)} ${sizes[i]}`;
}

function yyyymm(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export default function Documents() {
  const { user } = useSupabaseAuth();
  const [prefix, setPrefix] = useState<string>("");
  const [files, setFiles] = useState<FileRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Preview overlay
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Gebruik per-user folder: <uid>/
    setPrefix(`${user.id}/`);
  }, [user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.trim().toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  const listFiles = async () => {
    if (!prefix) return;
    setLoading(true);
    setErr(null);
    // we beperken tot 100 per view (kan later pagineren)
    const { data, error } = await supabase.storage
      .from("documents")
      .list(prefix, { limit: 100, offset: 0, sortBy: { column: "updated_at", order: "desc" } });

    if (error) {
      setErr(error.message);
      setFiles([]);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    listFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const fl = e.target.files;
    if (!fl || fl.length === 0) return;

    setBusy(true);
    setErr(null);

    try {
      for (let i = 0; i < fl.length; i++) {
        const file = fl[i];
        const safeName = file.name.replaceAll("/", "-");
        const folder = `${user.id}/${yyyymm()}`;
        const path = `${folder}/${Date.now()}-${safeName}`;

        const { error } = await supabase.storage
          .from("documents")
          .upload(path, file, {
            upsert: false,
            cacheControl: "3600",
            contentType: file.type || undefined,
            // metadata kun je meegeven, maar list() levert het niet altijd terug
          });

        if (error) throw error;
      }
      await listFiles();
    } catch (e: any) {
      setErr(e.message ?? "Upload mislukt.");
    } finally {
      setBusy(false);
      // reset input zodat je dezelfde file meteen nogmaals kunt kiezen
      e.target.value = "";
    }
  };

  const onDelete = async (name: string) => {
    if (!prefix) return;
    if (!confirm(`Verwijder bestand "${name}"?`)) return;
    setBusy(true);
    setErr(null);

    try {
      const fullPath = `${prefix}${name}`;
      const { error } = await supabase.storage
        .from("documents")
        .remove([fullPath]);
      if (error) throw error;
      await listFiles();
    } catch (e: any) {
      setErr(e.message ?? "Verwijderen mislukt.");
    } finally {
      setBusy(false);
    }
  };

  const openPreview = async (name: string) => {
    if (!prefix) return;
    setBusy(true);
    setErr(null);
    try {
      const fullPath = `${prefix}${name}`;
      // Signed URL (1 min is genoeg voor preview)
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(fullPath, 60);
      if (error) throw error;
      setPreviewName(name);
      setPreviewUrl(data.signedUrl);
    } catch (e: any) {
      setErr(e.message ?? "Kan preview-URL niet maken.");
    } finally {
      setBusy(false);
    }
  };

  const downloadFile = async (name: string) => {
    if (!prefix) return;
    setBusy(true);
    setErr(null);
    try {
      const fullPath = `${prefix}${name}`;
      const { data, error } = await supabase.storage
        .from("documents")
        .download(fullPath);
      if (error) throw error;

      // Download via blob
      const blob = data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(e.message ?? "Download mislukt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Documenten</h1>
          <p className="text-white/70 mt-1">Upload, bekijk, download en verwijder je documenten (privé).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              className="input pl-9 w-64"
              placeholder="Zoek op bestandsnaam…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Label className="btn-primary cursor-pointer inline-flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            <span>Upload</span>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={onUpload}
              disabled={busy}
            />
          </Label>
        </div>
      </div>

      {err && <p className="mt-3 text-red-400 text-sm whitespace-pre-wrap">{err}</p>}

      {/* Lijst */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="py-2 pr-4">Bestand</th>
              <th className="py-2 pr-4">Laatst bijgewerkt</th>
              <th className="py-2 pr-4">Acties</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="py-6 text-center text-white/70">Laden…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FolderPlus className="h-8 w-8 text-white/40" />
                    <p className="text-white/60">Nog geen documenten gevonden.</p>
                    <p className="text-white/50 text-xs">Klik op <em>Upload</em> om te beginnen.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.name} className="border-b border-white/5">
                  <td className="py-3 pr-4">{f.name}</td>
                  <td className="py-3 pr-4">
                    {f.updated_at ? new Date(f.updated_at).toLocaleString() :
                     f.created_at ? new Date(f.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost h-9 px-3" onClick={() => openPreview(f.name)}>
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </button>
                      <button className="btn-ghost h-9 px-3" onClick={() => downloadFile(f.name)}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </button>
                      <button className="btn-ghost h-9 px-3" onClick={() => onDelete(f.name)}>
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

      {/* Preview overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setPreviewUrl(null); setPreviewName(null); }} />
          <div className="absolute inset-6 md:inset-10 bg-background card overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-sm text-white/80 truncate pr-4">{previewName}</div>
              <button className="btn-ghost h-9 px-3" onClick={() => { setPreviewUrl(null); setPreviewName(null); }}>
                <X className="h-4 w-4 mr-1" /> Sluiten
              </button>
            </div>
            <div className="h-full">
              {/* iframe werkt voor PDF / beelden; anders zal de browser downloaden of tonen wat kan */}
              <iframe title="preview" src={previewUrl} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
