import { useState, useEffect } from "react";
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const appts = JSON.parse(localStorage.getItem("clinic_appointments") || "[]");
    const pats = JSON.parse(localStorage.getItem("clinic_patients") || "[]");
    setAppointments(appts);
    setPatients(pats);
  }, []);

  const pending = appointments.filter((a) => a.status === "pending");
  const confirmed = appointments.filter((a) => a.status === "confirmed");
  const visited = appointments.filter((a) => a.status === "visited");

  const stats = [
    { label: "Total Appointments", value: String(appointments.length), icon: Calendar, glow: "neon-glow-cyan", text: "neon-text-cyan", border: "neon-border-cyan" },
    { label: "Total Patients", value: String(patients.length), icon: Users, glow: "neon-glow-green", text: "neon-text-green", border: "neon-border-green" },
    { label: "Pending Requests", value: String(pending.length), icon: Clock, glow: "neon-glow-yellow", text: "neon-text-yellow", border: "neon-border-pink" },
    { label: "Visited", value: String(visited.length), icon: CheckCircle, glow: "neon-glow-pink", text: "neon-text-pink", border: "neon-border-pink" },
  ];

  const statusColors: Record<string, string> = {
    confirmed: "neon-text-green",
    pending: "neon-text-yellow",
    cancelled: "neon-text-pink",
    visited: "neon-text-cyan",
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-cyan tracking-wider">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Dr. Sharma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass-panel rounded-xl p-5 border ${stat.border} ${stat.glow} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 ${stat.text}`} />
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className={`font-display text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border neon-border-cyan">
          <h2 className="font-display text-sm font-semibold neon-text-cyan tracking-wider mb-4">RECENT APPOINTMENTS</h2>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Koi appointment nahi hai abhi. Patient AI chatbot se book karega.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(-5).reverse().map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold neon-text-cyan">{appt.patientName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appt.reason || "General"} • {appt.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{appt.date} {appt.time}</span>
                    <span className={`text-xs font-semibold capitalize ${statusColors[appt.status] || ""}`}>{appt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl p-5 border neon-border-pink">
          <h2 className="font-display text-sm font-semibold neon-text-pink tracking-wider mb-4">ALERTS</h2>
          <div className="space-y-3">
            {pending.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <AlertTriangle className="w-4 h-4 neon-text-yellow mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{pending.length} pending appointment request{pending.length > 1 ? "s" : ""}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Review & confirm karein</p>
                </div>
              </div>
            )}
            {appointments.length === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <AlertTriangle className="w-4 h-4 neon-text-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">System ready</p>
                  <p className="text-[10px] text-muted-foreground mt-1">AI chatbot se patients appointment request karenge</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        This AI assistant does not provide medical advice. For medical emergencies, contact your doctor directly.
      </p>
    </div>
  );
}
