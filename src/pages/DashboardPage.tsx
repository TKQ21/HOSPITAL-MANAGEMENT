import { Calendar, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

const stats = [
  { label: "Today's Appointments", value: "12", icon: Calendar, glow: "neon-glow-cyan", text: "neon-text-cyan", border: "neon-border-cyan" },
  { label: "Total Patients", value: "348", icon: Users, glow: "neon-glow-green", text: "neon-text-green", border: "neon-border-green" },
  { label: "Pending Requests", value: "5", icon: Clock, glow: "neon-glow-yellow", text: "neon-text-yellow", border: "neon-border-pink" },
  { label: "Completed Today", value: "7", icon: CheckCircle, glow: "neon-glow-pink", text: "neon-text-pink", border: "neon-border-pink" },
];

const recentAppointments = [
  { name: "Ravi Kumar", time: "10:00 AM", status: "confirmed", type: "General" },
  { name: "Priya Singh", time: "10:30 AM", status: "pending", type: "Follow-up" },
  { name: "Amit Patel", time: "11:00 AM", status: "confirmed", type: "Report" },
  { name: "Neha Gupta", time: "11:30 AM", status: "pending", type: "General" },
  { name: "Rajesh Verma", time: "12:00 PM", status: "cancelled", type: "Follow-up" },
];

const statusColors: Record<string, string> = {
  confirmed: "neon-text-green",
  pending: "neon-text-yellow",
  cancelled: "neon-text-pink",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-cyan tracking-wider">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Dr. Sharma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass-panel rounded-xl p-5 border ${stat.border} ${stat.glow} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-6 h-6 ${stat.text}`} />
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className={`font-display text-2xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Appointments + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border neon-border-cyan">
          <h2 className="font-display text-sm font-semibold neon-text-cyan tracking-wider mb-4">
            TODAY'S SCHEDULE
          </h2>
          <div className="space-y-3">
            {recentAppointments.map((appt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold neon-text-cyan">{appt.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{appt.name}</p>
                    <p className="text-xs text-muted-foreground">{appt.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{appt.time}</span>
                  <span className={`text-xs font-semibold capitalize ${statusColors[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 border neon-border-pink">
          <h2 className="font-display text-sm font-semibold neon-text-pink tracking-wider mb-4">
            ALERTS
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <AlertTriangle className="w-4 h-4 neon-text-yellow mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">5 pending appointment requests</p>
                <p className="text-[10px] text-muted-foreground mt-1">Awaiting confirmation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <AlertTriangle className="w-4 h-4 neon-text-pink mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">2 missed appointments</p>
                <p className="text-[10px] text-muted-foreground mt-1">Follow-up needed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <AlertTriangle className="w-4 h-4 neon-text-green mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">3 follow-up reminders due</p>
                <p className="text-[10px] text-muted-foreground mt-1">Send today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal */}
      <p className="text-[10px] text-muted-foreground text-center">
        This AI assistant does not provide medical advice. For medical emergencies, contact your doctor directly.
      </p>
    </div>
  );
}
