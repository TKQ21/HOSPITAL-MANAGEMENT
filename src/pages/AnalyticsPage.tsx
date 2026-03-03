import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Calendar, BedDouble, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [a, p, b, bi, d] = await Promise.all([
        supabase.from("appointments").select("*"),
        supabase.from("patients").select("*"),
        supabase.from("beds").select("*"),
        supabase.from("billing").select("*"),
        supabase.from("departments").select("*"),
      ]);
      if (a.data) setAppointments(a.data);
      if (p.data) setPatients(p.data);
      if (b.data) setBeds(b.data);
      if (bi.data) setBills(bi.data);
      if (d.data) setDepartments(d.data);
    };
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today);
  const totalRevenue = bills.filter(b => b.payment_status === "paid").reduce((s, b) => s + Number(b.paid_amount), 0);
  const pendingRevenue = bills.filter(b => b.payment_status !== "paid").reduce((s, b) => s + (Number(b.total_amount) - Number(b.paid_amount)), 0);
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;
  const bedOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const visitedAppts = appointments.filter(a => a.status === "visited").length;
  const totalAppts = appointments.length;
  const completionRate = totalAppts > 0 ? Math.round((visitedAppts / totalAppts) * 100) : 0;
  const noShowCount = appointments.filter(a => a.status === "cancelled").length;
  const noShowRate = totalAppts > 0 ? Math.round((noShowCount / totalAppts) * 100) : 0;

  // Hourly distribution for today
  const hourlyData: Record<string, number> = {};
  todayAppts.forEach(a => {
    const hour = a.appointment_time?.split(":")[0] || "00";
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourlyData).sort((a, b) => b[1] - a[1])[0];

  // Department-wise appointments
  const deptLoad: Record<string, number> = {};
  appointments.forEach(a => {
    const dept = a.reason || "General";
    deptLoad[dept] = (deptLoad[dept] || 0) + 1;
  });

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: Calendar, color: "neon-text-cyan", border: "neon-border-cyan" },
    { label: "Active Patients", value: patients.length, icon: Users, color: "neon-text-green", border: "neon-border-green" },
    { label: "Bed Occupancy", value: `${bedOccupancy}%`, icon: BedDouble, color: "neon-text-yellow", border: "neon-border-yellow" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "neon-text-pink", border: "neon-border-pink" },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "neon-text-green", border: "neon-border-green" },
    { label: "No-Show Rate", value: `${noShowRate}%`, icon: BarChart3, color: "neon-text-pink", border: "neon-border-pink" },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold neon-text-cyan tracking-wider">Analytics</h1>
        <p className="text-muted-foreground text-xs mt-1">Real-time hospital metrics from database</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className={`glass-panel rounded-xl p-3 sm:p-4 border ${stat.border}`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Peak Hour & Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl p-4 border neon-border-cyan">
          <h2 className="font-display text-sm font-semibold neon-text-cyan mb-3">OPD PEAK ANALYSIS (Today)</h2>
          {todayAppts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No appointments today — add appointments to see analysis</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs">Peak Hour: <span className="neon-text-yellow font-bold">{peakHour ? `${peakHour[0]}:00 (${peakHour[1]} appts)` : "N/A"}</span></p>
              <p className="text-xs">Total Today: <span className="neon-text-green font-bold">{todayAppts.length}</span></p>
              <div className="space-y-1 mt-3">
                <p className="text-[10px] text-muted-foreground">Hourly Distribution:</p>
                {Object.entries(hourlyData).sort().map(([h, c]) => (
                  <div key={h} className="flex items-center gap-2">
                    <span className="text-[10px] w-10">{h}:00</span>
                    <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(c / (peakHour?.[1] || 1)) * 100}%` }} />
                    </div>
                    <span className="text-[10px] w-4">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl p-4 border neon-border-green">
          <h2 className="font-display text-sm font-semibold neon-text-green mb-3">DEPARTMENT LOAD</h2>
          {Object.keys(deptLoad).length === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet — add appointments to see department analysis</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(deptLoad).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{dept}</span>
                  <span className="neon-text-green font-bold ml-2">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue & Beds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl p-4 border neon-border-pink">
          <h2 className="font-display text-sm font-semibold neon-text-pink mb-3">REVENUE BREAKDOWN</h2>
          {bills.length === 0 ? (
            <p className="text-xs text-muted-foreground">No billing data — create bills to see revenue analysis</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs">Collected: <span className="neon-text-green font-bold">₹{totalRevenue.toLocaleString()}</span></p>
              <p className="text-xs">Pending: <span className="neon-text-yellow font-bold">₹{pendingRevenue.toLocaleString()}</span></p>
              <p className="text-xs">Total Bills: <span className="neon-text-cyan font-bold">{bills.length}</span></p>
            </div>
          )}
        </div>

        <div className="glass-panel rounded-xl p-4 border neon-border-yellow">
          <h2 className="font-display text-sm font-semibold neon-text-yellow mb-3">BED STATUS</h2>
          {beds.length === 0 ? (
            <p className="text-xs text-muted-foreground">No beds configured — add beds to see occupancy</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs">Total: <span className="font-bold">{totalBeds}</span></p>
              <p className="text-xs">Occupied: <span className="neon-text-yellow font-bold">{occupiedBeds}</span></p>
              <p className="text-xs">Available: <span className="neon-text-green font-bold">{totalBeds - occupiedBeds}</span></p>
              <div className="h-3 bg-secondary/50 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full ${bedOccupancy >= 85 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${bedOccupancy}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{bedOccupancy}% occupancy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
