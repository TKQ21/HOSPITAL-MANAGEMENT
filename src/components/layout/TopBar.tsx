import { Menu, Moon, Sun, Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [dark, setDark] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [pendingAppts, setPendingAppts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const loadPending = async () => {
    const { data } = await supabase.from('appointments').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (data) {
      setPendingCount(data.length);
      setPendingAppts(data);
    }
  };

  useEffect(() => {
    loadPending();
    const channel = supabase
      .channel('topbar-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => loadPending())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clinic_auth");
    navigate("/login");
  };

  return (
    <header className="h-14 glass-panel border-b flex items-center justify-between px-4 z-10">
      <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-secondary/50 md:hidden">
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center animate-pulse-neon">
                <span className="text-[10px] font-bold text-destructive-foreground">{pendingCount}</span>
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-72 glass-panel rounded-xl border neon-border-cyan p-3 z-50 animate-slide-in">
              <h3 className="text-xs font-display font-bold neon-text-cyan mb-2">NOTIFICATIONS</h3>
              {pendingAppts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No new requests</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                  {pendingAppts.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="p-2 rounded-lg bg-secondary/30 text-xs">
                      <p className="font-medium">🆕 {a.patient_name}</p>
                      <p className="text-muted-foreground">{a.reason} • {a.appointment_date} {a.appointment_time}</p>
                      <p className="text-muted-foreground">📱 {a.phone}</p>
                    </div>
                  ))}
                  {pendingAppts.length > 5 && (
                    <p className="text-[10px] text-muted-foreground text-center">+{pendingAppts.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          {dark ? <Sun className="w-5 h-5 neon-text-yellow" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-glow-cyan">
          <span className="text-xs font-display font-bold neon-text-cyan">DR</span>
        </div>

        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group" title="Logout">
          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
        </button>
      </div>
    </header>
  );
}
