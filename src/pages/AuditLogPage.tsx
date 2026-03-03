import { useState, useEffect } from "react";
import { Shield, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (data) setLogs(data as AuditLog[]);
    };
    load();
  }, []);

  const entityTypes = [...new Set(logs.map(l => l.entity_type))];

  const filtered = logs.filter(l => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase());
    const matchEntity = filterEntity === "all" || l.entity_type === filterEntity;
    return matchSearch && matchEntity;
  });

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const actionColors: Record<string, string> = { create: "neon-text-green", update: "neon-text-yellow", delete: "neon-text-pink", view: "neon-text-cyan" };

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Audit Logs</h1>
        <p className="text-muted-foreground text-xs mt-1">{logs.length} log entries</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className={inputClass + " pl-10"} />
        </div>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className={inputClass + " w-auto"}>
          <option value="all">All Types</option>
          {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{search ? "No logs match" : "No audit logs recorded yet"}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(l => (
            <div key={l.id} className="glass-panel rounded-lg p-3 border border-border/50 flex items-start gap-3">
              <Shield className="w-4 h-4 neon-text-cyan mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold ${actionColors[l.action] || "neon-text-cyan"}`}>{l.action.toUpperCase()}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">{l.entity_type}</span>
                </div>
                {l.details && <p className="text-xs text-muted-foreground mt-1 truncate">{l.details}</p>}
                <p className="text-[10px] text-muted-foreground mt-0.5">{l.user_email || "system"} • {new Date(l.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
