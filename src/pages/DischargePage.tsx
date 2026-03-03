import { useState, useEffect } from "react";
import { FileText, Plus, Search, Edit2, Trash2, X, Save, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DischargeSummary {
  id: string;
  patient_name: string;
  patient_phone: string;
  admission_date: string;
  discharge_date: string;
  diagnosis: string;
  treatment: string | null;
  medications: string | null;
  follow_up_instructions: string | null;
  doctor_name: string;
  department: string | null;
  clinical_notes: string | null;
  status: string;
  created_at: string;
}

export default function DischargePage() {
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<DischargeSummary[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    patient_name: "", patient_phone: "", admission_date: "", discharge_date: "",
    diagnosis: "", treatment: "", medications: "", follow_up_instructions: "",
    doctor_name: "", department: "", clinical_notes: "", status: "draft",
  });

  const load = async () => {
    const { data } = await supabase.from("discharge_summaries").select("*").order("created_at", { ascending: false });
    if (data) setSummaries(data as DischargeSummary[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = summaries.filter(s => {
    const matchSearch = s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      s.patient_phone.includes(search) || s.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setForm({ patient_name: "", patient_phone: "", admission_date: "", discharge_date: "", diagnosis: "", treatment: "", medications: "", follow_up_instructions: "", doctor_name: "", department: "", clinical_notes: "", status: "draft" });
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim() || !form.diagnosis.trim()) { toast({ title: "Error", description: "Patient name and diagnosis required", variant: "destructive" }); return; }

    const data: any = { ...form };
    Object.keys(data).forEach(k => { if (data[k] === "") data[k] = null; });
    data.patient_name = form.patient_name;
    data.patient_phone = form.patient_phone;
    data.diagnosis = form.diagnosis;
    data.doctor_name = form.doctor_name;
    data.status = form.status;

    if (editId) {
      await supabase.from("discharge_summaries").update(data).eq("id", editId);
      toast({ title: "Updated ✓" });
    } else {
      await supabase.from("discharge_summaries").insert(data);
      toast({ title: "Created ✓" });
    }
    resetForm();
    load();
  };

  const handleEdit = (s: DischargeSummary) => {
    setForm({
      patient_name: s.patient_name, patient_phone: s.patient_phone,
      admission_date: s.admission_date || "", discharge_date: s.discharge_date || "",
      diagnosis: s.diagnosis, treatment: s.treatment || "", medications: s.medications || "",
      follow_up_instructions: s.follow_up_instructions || "", doctor_name: s.doctor_name,
      department: s.department || "", clinical_notes: s.clinical_notes || "", status: s.status,
    });
    setEditId(s.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => { await supabase.from("discharge_summaries").delete().eq("id", id); load(); };

  const handleDownload = (s: DischargeSummary) => {
    const text = `
DISCHARGE SUMMARY
=================
Patient: ${s.patient_name}
Phone: ${s.patient_phone}
Department: ${s.department || "N/A"}
Doctor: ${s.doctor_name}
Admission: ${s.admission_date}
Discharge: ${s.discharge_date}

DIAGNOSIS: ${s.diagnosis}

TREATMENT: ${s.treatment || "N/A"}

MEDICATIONS: ${s.medications || "N/A"}

CLINICAL NOTES: ${s.clinical_notes || "N/A"}

FOLLOW-UP: ${s.follow_up_instructions || "N/A"}

Status: ${s.status.toUpperCase()}
Generated: ${new Date().toLocaleString()}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `discharge_${s.patient_name.replace(/\s+/g, "_")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const statusColors: Record<string, string> = { draft: "neon-text-yellow", finalized: "neon-text-green", archived: "neon-text-pink" };

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Discharge Summaries</h1>
          <p className="text-muted-foreground text-xs mt-1">{summaries.length} summaries</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan text-sm neon-text-cyan">
          <Plus className="w-4 h-4" /> New Summary
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient, phone, diagnosis..." className={inputClass + " pl-10"} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputClass + " w-auto"}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-5 border neon-border-green space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold neon-text-green">{editId ? "EDIT" : "NEW"} DISCHARGE SUMMARY</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient Name *" className={inputClass} required />
            <input value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} placeholder="Patient Phone" className={inputClass} />
            <input type="date" value={form.admission_date} onChange={e => setForm({ ...form, admission_date: e.target.value })} className={inputClass} />
            <input type="date" value={form.discharge_date} onChange={e => setForm({ ...form, discharge_date: e.target.value })} className={inputClass} />
            <input value={form.doctor_name} onChange={e => setForm({ ...form, doctor_name: e.target.value })} placeholder="Doctor Name *" className={inputClass} required />
            <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Department" className={inputClass} />
          </div>
          <textarea value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis *" className={inputClass} rows={2} required />
          <textarea value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} placeholder="Treatment" className={inputClass} rows={2} />
          <textarea value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} placeholder="Medications" className={inputClass} rows={2} />
          <textarea value={form.clinical_notes} onChange={e => setForm({ ...form, clinical_notes: e.target.value })} placeholder="Clinical Notes" className={inputClass} rows={2} />
          <textarea value={form.follow_up_instructions} onChange={e => setForm({ ...form, follow_up_instructions: e.target.value })} placeholder="Follow-up Instructions" className={inputClass} rows={2} />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="archived">Archived</option>
          </select>
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 border neon-border-green text-sm neon-text-green">
            <Save className="w-4 h-4" /> {editId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{search ? "No results found" : "No discharge summaries yet"}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="glass-panel rounded-xl p-4 border neon-border-cyan">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 neon-text-cyan" />
                  <h3 className="font-display text-sm font-bold">{s.patient_name}</h3>
                  <span className={`text-[10px] font-semibold ${statusColors[s.status] || ""}`}>{s.status}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleDownload(s)} className="p-1.5 rounded hover:bg-secondary/50"><Download className="w-3.5 h-3.5 neon-text-cyan" /></button>
                  <button onClick={() => handleEdit(s)} className="p-1.5 rounded hover:bg-secondary/50"><Edit2 className="w-3.5 h-3.5 neon-text-yellow" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-secondary/50"><Trash2 className="w-3.5 h-3.5 neon-text-pink" /></button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{s.diagnosis}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Dr. {s.doctor_name} • {s.admission_date} → {s.discharge_date} • {s.patient_phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
