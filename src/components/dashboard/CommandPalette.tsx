// src/components/dashboard/CommandPalette.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Users, UploadCloud, Banknote, File, Loader2 } from "lucide-react";

type Row = {
  kind: "customer" | "invoice" | "purchase" | "document" | "bank";
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
  rank: number;
};

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // focus input bij openen
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
      setRows([]);
      setIdx(0);
      setLoading(false);
    }
  }, [open]);

  // zoek (debounced)
  useEffect(() => {
    if (!open) return;
    const qTrim = q.trim();
    if (qTrim.length < 2) {
      setRows([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("global_search", { p_q: qTrim, p_limit: 12 });
      if (!error && data) {
        setRows(data as Row[]);
        setIdx(0);
      }
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  // snel sluiten met Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const icons: Record<Row["kind"], JSX.Element> = useMemo(() => ({
    customer: <Users className="h-4 w-4" />,
    invoice: <FileText className="h-4 w-4" />,
    purchase: <UploadCloud className="h-4 w-4" />,
    bank: <Banknote className="h-4 w-4" />,
    document: <File className="h-4 w-4" />,
  }), []);

  const onEnter = () => {
    const r = rows[idx];
    if (!r) return;
    onClose();
    navigate(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((v) => Math.min(v + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto mt-24 w-[min(720px,92vw)] rounded-2xl border border-white/10 bg-background/90 backdrop-blur card">
        {/* Zoeken */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <Search className="h-4 w-4 text-white/60" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Zoek klanten, facturen, inkoop, documenten, bank…"
            className="flex-1 bg-transparent outline-none placeholder:text-white/40 text-sm py-2"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-white/60" />}
        </div>

        {/* Resultaten */}
        <div className="max-h-[60vh] overflow-auto">
          {q.trim().length < 2 ? (
            <div className="px-4 py-6 text-sm text-white/60">
              Typ minstens 2 tekens om te zoeken. Tip: gebruik <kbd className="px-1 rounded bg-white/10">⌘K</kbd> / <kbd className="px-1 rounded bg-white/10">Ctrl+K</kbd> overal.
            </div>
          ) : rows.length === 0 && !loading ? (
            <div className="px-4 py-6 text-sm text-white/60">Geen resultaten voor “{q.trim()}”.</div>
          ) : (
            <ul className="py-1">
              {rows.map((r, i) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    onClick={() => { setIdx(i); onEnter(); }}
                    onMouseEnter={() => setIdx(i)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                      i === idx ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="text-white/80">{icons[r.kind]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      <div className="text-xs text-white/60 truncate">{r.subtitle}</div>
                    </div>
                    <div className="text-xs text-white/40 uppercase">{r.kind}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
