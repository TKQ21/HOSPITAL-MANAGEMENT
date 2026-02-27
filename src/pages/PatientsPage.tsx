import { useState, useEffect } from "react";
import { Search, Phone, Calendar, FileText } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  phone: string;
  visits: number;
  lastVisit: string | null;
  notes: string;
  followUp: string | null;
  createdAt: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("clinic_patients");
    if (stored) setPatients(JSON.parse(stored));
  }, []);

  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-yellow tracking-wider">Patients</h1>
        <p className="text-muted-foreground text-sm mt-1">Patient records from AI chatbot interactions</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {patients.length === 0 ? (
        <div className="glass-panel rounded-xl border neon-border-yellow p-12 text-center">
          <p className="text-muted-foreground text-sm">Koi patient record nahi hai abhi.</p>
          <p className="text-muted-foreground text-xs mt-1">Jab patient AI chatbot se baat karega, yahan dikhega.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelected(patient)}
                className={`w-full text-left glass-panel rounded-xl p-4 border transition-all hover:scale-[1.01] ${
                  selected?.id === patient.id ? "neon-border-cyan neon-glow-cyan" : "border-border/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center neon-glow-cyan">
                      <span className="text-sm font-bold neon-text-cyan">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{patient.visits} visits</p>
                    {patient.lastVisit && (
                      <p className="text-xs text-muted-foreground">Last: {patient.lastVisit}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="glass-panel rounded-xl p-5 border neon-border-yellow h-fit">
            {selected ? (
              <div className="space-y-4 animate-slide-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center neon-glow-yellow">
                    <span className="text-lg font-bold neon-text-yellow">{selected.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold neon-text-yellow">{selected.name}</h3>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 neon-text-cyan" />
                      <span className="text-xs font-semibold">Visit History</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selected.visits} total visits</p>
                    {selected.lastVisit && (
                      <p className="text-xs text-muted-foreground">Last: {selected.lastVisit}</p>
                    )}
                  </div>

                  {selected.notes && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3.5 h-3.5 neon-text-green" />
                        <span className="text-xs font-semibold">Notes / Problem</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selected.notes}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-secondary/30">
                    <span className="text-xs font-semibold">Registered</span>
                    <p className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
