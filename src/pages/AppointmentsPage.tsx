import { useState, useEffect } from "react";
import { Check, X, Clock, Search, RefreshCw } from "lucide-react";

interface Appointment {
  id: number;
  patientName: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "visited";
  source: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string; bg: string }> = {
  pending: { label: "Pending", class: "neon-text-yellow", bg: "bg-neon-yellow/10" },
  confirmed: { label: "Confirmed", class: "neon-text-green", bg: "bg-neon-green/10" },
  cancelled: { label: "Cancelled", class: "neon-text-pink", bg: "bg-neon-pink/10" },
  visited: { label: "Visited", class: "neon-text-cyan", bg: "bg-neon-cyan/10" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadAppointments = () => {
    const stored = localStorage.getItem("clinic_appointments");
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = (id: number, status: Appointment["status"]) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    setAppointments(updated);
    localStorage.setItem("clinic_appointments", JSON.stringify(updated));
  };

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.reason?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold neon-text-pink tracking-wider">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage appointment requests from patients</p>
        </div>
        <button
          onClick={loadAppointments}
          className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border neon-border-cyan hover:bg-secondary/50 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4 neon-text-cyan" />
          <span className="neon-text-cyan text-xs font-display">Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "cancelled", "visited"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                filterStatus === s
                  ? "glass-panel neon-border-cyan neon-text-cyan"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl border neon-border-pink p-12 text-center">
          <p className="text-muted-foreground text-sm">Koi appointment nahi hai abhi.</p>
          <p className="text-muted-foreground text-xs mt-1">Jab patient AI chatbot se appointment request karega, yahan dikhega.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border neon-border-pink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">PATIENT</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">PHONE</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">REASON / PROBLEM</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">DATE</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">TIME</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">SOURCE</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">STATUS</th>
                  <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appt) => {
                  const sc = statusConfig[appt.status];
                  return (
                    <tr key={appt.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold neon-text-cyan">{appt.patientName.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium">{appt.patientName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{appt.phone}</td>
                      <td className="p-4 text-sm text-muted-foreground">{appt.reason || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{appt.date}</td>
                      <td className="p-4 text-sm text-muted-foreground">{appt.time}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/50">{appt.source}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.class}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {appt.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateStatus(appt.id, "confirmed")}
                              className="p-1.5 rounded-lg hover:bg-neon-green/10 transition-colors"
                              title="Confirm"
                            >
                              <Check className="w-4 h-4 neon-text-green" />
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, "cancelled")}
                              className="p-1.5 rounded-lg hover:bg-neon-pink/10 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4 neon-text-pink" />
                            </button>
                          </div>
                        )}
                        {appt.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(appt.id, "visited")}
                            className="p-1.5 rounded-lg hover:bg-neon-cyan/10 transition-colors"
                            title="Mark Visited"
                          >
                            <Clock className="w-4 h-4 neon-text-cyan" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
