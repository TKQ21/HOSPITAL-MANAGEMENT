import { useState, useEffect } from "react";
import { DollarSign, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Bill {
  id: string; patient_name: string; patient_phone: string; items: any[]; total_amount: number;
  paid_amount: number; payment_status: string; payment_method: string | null; notes: string | null; created_at: string;
}

export default function BillingPage() {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ patient_name: "", patient_phone: "", total_amount: "", paid_amount: "", payment_status: "pending", payment_method: "", notes: "", item_desc: "", item_amount: "" });
  const [items, setItems] = useState<{ description: string; amount: number }[]>([]);

  const load = async () => { const { data } = await supabase.from("billing").select("*").order("created_at", { ascending: false }); if (data) setBills(data as Bill[]); };
  useEffect(() => { load(); }, []);

  const filtered = bills.filter(b => {
    const matchSearch = b.patient_name.toLowerCase().includes(search.toLowerCase()) || b.patient_phone.includes(search);
    const matchStatus = filterStatus === "all" || b.payment_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = bills.filter(b => b.payment_status === "paid").reduce((s, b) => s + Number(b.paid_amount), 0);
  const pendingAmount = bills.filter(b => b.payment_status !== "paid").reduce((s, b) => s + (Number(b.total_amount) - Number(b.paid_amount)), 0);

  const resetForm = () => { setForm({ patient_name: "", patient_phone: "", total_amount: "", paid_amount: "", payment_status: "pending", payment_method: "", notes: "", item_desc: "", item_amount: "" }); setItems([]); setEditId(null); setShowForm(false); };

  const addItem = () => {
    if (!form.item_desc.trim() || !form.item_amount) return;
    const newItems = [...items, { description: form.item_desc, amount: Number(form.item_amount) }];
    setItems(newItems);
    setForm({ ...form, item_desc: "", item_amount: "", total_amount: String(newItems.reduce((s, i) => s + i.amount, 0)) });
  };
  const removeItem = (idx: number) => { const newItems = items.filter((_, i) => i !== idx); setItems(newItems); setForm({ ...form, total_amount: String(newItems.reduce((s, i) => s + i.amount, 0)) }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim()) { toast({ title: "Error", description: "Patient name required", variant: "destructive" }); return; }
    const data: any = { patient_name: form.patient_name, patient_phone: form.patient_phone, items, total_amount: Number(form.total_amount) || 0, paid_amount: Number(form.paid_amount) || 0, payment_status: form.payment_status, payment_method: form.payment_method || null, notes: form.notes || null };
    if (editId) { await supabase.from("billing").update(data).eq("id", editId); toast({ title: "Updated ✓" }); }
    else { await supabase.from("billing").insert(data); toast({ title: "Created ✓" }); }
    resetForm(); load();
  };

  const handleEdit = (b: Bill) => { setForm({ patient_name: b.patient_name, patient_phone: b.patient_phone, total_amount: String(b.total_amount), paid_amount: String(b.paid_amount), payment_status: b.payment_status, payment_method: b.payment_method || "", notes: b.notes || "", item_desc: "", item_amount: "" }); setItems(Array.isArray(b.items) ? b.items : []); setEditId(b.id); setShowForm(true); };
  const handleDelete = async (id: string) => { await supabase.from("billing").delete().eq("id", id); load(); };
  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const statusColors: Record<string, string> = { pending: "neon-text-yellow", paid: "neon-text-green", partial: "neon-text-cyan", overdue: "neon-text-red" };

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Billing</h1>
          <p className="text-muted-foreground text-xs mt-1">{bills.length} bills</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan text-sm neon-text-cyan"><Plus className="w-4 h-4" /> New Bill</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="glass-panel rounded-xl p-3 border neon-border-green"><p className="text-[10px] text-muted-foreground">Total Revenue</p><p className="font-display text-xl font-bold neon-text-green">₹{totalRevenue.toLocaleString()}</p></div>
        <div className="glass-panel rounded-xl p-3 border neon-border-orange"><p className="text-[10px] text-muted-foreground">Pending</p><p className="font-display text-xl font-bold neon-text-orange">₹{pendingAmount.toLocaleString()}</p></div>
        <div className="glass-panel rounded-xl p-3 border neon-border-purple"><p className="text-[10px] text-muted-foreground">Total Bills</p><p className="font-display text-xl font-bold neon-text-purple">{bills.length}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient name or phone..." className={inputClass + " pl-10"} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputClass + " w-auto"}>
          <option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="overdue">Overdue</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-5 border neon-border-green space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold neon-text-green">{editId ? "EDIT" : "NEW"} BILL</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.patient_name} onChange={e => setForm({ ...form, patient_name: e.target.value })} placeholder="Patient Name *" className={inputClass} required />
            <input value={form.patient_phone} onChange={e => setForm({ ...form, patient_phone: e.target.value })} placeholder="Patient Phone" className={inputClass} />
          </div>
          <div className="border border-border/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Line Items</p>
            {items.map((item, idx) => (<div key={idx} className="flex items-center gap-2 text-xs"><span className="flex-1">{item.description}</span><span>₹{item.amount}</span><button type="button" onClick={() => removeItem(idx)}><X className="w-3 h-3 neon-text-pink" /></button></div>))}
            <div className="flex gap-2">
              <input value={form.item_desc} onChange={e => setForm({ ...form, item_desc: e.target.value })} placeholder="Item description" className={inputClass + " flex-1"} />
              <input type="number" value={form.item_amount} onChange={e => setForm({ ...form, item_amount: e.target.value })} placeholder="Amount" className={inputClass + " w-24"} />
              <button type="button" onClick={addItem} className="px-3 py-1 rounded bg-primary/20 neon-text-green text-xs">Add</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} placeholder="Total Amount" className={inputClass} />
            <input type="number" value={form.paid_amount} onChange={e => setForm({ ...form, paid_amount: e.target.value })} placeholder="Paid Amount" className={inputClass} />
            <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} className={inputClass}><option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="overdue">Overdue</option></select>
            <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} className={inputClass}><option value="">Payment Method</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="insurance">Insurance</option></select>
          </div>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className={inputClass} rows={2} />
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/20 border neon-border-green text-sm neon-text-green"><Save className="w-4 h-4" /> {editId ? "Update" : "Create"}</button>
        </form>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{search ? "No bills found" : "No bills created yet"}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, idx) => {
            const borders = ["neon-border-red", "neon-border-purple", "neon-border-orange", "neon-border-darkblue", "neon-border-pink", "neon-border-brown"];
            return (
              <div key={b.id} className={`glass-panel rounded-xl p-4 border ${borders[idx % borders.length]}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 neon-text-cyan" />
                    <h3 className="text-sm font-bold">{b.patient_name}</h3>
                    <span className={`text-[10px] font-semibold ${statusColors[b.payment_status] || ""}`}>{b.payment_status}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(b)} className="p-1.5 rounded hover:bg-secondary/50"><Edit2 className="w-3.5 h-3.5 neon-text-yellow" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-secondary/50"><Trash2 className="w-3.5 h-3.5 neon-text-pink" /></button>
                  </div>
                </div>
                <p className="text-xs">Total: ₹{Number(b.total_amount).toLocaleString()} | Paid: ₹{Number(b.paid_amount).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{b.patient_phone} • {b.payment_method || "N/A"} • {new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
