import { useState, useEffect } from "react";
import { Search, Phone, Calendar, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  name: string;
  phone: string;
  visits: number | null;
  last_visit: string | null;
  notes: string | null;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const load = async () => {
    const { data: pts } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (pts) setPatients(pts as Patient[]);
    const { data: appts } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (appts) setAppointments(appts);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('patients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  const getPatientAppointments = (phone: string) => appointments.filter((a: any) => a.phone === phone);

  const statusColors: Record<string, string> = {
    confirmed: "neon-text-green",
    pending: "neon-text-yellow",
    cancelled: "neon-text-pink",
    visited: "neon-text-cyan",
    rescheduled: "neon-text-purple",
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-yellow tracking-wider">Patients</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Patient records & complete appointment history</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone number..."
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {patients.length === 0 ? (
        <div className="glass-panel rounded-xl border neon-border-yellow p-12 text-center">
          <p className="text-muted-foreground text-sm">Koi patient record nahi hai abhi.</p>
        </div>
      ) : (
        <>
          <div className="lg:hidden">
            {selected ? (
              <div className="glass-panel rounded-xl p-4 border neon-border-yellow animate-slide-in">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <PatientDetail patient={selected} appointments={getPatientAppointments(selected.phone)} statusColors={statusColors} />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(patient => (
                  <button key={patient.id} onClick={() => setSelected(patient)}
                    className="w-full text-left glass-panel rounded-xl p-4 border border-border/50 transition-all hover:scale-[1.01]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center neon-glow-cyan">
                          <span className="text-sm font-bold neon-text-cyan">{patient.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{patient.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{patient.visits || 0} visits</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && search && (
                  <div className="glass-panel rounded-xl border neon-border-pink p-8 text-center">
                    <p className="text-muted-foreground text-sm">"{search}" se koi patient nahi mila.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {filtered.map(patient => (
                <button key={patient.id} onClick={() => setSelected(patient)}
                  className={`w-full text-left glass-panel rounded-xl p-4 border transition-all hover:scale-[1.01] ${
                    selected?.id === patient.id ? "neon-border-cyan neon-glow-cyan" : "border-border/50"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center neon-glow-cyan">
                        <span className="text-sm font-bold neon-text-cyan">{patient.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{patient.visits || 0} visits</p>
                      {patient.last_visit && <p className="text-xs text-muted-foreground">Last: {new Date(patient.last_visit).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && search && (
                <div className="glass-panel rounded-xl border neon-border-pink p-8 text-center">
                  <p className="text-muted-foreground text-sm">"{search}" se koi patient nahi mila.</p>
                </div>
              )}
            </div>

            <div className="glass-panel rounded-xl p-5 border neon-border-yellow h-fit">
              {selected ? (
                <PatientDetail patient={selected} appointments={getPatientAppointments(selected.phone)} statusColors={statusColors} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Select a patient to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PatientDetail({ patient, appointments, statusColors }: { patient: Patient; appointments: any[]; statusColors: Record<string, string> }) {
  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center neon-glow-yellow">
          <span className="text-lg font-bold neon-text-yellow">{patient.name.charAt(0)}</span>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold neon-text-yellow">{patient.name}</h3>
          <p className="text-xs text-muted-foreground">📱 {patient.phone}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3.5 h-3.5 neon-text-cyan" />
            <span className="text-xs font-semibold">Visit History</span>
          </div>
          <p className="text-xs text-muted-foreground">{patient.visits || 0} total visits</p>
          {patient.last_visit && <p className="text-xs text-muted-foreground">Last: {new Date(patient.last_visit).toLocaleDateString()}</p>}
        </div>

        {patient.notes && (
          <div className="p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 neon-text-green" />
              <span className="text-xs font-semibold">Notes / Problem</span>
            </div>
            <p className="text-xs text-muted-foreground">{patient.notes}</p>
          </div>
        )}

        {appointments.length > 0 && (
          <div className="p-3 rounded-lg bg-secondary/30">
            <span className="text-xs font-semibold mb-2 block">📋 Complete Appointment History</span>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {appointments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between text-[10px] sm:text-xs border-b border-border/30 pb-1.5 last:border-0">
                  <div>
                    <p className="text-muted-foreground">{a.appointment_date} • {a.appointment_time}</p>
                    <p className="text-muted-foreground">{a.reason}</p>
                  </div>
                  <span className={`font-semibold capitalize ${statusColors[a.status] || ""}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs font-semibold">Registered</span>
          <p className="text-xs text-muted-foreground">{new Date(patient.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
