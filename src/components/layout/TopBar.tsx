import { Menu, Moon, Sun, Bell, LogOut, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [dark, setDark] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [pendingAppts, setPendingAppts] = useState<any[]>([]);
  const [notifMessages, setNotifMessages] = useState<any[]>([]);
  const sessionStartedAt = useRef(new Date().toISOString());
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const loadPending = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', sessionStartedAt.current)
      .order('created_at', { ascending: false });
    setPendingAppts(data || []);
  };

  const loadNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .gte('created_at', sessionStartedAt.current)
      .order('created_at', { ascending: false });
    setNotifMessages(data || []);
  };

  useEffect(() => {
    loadPending();
    loadNotifications();
    const ch1 = supabase
      .channel('topbar-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => loadPending())
      .subscribe();
    const ch2 = supabase
      .channel('topbar-notif-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadNotifications())
      .subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, []);

  const totalCount = pendingAppts.length + notifMessages.length;

  const handleLogout = () => {
    localStorage.removeItem("clinic_auth");
    navigate("/login");
  };

  const downloadNotificationPDF = (notif: any) => {
    const content = `
NOTIFICATION REPORT
====================
Patient: ${notif.patient_name || 'N/A'}
Phone: ${notif.phone || 'N/A'}
Message: ${notif.message || 'N/A'}
${notif.old_date ? `Old Date: ${notif.old_date}` : ''}
${notif.old_time ? `Old Time: ${notif.old_time}` : ''}
${notif.new_date ? `New Date: ${notif.new_date}` : ''}
${notif.new_time ? `New Time: ${notif.new_time}` : ''}
Date: ${new Date(notif.created_at).toLocaleString()}
====================
    `.trim();

    // Generate a simple PDF using a data URI with HTML
    const html = `
      <html><head><title>Notification</title><style>
        body{font-family:Arial,sans-serif;padding:40px;color:#222}
        h1{color:#0891b2;font-size:22px;border-bottom:2px solid #0891b2;padding-bottom:10px}
        .field{margin:10px 0;font-size:14px}
        .label{font-weight:bold;color:#555}
        .footer{margin-top:30px;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:10px}
      </style></head><body>
        <h1>📋 Notification Report</h1>
        <div class="field"><span class="label">Patient:</span> ${notif.patient_name || 'N/A'}</div>
        <div class="field"><span class="label">Phone:</span> ${notif.phone || 'N/A'}</div>
        <div class="field"><span class="label">Message:</span> ${notif.message || 'N/A'}</div>
        ${notif.old_date ? `<div class="field"><span class="label">Old Date:</span> ${notif.old_date}</div>` : ''}
        ${notif.old_time ? `<div class="field"><span class="label">Old Time:</span> ${notif.old_time}</div>` : ''}
        ${notif.new_date ? `<div class="field"><span class="label">New Date:</span> ${notif.new_date}</div>` : ''}
        ${notif.new_time ? `<div class="field"><span class="label">New Time:</span> ${notif.new_time}</div>` : ''}
        <div class="field"><span class="label">Date:</span> ${new Date(notif.created_at).toLocaleString()}</div>
        <div class="footer">© 2026 Mohd Kaif · Generated from Hospital Dashboard</div>
      </body></html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const downloadAppointmentPDF = (appt: any) => {
    const html = `
      <html><head><title>Appointment</title><style>
        body{font-family:Arial,sans-serif;padding:40px;color:#222}
        h1{color:#0891b2;font-size:22px;border-bottom:2px solid #0891b2;padding-bottom:10px}
        .field{margin:10px 0;font-size:14px}
        .label{font-weight:bold;color:#555}
        .footer{margin-top:30px;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:10px}
      </style></head><body>
        <h1>📋 Appointment Request</h1>
        <div class="field"><span class="label">Patient:</span> ${appt.patient_name}</div>
        <div class="field"><span class="label">Phone:</span> ${appt.phone}</div>
        <div class="field"><span class="label">Reason:</span> ${appt.reason}</div>
        <div class="field"><span class="label">Date:</span> ${appt.appointment_date}</div>
        <div class="field"><span class="label">Time:</span> ${appt.appointment_time}</div>
        <div class="field"><span class="label">Status:</span> ${appt.status}</div>
        <div class="field"><span class="label">Source:</span> ${appt.source || 'Web'}</div>
        <div class="field"><span class="label">Requested:</span> ${new Date(appt.created_at).toLocaleString()}</div>
        <div class="footer">© 2026 Mohd Kaif · Generated from Hospital Dashboard</div>
      </body></html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
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
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center animate-pulse-neon">
                <span className="text-[10px] font-bold text-destructive-foreground">{totalCount}</span>
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 glass-panel rounded-xl border neon-border-cyan p-3 z-50 animate-slide-in max-h-[80vh] overflow-y-auto scrollbar-thin">
              <h3 className="text-xs font-display font-bold neon-text-cyan mb-2">NOTIFICATIONS ({totalCount})</h3>
              
              {/* Reschedule / Cancel notifications */}
              {notifMessages.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-neon-pink mb-1">📨 MESSAGES</p>
                  <div className="space-y-2">
                    {notifMessages.map((n: any) => (
                      <div key={n.id} className="p-2 rounded-lg bg-secondary/30 text-xs border border-neon-pink/20">
                        <p className="font-medium neon-text-pink">📩 {n.patient_name}</p>
                        <p className="text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-muted-foreground">📱 {n.phone}</p>
                        {n.new_date && <p className="text-muted-foreground">📅 New: {n.new_date} {n.new_time}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[9px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadNotificationPDF(n); }}
                            className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/30 neon-text-cyan transition-colors"
                            title="Download as PDF"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending appointment requests */}
              {pendingAppts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold neon-text-green mb-1">🆕 NEW APPOINTMENTS</p>
                  <div className="space-y-2">
                    {pendingAppts.map((a: any) => (
                      <div key={a.id} className="p-2 rounded-lg bg-secondary/30 text-xs border border-neon-green/20">
                        <p className="font-medium neon-text-green">🆕 {a.patient_name}</p>
                        <p className="text-muted-foreground">{a.reason} • {a.appointment_date} {a.appointment_time}</p>
                        <p className="text-muted-foreground">📱 {a.phone}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[9px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadAppointmentPDF(a); }}
                            className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/30 neon-text-cyan transition-colors"
                            title="Download as PDF"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalCount === 0 && (
                <p className="text-xs text-muted-foreground py-2">No notifications</p>
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
