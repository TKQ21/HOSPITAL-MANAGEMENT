import { useState } from "react";
import { Search, Phone, Calendar, FileText } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  phone: string;
  visits: number;
  lastVisit: string;
  notes: string;
  followUp: string | null;
}

const demoPatients: Patient[] = [
  { id: 1, name: "Ravi Kumar", phone: "98xxxxx021", visits: 5, lastVisit: "2026-02-25", notes: "Regular check-up, BP normal", followUp: "2026-03-10" },
  { id: 2, name: "Priya Singh", phone: "98xxxxx032", visits: 3, lastVisit: "2026-02-20", notes: "Throat infection, prescribed antibiotics", followUp: "2026-03-05" },
  { id: 3, name: "Amit Patel", phone: "98xxxxx043", visits: 1, lastVisit: "2026-02-27", notes: "First visit, blood report review", followUp: null },
  { id: 4, name: "Neha Gupta", phone: "98xxxxx054", visits: 8, lastVisit: "2026-02-18", notes: "Diabetes follow-up, sugar controlled", followUp: "2026-03-18" },
  { id: 5, name: "Rajesh Verma", phone: "98xxxxx065", visits: 2, lastVisit: "2026-02-15", notes: "Back pain, physiotherapy recommended", followUp: "2026-03-01" },
  { id: 6, name: "Sunita Devi", phone: "98xxxxx076", visits: 12, lastVisit: "2026-02-26", notes: "Thyroid medication adjusted", followUp: "2026-03-26" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const filtered = demoPatients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-yellow tracking-wider">Patients</h1>
        <p className="text-muted-foreground text-sm mt-1">Patient records & visit history</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Patient list */}
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
                  <p className="text-xs text-muted-foreground">Last: {patient.lastVisit}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Patient detail */}
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
                  <p className="text-xs text-muted-foreground">Last visit: {selected.lastVisit}</p>
                </div>

                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 neon-text-green" />
                    <span className="text-xs font-semibold">Notes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selected.notes}</p>
                </div>

                {selected.followUp && (
                  <div className="p-3 rounded-lg bg-secondary/30 border neon-border-green">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 neon-text-pink" />
                      <span className="text-xs font-semibold">Next Follow-up</span>
                    </div>
                    <p className="text-xs neon-text-green font-semibold">{selected.followUp}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
