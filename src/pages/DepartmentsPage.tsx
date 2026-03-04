import { useState, useEffect } from "react";
import { Building, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  head_doctor: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", head_doctor: "", description: "", status: "active" });

  const load = async () => {
    const { data } = await supabase.from("departments").select("*").order("created_at", { ascending: false });
    if (data) setDepartments(data as Department[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.head_doctor || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm({ name: "", head_doctor: "", description: "", status: "active" }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast({ title: "Error", description: "Department name required", variant: "destructive" }); return; }

    if (editId) {
      await supabase.from("departments").update({ name: form.name, head_doctor: form.head_doctor || null, description: form.description || null, status: form.status }).eq("id", editId);
      toast({ title: "Updated ✓", description: "Department updated" });
    } else {
      await supabase.from("departments").insert({ name: form.name, head_doctor: form.head_doctor || null, description: form.description || null, status: form.status });
      toast({ title: "Added ✓", description: "Department added" });
    }
    resetForm();
    load();
  };

  const handleEdit = (d: Department) => {
    setForm({ name: d.name, head_doctor: d.head_doctor || "", description: d.description || "", status: d.status });
    setEditId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("departments").delete().eq("id", id);
    toast({ title: "Deleted", description: "Department removed" });
    load();
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const cardColors = ["neon-border-purple", "neon-border-orange", "neon-border-darkblue", "neon-border-red", "neon-border-pink", "neon-border-green"];
  const iconColors = ["neon-text-purple", "neon-text-orange", "neon-text-darkblue", "neon-text-red", "neon-text-pink", "neon-text-green"];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Departments</h1>
          <p className="text-muted-foreground text-xs mt-1">{departments.length} departments</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan text-sm neon-text-cyan">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..." className={inputClass + " pl-10"} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-5 border neon-border-green space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold neon-text-green">{editId ? "EDIT" : "ADD"} DEPARTMENT</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Department Name *" className={inputClass} required />
          <input value={form.head_doctor} onChange={e => setForm({ ...form, head_doctor: e.target.value })} placeholder="Head Doctor" className={inputClass} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className={inputClass} rows={2} />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 border neon-border-green neon-glow-green text-sm neon-text-green">
            <Save className="w-4 h-4" /> {editId ? "Update" : "Add"}
          </button>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? "No departments found for this search" : "No departments added yet"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d, idx) => (
            <div key={d.id} className={`glass-panel rounded-xl p-4 border ${cardColors[idx % cardColors.length]} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className={`w-4 h-4 ${iconColors[idx % iconColors.length]}`} />
                  <h3 className="font-display text-sm font-bold">{d.name}</h3>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.status === "active" ? "bg-[hsl(var(--neon-green)/.15)] neon-text-green" : "bg-[hsl(var(--neon-red)/.15)] neon-text-red"}`}>
                  {d.status}
                </span>
              </div>
              {d.head_doctor && <p className="text-xs text-muted-foreground">Head: {d.head_doctor}</p>}
              {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleEdit(d)} className="p-1.5 rounded hover:bg-secondary/50"><Edit2 className="w-3.5 h-3.5 neon-text-yellow" /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded hover:bg-secondary/50"><Trash2 className="w-3.5 h-3.5 neon-text-pink" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
