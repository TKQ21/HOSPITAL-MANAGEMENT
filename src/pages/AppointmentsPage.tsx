import { useState, useEffect } from "react";
import { Check, X, Clock, Search, RefreshCw, Eye, CalendarClock } from "lucide-react";

interface Appointment {
  id: number;
  patientName: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "visited" | "rescheduled";
  source: string;
  createdAt: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
}

const statusConfig: Record<string, { label: string; class: string; bg: string }> = {
  pending: { label: "Pending", class: "neon-text-yellow", bg: "bg-neon-yellow/10" },
  confirmed: { label: "Confirmed", class: "neon-text-green", bg: "bg-neon-green/10" },
  cancelled: { label: "Cancelled", class: "neon-text-pink", bg: "bg-neon-pink/10" },
  visited: { label: "Visited", class: "neon-text-cyan", bg: "bg-neon-cyan/10" },
  rescheduled: { label: "Rescheduled", class: "neon-text-purple", bg: "bg-neon-purple/10" },
};

function saveNotification(appt: Appointment, newDate: string, newTime: string) {
  const notifications = JSON.parse(localStorage.getItem("clinic_notifications") || "[]");
  notifications.push({
    id: Date.now(),
    phone: appt.phone,
    patientName: appt.patientName,
    message: `🔄 ${appt.patientName} ji, aapka appointment reschedule ho gaya hai.\n\n📅 Nayi Date: ${newDate}\n🕐 Naya Time: ${newTime}\n🏥 Reason: ${appt.reason}\n\nPlease is time pe aayein. Dhanyavaad! 🙏`,
    oldDate: appt.date,
    oldTime: appt.time,
    newDate,
    newTime,
    createdAt: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem("clinic_notifications", JSON.stringify(notifications));
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const loadAppointments = () => {
    const stored = localStorage.getItem("clinic_appointments");
    if (stored) setAppointments(JSON.parse(stored));
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (id: number, status: Appointment["status"]) => {
    const updated = appointments.map((a) => {
      if (a.id === id) {
        const upd = { ...a, status };
        if (status === "visited") {
          const patients = JSON.parse(localStorage.getItem("clinic_patients") || "[]");
          const updatedPatients = patients.map((p: any) => {
            if (p.phone === a.phone) {
              return { ...p, visits: (p.visits || 0) + 1, lastVisit: new Date().toISOString() };
            }
            return p;
          });
          localStorage.setItem("clinic_patients", JSON.stringify(updatedPatients));
        }
        return upd;
      }
      return a;
    });
    setAppointments(updated);
    localStorage.setItem("clinic_appointments", JSON.stringify(updated));
  };

  const handleReschedule = () => {
    if (!rescheduleAppt || !newDate || !newTime) return;
    
    // Save notification for patient
    saveNotification(rescheduleAppt, newDate, newTime);
    
    // Update appointment
    const updated = appointments.map((a) => {
      if (a.id === rescheduleAppt.id) {
        return {
          ...a,
          rescheduledDate: newDate,
          rescheduledTime: newTime,
          date: newDate,
          time: newTime,
          status: "confirmed" as const,
        };
      }
      return a;
    });
    setAppointments(updated);
    localStorage.setItem("clinic_appointments", JSON.stringify(updated));
    
    setRescheduleAppt(null);
    setNewDate("");
    setNewTime("");
  };

  const openReschedule = (appt: Appointment, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRescheduleAppt(appt);
    setNewDate(appt.date);
    setNewTime(appt.time);
    setSelectedAppt(null);
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
    <div className="space-y-4 sm:space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-pink tracking-wider">Appointments</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">All appointment requests & history</p>
        </div>
        <button
          onClick={loadAppointments}
          className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border neon-border-cyan hover:bg-secondary/50 transition-all text-sm self-start"
        >
          <RefreshCw className="w-4 h-4 neon-text-cyan" />
          <span className="neon-text-cyan text-xs font-display">Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "rescheduled", "cancelled", "visited"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
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

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => setRescheduleAppt(null)}>
          <div className="glass-panel rounded-xl border neon-border-yellow p-5 max-w-sm w-full animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-sm font-bold neon-text-yellow mb-1">🔄 RESCHEDULE APPOINTMENT</h3>
            <p className="text-xs text-muted-foreground mb-4">Patient ko nayi date/time ka message jayega</p>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30 text-xs">
                <p className="font-medium">{rescheduleAppt.patientName}</p>
                <p className="text-muted-foreground">{rescheduleAppt.phone} • {rescheduleAppt.reason}</p>
                <p className="text-muted-foreground mt-1">Current: {rescheduleAppt.date} at {rescheduleAppt.time}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">New Date</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. 2026-03-10, Monday, Kal"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">New Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 11:00 AM, 3:30 PM"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-neon-yellow/5 border border-neon-yellow/20 text-xs">
                <p className="font-semibold neon-text-yellow mb-1">📩 Patient ko yeh message jayega:</p>
                <p className="text-muted-foreground">
                  "{rescheduleAppt.patientName} ji, aapka appointment reschedule ho gaya hai. Nayi Date: {newDate || "___"}, Naya Time: {newTime || "___"}. Please is time pe aayein."
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReschedule}
                disabled={!newDate || !newTime}
                className="flex-1 py-2 rounded-lg bg-neon-yellow/10 neon-text-yellow text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                🔄 Reschedule & Notify
              </button>
              <button onClick={() => setRescheduleAppt(null)} className="flex-1 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppt(null)}>
          <div className="glass-panel rounded-xl border neon-border-cyan p-5 max-w-sm w-full animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-sm font-bold neon-text-cyan mb-4">APPOINTMENT DETAILS</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedAppt.patientName}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedAppt.phone}</span></div>
              <div><span className="text-muted-foreground">Problem:</span> <span className="font-medium">{selectedAppt.reason || "—"}</span></div>
              <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{selectedAppt.date}</span></div>
              <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{selectedAppt.time}</span></div>
              <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{selectedAppt.source}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className={`font-semibold capitalize ${statusConfig[selectedAppt.status]?.class}`}>{selectedAppt.status}</span></div>
              <div><span className="text-muted-foreground">Booked:</span> <span className="font-medium">{new Date(selectedAppt.createdAt).toLocaleString()}</span></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {(selectedAppt.status === "pending" || selectedAppt.status === "confirmed") && (
                <button onClick={() => openReschedule(selectedAppt)} className="flex-1 py-2 rounded-lg bg-neon-yellow/10 neon-text-yellow text-xs font-semibold">🔄 Reschedule</button>
              )}
              {selectedAppt.status === "pending" && (
                <>
                  <button onClick={() => { updateStatus(selectedAppt.id, "confirmed"); setSelectedAppt(null); }} className="flex-1 py-2 rounded-lg bg-neon-green/10 neon-text-green text-xs font-semibold">✅ Confirm</button>
                  <button onClick={() => { updateStatus(selectedAppt.id, "cancelled"); setSelectedAppt(null); }} className="flex-1 py-2 rounded-lg bg-neon-pink/10 neon-text-pink text-xs font-semibold">❌ Cancel</button>
                </>
              )}
              {selectedAppt.status === "confirmed" && (
                <button onClick={() => { updateStatus(selectedAppt.id, "visited"); setSelectedAppt(null); }} className="flex-1 py-2 rounded-lg bg-neon-cyan/10 neon-text-cyan text-xs font-semibold">✅ Mark Visited</button>
              )}
              <button onClick={() => setSelectedAppt(null)} className="flex-1 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cards for mobile, table for desktop */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl border neon-border-pink p-12 text-center">
          <p className="text-muted-foreground text-sm">Koi appointment nahi hai abhi.</p>
          <p className="text-muted-foreground text-xs mt-1">Jab patient AI chatbot se appointment request karega, yahan dikhega.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((appt) => {
              const sc = statusConfig[appt.status];
              return (
                <div key={appt.id} className="glass-panel rounded-xl border border-border/50 p-4" onClick={() => setSelectedAppt(appt)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold neon-text-cyan">{appt.patientName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appt.phone}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.class} capitalize`}>{sc.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>🏥 {appt.reason || "General"}</p>
                    <p>📅 {appt.date} • 🕐 {appt.time}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {appt.status === "pending" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, "confirmed"); }} className="flex-1 py-1.5 rounded-lg bg-neon-green/10 text-[10px] font-semibold neon-text-green">✅ Confirm</button>
                        <button onClick={(e) => openReschedule(appt, e)} className="flex-1 py-1.5 rounded-lg bg-neon-yellow/10 text-[10px] font-semibold neon-text-yellow">🔄 Reschedule</button>
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, "cancelled"); }} className="flex-1 py-1.5 rounded-lg bg-neon-pink/10 text-[10px] font-semibold neon-text-pink">❌ Cancel</button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(appt.id, "visited"); }} className="flex-1 py-1.5 rounded-lg bg-neon-cyan/10 text-[10px] font-semibold neon-text-cyan">✅ Visited</button>
                        <button onClick={(e) => openReschedule(appt, e)} className="flex-1 py-1.5 rounded-lg bg-neon-yellow/10 text-[10px] font-semibold neon-text-yellow">🔄 Reschedule</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block glass-panel rounded-xl border neon-border-pink overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">PATIENT</th>
                    <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">PHONE</th>
                    <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">REASON</th>
                    <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">DATE</th>
                    <th className="text-left p-4 text-xs font-display font-semibold neon-text-pink tracking-wider">TIME</th>
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
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.class}`}>{sc.label}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {appt.status === "pending" && (
                              <>
                                <button onClick={() => updateStatus(appt.id, "confirmed")} className="p-1.5 rounded-lg hover:bg-neon-green/10 transition-colors" title="Confirm">
                                  <Check className="w-4 h-4 neon-text-green" />
                                </button>
                                <button onClick={() => openReschedule(appt)} className="p-1.5 rounded-lg hover:bg-neon-yellow/10 transition-colors" title="Reschedule">
                                  <CalendarClock className="w-4 h-4 neon-text-yellow" />
                                </button>
                                <button onClick={() => updateStatus(appt.id, "cancelled")} className="p-1.5 rounded-lg hover:bg-neon-pink/10 transition-colors" title="Cancel">
                                  <X className="w-4 h-4 neon-text-pink" />
                                </button>
                              </>
                            )}
                            {appt.status === "confirmed" && (
                              <>
                                <button onClick={() => updateStatus(appt.id, "visited")} className="p-1.5 rounded-lg hover:bg-neon-cyan/10 transition-colors" title="Mark Visited">
                                  <Clock className="w-4 h-4 neon-text-cyan" />
                                </button>
                                <button onClick={() => openReschedule(appt)} className="p-1.5 rounded-lg hover:bg-neon-yellow/10 transition-colors" title="Reschedule">
                                  <CalendarClock className="w-4 h-4 neon-text-yellow" />
                                </button>
                              </>
                            )}
                            <button onClick={() => setSelectedAppt(appt)} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors" title="View Details">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
