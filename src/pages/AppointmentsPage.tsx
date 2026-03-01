import { useState, useEffect } from "react";
import { Check, X, Clock, Search, RefreshCw, Eye, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  user_id: string;
  patient_name: string;
  phone: string;
  reason: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  source: string | null;
  rescheduled_date: string | null;
  rescheduled_time: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; class: string; bg: string }> = {
  pending: { label: "Pending", class: "neon-text-yellow", bg: "bg-neon-yellow/10" },
  confirmed: { label: "Confirmed", class: "neon-text-green", bg: "bg-neon-green/10" },
  cancelled: { label: "Cancelled", class: "neon-text-pink", bg: "bg-neon-pink/10" },
  visited: { label: "Visited", class: "neon-text-cyan", bg: "bg-neon-cyan/10" },
  rescheduled: { label: "Rescheduled", class: "neon-text-purple", bg: "bg-neon-purple/10" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const loadAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (data) setAppointments(data as Appointment[]);
  };

  useEffect(() => {
    loadAppointments();
    // Realtime subscription
    const channel = supabase
      .channel('doctor-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadAppointments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    
    if (status === "visited") {
      const appt = appointments.find(a => a.id === id);
      if (appt) {
        // Update patient visit count
        const { data: patient } = await supabase.from('patients').select('*').eq('phone', appt.phone).maybeSingle();
        if (patient) {
          await supabase.from('patients').update({ 
            visits: (patient.visits || 0) + 1, 
            last_visit: new Date().toISOString() 
          }).eq('id', patient.id);
        }
      }
    }
    loadAppointments();
  };

  const handleReschedule = async () => {
    if (!rescheduleAppt || !newDate || !newTime) return;
    
    // Update appointment
    await supabase.from('appointments').update({
      appointment_date: newDate,
      appointment_time: newTime,
      rescheduled_date: newDate,
      rescheduled_time: newTime,
      status: "confirmed",
    }).eq('id', rescheduleAppt.id);

    // Create notification for patient
    await supabase.from('notifications').insert({
      user_id: rescheduleAppt.user_id,
      phone: rescheduleAppt.phone,
      patient_name: rescheduleAppt.patient_name,
      message: `🔄 ${rescheduleAppt.patient_name} ji, aapka appointment reschedule ho gaya hai.\n\n📅 Nayi Date: ${newDate}\n🕐 Naya Time: ${newTime}\n🏥 Reason: ${rescheduleAppt.reason}\n📱 Aapke number ${rescheduleAppt.phone} par yeh notification bheja gaya hai.\n\nPlease is time pe aayein. Dhanyavaad! 🙏`,
      old_date: rescheduleAppt.appointment_date,
      old_time: rescheduleAppt.appointment_time,
      new_date: newDate,
      new_time: newTime,
    });

    setRescheduleAppt(null);
    setNewDate("");
    setNewTime("");
    loadAppointments();
  };

  const openReschedule = (appt: Appointment, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRescheduleAppt(appt);
    setNewDate(appt.appointment_date);
    setNewTime(appt.appointment_time);
    setSelectedAppt(null);
  };

  const filtered = appointments.filter(a => {
    const matchSearch = a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) || a.reason?.toLowerCase().includes(search.toLowerCase());
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
        <button onClick={loadAppointments} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel border neon-border-cyan hover:bg-secondary/50 transition-all text-sm self-start">
          <RefreshCw className="w-4 h-4 neon-text-cyan" />
          <span className="neon-text-cyan text-xs font-display">Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone or reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "rescheduled", "cancelled", "visited"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                filterStatus === s ? "glass-panel neon-border-cyan neon-text-cyan" : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => setRescheduleAppt(null)}>
          <div className="glass-panel rounded-xl border neon-border-yellow p-5 max-w-sm w-full animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-sm font-bold neon-text-yellow mb-1">🔄 RESCHEDULE APPOINTMENT</h3>
            <p className="text-xs text-muted-foreground mb-4">Patient ke mobile number par notification jayega</p>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30 text-xs">
                <p className="font-medium">{rescheduleAppt.patient_name}</p>
                <p className="text-muted-foreground">📱 {rescheduleAppt.phone} • 🏥 {rescheduleAppt.reason}</p>
                <p className="text-muted-foreground mt-1">Current: {rescheduleAppt.appointment_date} at {rescheduleAppt.appointment_time}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">New Date</label>
                <input type="text" value={newDate} onChange={e => setNewDate(e.target.value)} placeholder="e.g. 2026-03-10"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">New Time</label>
                <input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="e.g. 11:00 AM"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="p-3 rounded-lg bg-neon-yellow/5 border border-neon-yellow/20 text-xs">
                <p className="font-semibold neon-text-yellow mb-1">📩 Patient ke phone par message jayega:</p>
                <p className="text-muted-foreground">
                  "{rescheduleAppt.patient_name} ji, aapka appointment reschedule ho gaya hai. Nayi Date: {newDate || "___"}, Naya Time: {newTime || "___"}."
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleReschedule} disabled={!newDate || !newTime}
                className="flex-1 py-2 rounded-lg bg-neon-yellow/10 neon-text-yellow text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                🔄 Reschedule & Notify
              </button>
              <button onClick={() => setRescheduleAppt(null)} className="flex-1 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppt(null)}>
          <div className="glass-panel rounded-xl border neon-border-cyan p-5 max-w-sm w-full animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-sm font-bold neon-text-cyan mb-4">APPOINTMENT DETAILS</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedAppt.patient_name}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedAppt.phone}</span></div>
              <div><span className="text-muted-foreground">Problem:</span> <span className="font-medium">{selectedAppt.reason}</span></div>
              <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{selectedAppt.appointment_date}</span></div>
              <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{selectedAppt.appointment_time}</span></div>
              <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{selectedAppt.source}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className={`font-semibold capitalize ${statusConfig[selectedAppt.status]?.class}`}>{selectedAppt.status}</span></div>
              <div><span className="text-muted-foreground">Booked:</span> <span className="font-medium">{new Date(selectedAppt.created_at).toLocaleString()}</span></div>
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

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl border neon-border-pink p-12 text-center">
          <p className="text-muted-foreground text-sm">Koi appointment nahi hai abhi.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(appt => {
              const sc = statusConfig[appt.status] || statusConfig.pending;
              return (
                <div key={appt.id} className="glass-panel rounded-xl border border-border/50 p-4" onClick={() => setSelectedAppt(appt)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold neon-text-cyan">{appt.patient_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appt.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{appt.phone}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.class} capitalize`}>{sc.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>🏥 {appt.reason}</p>
                    <p>📅 {appt.appointment_date} • 🕐 {appt.appointment_time}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {appt.status === "pending" && (
                      <>
                        <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "confirmed"); }} className="flex-1 py-1.5 rounded-lg bg-neon-green/10 text-[10px] font-semibold neon-text-green">✅ Confirm</button>
                        <button onClick={e => openReschedule(appt, e)} className="flex-1 py-1.5 rounded-lg bg-neon-yellow/10 text-[10px] font-semibold neon-text-yellow">🔄 Reschedule</button>
                        <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "cancelled"); }} className="flex-1 py-1.5 rounded-lg bg-neon-pink/10 text-[10px] font-semibold neon-text-pink">❌ Cancel</button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <>
                        <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "visited"); }} className="flex-1 py-1.5 rounded-lg bg-neon-cyan/10 text-[10px] font-semibold neon-text-cyan">✅ Visited</button>
                        <button onClick={e => openReschedule(appt, e)} className="flex-1 py-1.5 rounded-lg bg-neon-yellow/10 text-[10px] font-semibold neon-text-yellow">🔄 Reschedule</button>
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
                  {filtered.map(appt => {
                    const sc = statusConfig[appt.status] || statusConfig.pending;
                    return (
                      <tr key={appt.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold neon-text-cyan">{appt.patient_name.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium">{appt.patient_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{appt.phone}</td>
                        <td className="p-4 text-sm">{appt.reason}</td>
                        <td className="p-4 text-sm">{appt.appointment_date}</td>
                        <td className="p-4 text-sm">{appt.appointment_time}</td>
                        <td className="p-4"><span className={`text-xs font-semibold capitalize ${sc.class}`}>{sc.label}</span></td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {appt.status === "pending" && (
                              <>
                                <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "confirmed"); }} className="p-1.5 rounded bg-neon-green/10 hover:bg-neon-green/20" title="Confirm"><Check className="w-3.5 h-3.5 neon-text-green" /></button>
                                <button onClick={e => openReschedule(appt, e)} className="p-1.5 rounded bg-neon-yellow/10 hover:bg-neon-yellow/20" title="Reschedule"><CalendarClock className="w-3.5 h-3.5 neon-text-yellow" /></button>
                                <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "cancelled"); }} className="p-1.5 rounded bg-neon-pink/10 hover:bg-neon-pink/20" title="Cancel"><X className="w-3.5 h-3.5 neon-text-pink" /></button>
                              </>
                            )}
                            {appt.status === "confirmed" && (
                              <>
                                <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, "visited"); }} className="p-1.5 rounded bg-neon-cyan/10 hover:bg-neon-cyan/20" title="Mark Visited"><Eye className="w-3.5 h-3.5 neon-text-cyan" /></button>
                                <button onClick={e => openReschedule(appt, e)} className="p-1.5 rounded bg-neon-yellow/10 hover:bg-neon-yellow/20" title="Reschedule"><CalendarClock className="w-3.5 h-3.5 neon-text-yellow" /></button>
                              </>
                            )}
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
