import { useState, useEffect } from "react";
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, BedDouble, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  const load = async () => {
    const [a, p, b, bi] = await Promise.all([
      supabase.from("appointments").select("*").order("created_at", { ascending: false }),
      supabase.from("patients").select("*"),
      supabase.from("beds").select("*"),
      supabase.from("billing").select("*"),
    ]);
    if (a.data) setAppointments(a.data);
    if (p.data) setPatients(p.data);
    if (b.data) setBeds(b.data);
    if (bi.data) setBills(bi.data);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "beds" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today);
  const pending = appointments.filter(a => a.status === "pending");
  const visited = appointments.filter(a => a.status === "visited");
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;
  const bedOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const todayRevenue = bills.filter(b => b.payment_status === "paid").reduce((s, b) => s + Number(b.paid_amount), 0);
  const icuBeds = beds.filter(b => b.ward_type === "ICU");
  const icuOccupied = icuBeds.filter(b => b.status === "occupied").length;
  const icuPercent = icuBeds.length > 0 ? Math.round((icuOccupied / icuBeds.length) * 100) : 0;

  const stats = [
    { label: "Today's Appointments", value: String(todayAppts.length), icon: Calendar, text: "neon-text-cyan", border: "neon-border-cyan", glow: "neon-glow-cyan" },
    { label: "Total Patients", value: String(patients.length), icon: Users, text: "neon-text-green", border: "neon-border-green", glow: "neon-glow-green" },
    { label: "Pending Requests", value: String(pending.length), icon: Clock, text: "neon-text-yellow", border: "neon-border-yellow", glow: "neon-glow-yellow" },
    { label: "Visited", value: String(visited.length), icon: CheckCircle, text: "neon-text-pink", border: "neon-border-pink", glow: "neon-glow-pink" },
    { label: "Bed Occupancy", value: `${bedOccupancy}%`, icon: BedDouble, text: "neon-text-cyan", border: "neon-border-cyan", glow: "" },
    { label: "Revenue (Paid)", value: `₹${todayRevenue.toLocaleString()}`, icon: DollarSign, text: "neon-text-green", border: "neon-border-green", glow: "" },
  ];

  const statusColors: Record<string, string> = {
    confirmed: "neon-text-green", pending: "neon-text-yellow", cancelled: "neon-text-pink", visited: "neon-text-cyan",
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Dashboard</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Welcome back, Doctor — all data from database</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`glass-panel rounded-xl p-3 sm:p-5 border ${stat.border} ${stat.glow} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.text}`} />
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            </div>
            <p className={`font-display text-xl sm:text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ICU Alert */}
      {icuBeds.length > 0 && icuPercent >= 85 && (
        <div className="glass-panel rounded-xl p-4 border neon-border-pink neon-glow-pink">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 neon-text-pink animate-pulse" />
            <div>
              <p className="text-sm font-semibold neon-text-pink">ICU at {icuPercent}% capacity</p>
              <p className="text-xs text-muted-foreground">{icuBeds.length - icuOccupied} ICU beds remaining</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-xl p-4 sm:p-5 border neon-border-cyan">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xs sm:text-sm font-semibold neon-text-cyan tracking-wider">RECENT APPOINTMENTS</h2>
            <Link to="/appointments" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">View All →</Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No appointments yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {appointments.slice(0, 5).map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold neon-text-cyan">{appt.patient_name?.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{appt.patient_name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{appt.reason} • {appt.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                    <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{appt.appointment_date} {appt.appointment_time}</span>
                    <span className={`text-[10px] sm:text-xs font-semibold capitalize ${statusColors[appt.status] || ""}`}>{appt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl p-4 sm:p-5 border neon-border-pink">
          <h2 className="font-display text-xs sm:text-sm font-semibold neon-text-pink tracking-wider mb-4">ALERTS</h2>
          <div className="space-y-3">
            {pending.length > 0 && (
              <Link to="/appointments" className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <AlertTriangle className="w-4 h-4 neon-text-yellow mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{pending.length} pending appointment{pending.length > 1 ? "s" : ""}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Review & confirm</p>
                </div>
              </Link>
            )}
            {beds.length > 0 && (
              <Link to="/beds" className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <BedDouble className="w-4 h-4 neon-text-cyan mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{occupiedBeds}/{totalBeds} beds occupied</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{bedOccupancy}% occupancy</p>
                </div>
              </Link>
            )}
            {appointments.length === 0 && beds.length === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <BarChart3 className="w-4 h-4 neon-text-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">System ready</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Add data to see live analytics</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
