import { useState } from "react";
import { Save, Building2, UserCog, Clock, DollarSign } from "lucide-react";

export default function SettingsPage() {
  const [clinicName, setClinicName] = useState("City Health Clinic");
  const [doctorName, setDoctorName] = useState("Dr. Sharma");
  const [specialization, setSpecialization] = useState("General Physician");
  const [fees, setFees] = useState("500");
  const [followUpFees, setFollowUpFees] = useState("200");
  const [timings, setTimings] = useState("10:00 AM - 6:00 PM");
  const [address, setAddress] = useState("123 Main Street, City Center");
  const [phone, setPhone] = useState("011-12345678");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-slide-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-cyan tracking-wider">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Clinic configuration</p>
      </div>

      {/* Clinic Info */}
      <div className="glass-panel rounded-xl p-5 border neon-border-cyan space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 neon-text-cyan" />
          <h2 className="font-display text-sm font-semibold neon-text-cyan tracking-wider">CLINIC INFO</h2>
        </div>
        {[
          { label: "Clinic Name", value: clinicName, set: setClinicName },
          { label: "Address", value: address, set: setAddress },
          { label: "Phone", value: phone, set: setPhone },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
            <input
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        ))}
      </div>

      {/* Doctor Info */}
      <div className="glass-panel rounded-xl p-5 border neon-border-green space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserCog className="w-5 h-5 neon-text-green" />
          <h2 className="font-display text-sm font-semibold neon-text-green tracking-wider">DOCTOR INFO</h2>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Doctor Name</label>
          <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Specialization</label>
          <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>

      {/* Fees & Timings */}
      <div className="glass-panel rounded-xl p-5 border neon-border-pink space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 neon-text-pink" />
          <h2 className="font-display text-sm font-semibold neon-text-pink tracking-wider">FEES & TIMINGS</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Consultation Fee (₹)</label>
            <input value={fees} onChange={(e) => setFees(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Follow-up Fee (₹)</label>
            <input value={followUpFees} onChange={(e) => setFollowUpFees(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Working Hours</label>
          <input value={timings} onChange={(e) => setTimings(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-medium text-sm"
      >
        <Save className="w-4 h-4 neon-text-cyan" />
        <span className="neon-text-cyan">{saved ? "Saved ✓" : "Save Settings"}</span>
      </button>
    </div>
  );
}
