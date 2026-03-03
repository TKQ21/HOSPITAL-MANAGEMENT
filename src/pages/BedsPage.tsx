import { useState, useEffect } from "react";
import { BedDouble, Plus, Search, Edit2, Trash2, X, Save, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Bed {
  id: string;
  bed_number: string;
  ward_type: string;
  department_id: string | null;
  patient_name: string | null;
  patient_phone: string | null;
  status: string;
  admitted_at: string | null;
}

interface Dept { id: string; name: string; }

export default function BedsPage() {
  const { toast } = useToast();
  const [beds, setBeds] = useState<Bed[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [search, setSearch] = useState("");
  const [filterWard, setFilterWard] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ bed_number: "", ward_type: "General", department_id: "", patient_name: "", patient_phone: "", status: "available" });

  const load = async () => {
    const [{ data: b }, { data: d }] = await Promise.all([
      supabase.from("beds").select("*").order("bed_number"),
      supabase.from("departments").select("id, name"),
    ]);
    if (b) setBeds(b as Bed[]);
    if (d) setDepartments(d as Dept[]);
  };

  useEffect(() => { load(); }, []);

  const wardTypes = [...new Set(beds.map(b => b.ward_type))];
  const totalBeds = beds.length;
  const occupied = beds.filter(b => b.status === "occupied").length;
  const icuBeds = beds.filter(b => b.ward_type === "ICU");
  const icuOccupied = icuBeds.filter(b => b.status === "occupied").length;
  const icuPercent = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

  const filtered = beds.filter(b => {
    const matchSearch = b.bed_number.toLowerCase().includes(search.toLowerCase()) ||
      (b.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.patient_phone || "").toLowerCase().includes(search.toLowerCase());
    const matchWard = filterWard === "all" || b.ward_type === filterWard;
    return matchSearch && matchWard;
  });

  const resetForm = () => { setForm({ bed_number: "", ward_type: "General", department_id: "", patient_name: "", patient_phone: "", status: "available" }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bed_number.trim()) { toast({ title: "Error", description: "Bed number required", variant: "destructive" }); return; }

    const data: any = {
      bed_number: form.bed_number,
      ward_type: form.ward_type,
      department_id: form.department_id || null,
      patient_name: form.patient_name || null,
      patient_phone: form.patient_phone || null,
      status: form.status,
      admitted_at: form.status === "occupied" ? new Date().toISOString() : null,
    };

    if (editId) {
      await supabase.from("beds").update(data).eq("id", editId);
      toast({ title: "Updated ✓" });
    } else {
      await supabase.from("beds").insert(data);
      toast({ title: "Added ✓" });
    }
    resetForm();
    load();
  };

  const handleEdit = (b: Bed) => {
    setForm({ bed_number: b.bed_number, ward_type: b.ward_type, department_id: b.department_id || "", patient_name: b.patient_name || "", patient_phone: b.patient_phone || "", status: b.status });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => { await supabase.from("beds").delete().eq("id", id); load(); };

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Bed Management</h1>
          <p className="text-muted-foreground text-xs mt-1">{totalBeds} beds, {occupied} occupied</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan text-sm neon-text-cyan">
          <Plus className="w-4 h-4" /> Add Bed
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel rounded-xl p-3 border neon-border-cyan">
          <p className="text-[10px] text-muted-foreground">Total Beds</p>
          <p className="font-display text-xl font-bold neon-text-cyan">{totalBeds}</p>
        </div>
        <div className="glass-panel rounded-xl p-3 border neon-border-green">
          <p className="text-[10px] text-muted-foreground">Available</p>
          <p className="font-display text-xl font-bold neon-text-green">{totalBeds - occupied}</p>
        </div>
        <div className="glass-panel rounded-xl p-3 border neon-border-yellow">
          <p className="text-[10px] text-muted-foreground">Occupied</p>
          <p className="font-display text-xl font-bold neon-text-yellow">{occupied}</p>
        </div>
        <div className={`glass-panel rounded-xl p-3 border ${icuPercent >= 85 ? "neon-border-pink neon-glow-pink" : "neon-border-cyan"}`}>
          <p className="text-[10px] text-muted-foreground">ICU Occupancy</p>
          <div className="flex items-center gap-1">
            <p className={`font-display text-xl font-bold ${icuPercent >= 85 ? "neon-text-pink" : "neon-text-cyan"}`}>{icuPercent}%</p>
            {icuPercent >= 85 && <AlertTriangle className="w-4 h-4 neon-text-pink animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search beds..." className={inputClass + " pl-10"} />
        </div>
        <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className={inputClass + " w-auto"}>
          <option value="all">All Wards</option>
          {wardTypes.map(w => <option key={w} value={w}>{w}</option>)}
          {!wardTypes.includes("General") && <option value="General">General</option>}
          {!wardTypes.includes("ICU") && <option value="ICU">ICU</option>}
          {!wardTypes.includes("Pediatric") && <option value="Pediatric">Pediatric</option>}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-5 border neon-border-green space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold neon-text-green">{editId ? "EDIT" : "ADD"} BED</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.bed_number} onChange={e => setForm({ ...form, bed_number: e.target.value })} placeholder="Bed Number *" className={inputClass} required />
            <select value={form.ward_type} onChange={e => setForm({ ...form, ward_type: e.target.value })} className={inputClass}>
              <option value="General">General</option>
              <option value="ICU">ICU</option>
              <option value="Pediatric">Pediatric</option>
              <option value="Maternity">Maternity</option>
              <option value="Surgery">Surgery</option>
              <option value="Emergency">Emergency</option>
            </select>
            <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} className={inputClass}>
              <option value="">No Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {form.status === "occupied" && <>
              <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient Name" className={inputClass} />
              <input value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} placeholder="Patient Phone" className={inputClass} />
            </>}
          </div>
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 border neon-border-green text-sm neon-text-green">
            <Save className="w-4 h-4" /> {editId ? "Update" : "Add"}
          </button>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{search || filterWard !== "all" ? "No beds match filter" : "No beds added yet"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(b => (
            <div key={b.id} className={`glass-panel rounded-xl p-3 border ${b.status === "occupied" ? "neon-border-yellow" : b.status === "maintenance" ? "neon-border-pink" : "neon-border-green"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BedDouble className={`w-4 h-4 ${b.status === "occupied" ? "neon-text-yellow" : "neon-text-green"}`} />
                  <span className="font-display text-sm font-bold">{b.bed_number}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.status === "available" ? "bg-green-500/20 neon-text-green" : b.status === "occupied" ? "bg-yellow-500/20 neon-text-yellow" : "bg-red-500/20 neon-text-pink"}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{b.ward_type}</p>
              {b.patient_name && <p className="text-xs mt-1">Patient: {b.patient_name}</p>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(b)} className="p-1 rounded hover:bg-secondary/50"><Edit2 className="w-3.5 h-3.5 neon-text-yellow" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1 rounded hover:bg-secondary/50"><Trash2 className="w-3.5 h-3.5 neon-text-pink" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
