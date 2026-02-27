import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  Activity,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "neon-text-cyan" },
  { to: "/chat", icon: MessageSquare, label: "AI Chat", color: "neon-text-green" },
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
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } transition-all duration-300 glass-panel border-r flex flex-col relative z-10`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-border/50">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-cyan">
          <Activity className="w-5 h-5 neon-text-cyan" />
        </div>
        {open && (
          <div className="animate-slide-in">
            <h1 className="font-display text-sm font-bold neon-text-cyan tracking-wider">
              MEDI ASSIST
            </h1>
            <p className="text-[10px] text-muted-foreground">AI Receptionist</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "glass-panel neon-glow-cyan"
                    : "hover:bg-secondary/50"
                }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 transition-all ${
                  isActive ? item.color : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {open && (
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse */}
      <button
        onClick={onToggle}
        className="p-3 border-t border-border/50 flex items-center justify-center hover:bg-secondary/50 transition-colors"
      >
        <ChevronLeft
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            !open ? "rotate-180" : ""
          }`}
        />
      </button>
    </aside>
  );
}
