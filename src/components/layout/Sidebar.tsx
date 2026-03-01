import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  Activity,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "neon-text-cyan" },
  { to: "/appointments", icon: Calendar, label: "Appointments", color: "neon-text-pink" },
  { to: "/patients", icon: Users, label: "Patients", color: "neon-text-yellow" },
  { to: "/settings", icon: Settings, label: "Settings", color: "neon-text-cyan" },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-background/60 z-20 md:hidden" onClick={onToggle} />
      )}
      <aside className={`
        fixed md:relative z-30
        ${open ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"}
        md:translate-x-0 transition-all duration-300 glass-panel border-r flex flex-col h-full overflow-hidden
      `}>
        <div className="flex items-center gap-3 p-5 border-b border-border/50 min-w-[5rem]">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-cyan shrink-0">
            <Activity className="w-5 h-5 neon-text-cyan" />
          </div>
          {open && (
            <div className="animate-slide-in">
              <h1 className="font-display text-sm font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
              <p className="text-[10px] text-muted-foreground">Doctor Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                onClick={() => { if (window.innerWidth < 768) onToggle(); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive ? "glass-panel neon-glow-cyan" : "hover:bg-secondary/50"}`}>
                <item.icon className={`w-5 h-5 shrink-0 transition-all ${isActive ? item.color : "text-muted-foreground group-hover:text-foreground"}`} />
                {open && (
                  <span className={`text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button onClick={onToggle} className="hidden md:flex p-3 border-t border-border/50 items-center justify-center hover:bg-secondary/50 transition-colors">
          <ChevronLeft className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${!open ? "rotate-180" : ""}`} />
        </button>
      </aside>
    </>
  );
}
