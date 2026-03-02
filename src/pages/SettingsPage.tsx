import { useState, useEffect } from "react";
import { Save, Building2, UserCog, Clock, DollarSign, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;

export default function SettingsPage() {
  const { toast } = useToast();
  const [clinicName, setClinicName] = useState("City Health Clinic");
  const [doctorName, setDoctorName] = useState("Dr. Sharma");
  const [specialization, setSpecialization] = useState("General Physician");
  const [fees, setFees] = useState("500");
  const [followUpFees, setFollowUpFees] = useState("200");
  const [timings, setTimings] = useState("10:00 AM - 6:00 PM");
  const [address, setAddress] = useState("123 Main Street, City Center");
  const [phone, setPhone] = useState("011-12345678");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Load settings from DB
  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clinic_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setClinicName(data.clinic_name);
        setAddress(data.address);
        setPhone(data.phone);
        setDoctorName(data.doctor_name);
        setSpecialization(data.specialization);
        setFees(data.fees);
        setFollowUpFees(data.follow_up_fees);
        setTimings(data.timings);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const settingsData = {
      user_id: user.id,
      clinic_name: clinicName,
      address,
      phone,
      doctor_name: doctorName,
      specialization,
      fees,
      follow_up_fees: followUpFees,
      timings,
    };

    const { error } = await supabase
      .from("clinic_settings")
      .upsert(settingsData, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Settings save nahi hua", variant: "destructive" });
    } else {
      toast({ title: "Saved ✓", description: "Settings successfully save ho gaye" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!PASSWORD_REGEX.test(newPw)) {
      setPwError("Password must be 8-15 characters with at least 1 uppercase, 1 lowercase, 1 digit & 1 special character");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }

    setChangingPw(true);

    // Verify current password by re-signing in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setChangingPw(false); setPwError("User not found"); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    });
    if (signInError) {
      setChangingPw(false);
      setPwError("Current password is incorrect");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setChangingPw(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast({ title: "Password Updated ✓", description: "Password successfully change ho gaya" });
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  if (loading) return <div className="neon-text-cyan animate-pulse-neon p-8">Loading settings...</div>;

  return (
    <div className="space-y-6 animate-slide-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-cyan tracking-wider">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Clinic configuration & account</p>
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
            <input value={field.value} onChange={(e) => field.set(e.target.value)} className={inputClass} />
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
          <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Specialization</label>
          <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputClass} />
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
            <input value={fees} onChange={(e) => setFees(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Follow-up Fee (₹)</label>
            <input value={followUpFees} onChange={(e) => setFollowUpFees(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Working Hours</label>
          <input value={timings} onChange={(e) => setTimings(e.target.value)} className={inputClass} />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-medium text-sm disabled:opacity-50"
      >
        <Save className="w-4 h-4 neon-text-cyan" />
        <span className="neon-text-cyan">{saving ? "Saving..." : "Save Settings"}</span>
      </button>

      {/* Change Password */}
      <div className="glass-panel rounded-xl p-5 border neon-border-yellow space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 neon-text-yellow" />
          <h2 className="font-display text-sm font-semibold neon-text-yellow tracking-wider">CHANGE PASSWORD</h2>
        </div>
        <p className="text-[10px] text-muted-foreground">8-15 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character</p>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Current Password</label>
            <div className="relative">
              <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className={inputClass + " pr-10"} />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showCurrentPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">New Password</label>
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} required className={inputClass + " pr-10"} />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showNewPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Confirm New Password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputClass} />
          </div>
          {pwError && <p className="text-xs neon-text-pink">{pwError}</p>}
          {pwSuccess && <p className="text-xs neon-text-green">Password updated successfully ✓</p>}
          <button
            type="submit"
            disabled={changingPw}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-yellow neon-glow-yellow hover:bg-primary/30 transition-all font-medium text-sm disabled:opacity-50"
          >
            <Lock className="w-4 h-4 neon-text-yellow" />
            <span className="neon-text-yellow">{changingPw ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
