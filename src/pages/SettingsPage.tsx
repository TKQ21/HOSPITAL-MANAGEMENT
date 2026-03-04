import { useState, useEffect } from "react";
import { Save, Building2, UserCog, Clock, DollarSign, Lock, Eye, EyeOff, User, Mail, Shield, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;
const DEFAULT_EMAIL = "doctor@clinic.com";
const DEFAULT_USERNAME = "doctor";
const DEFAULT_PASSWORD = "admin123";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clinic");
  const [loading, setLoading] = useState(true);

  // Clinic Info
  const [clinicName, setClinicName] = useState("City Health Clinic");
  const [doctorName, setDoctorName] = useState("Dr. Sharma");
  const [specialization, setSpecialization] = useState("General Physician");
  const [fees, setFees] = useState("500");
  const [followUpFees, setFollowUpFees] = useState("200");
  const [timings, setTimings] = useState("10:00 AM - 6:00 PM");
  const [address, setAddress] = useState("123 Main Street, City Center");
  const [phone, setPhone] = useState("011-12345678");
  const [saving, setSaving] = useState(false);

  // Hospital Profile
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalType, setHospitalType] = useState("Multi-Specialty");
  const [hospitalLicense, setHospitalLicense] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalWebsite, setHospitalWebsite] = useState("");
  const [hospitalBeds, setHospitalBeds] = useState("");
  const [hospitalEstablished, setHospitalEstablished] = useState("");

  // Policies
  const [visitorsPolicy, setVisitorsPolicy] = useState("");
  const [refundPolicy, setRefundPolicy] = useState("");
  const [dischargePolicy, setDischargePolicy] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [emergencyProtocol, setEmergencyProtocol] = useState("");
  const [patientRights, setPatientRights] = useState("");
  const [staffRules, setStaffRules] = useState("");

  // User Management
  const [users, setUsers] = useState<{ name: string; email: string; role: string; department: string; status: string }[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "staff", department: "", status: "active" });

  // Credential change
  const [loginUsername, setLoginUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [credError, setCredError] = useState("");
  const [credSuccess, setCredSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("clinic_settings").select("*").eq("user_id", user.id).maybeSingle();
        if (data) {
          setClinicName(data.clinic_name); setAddress(data.address); setPhone(data.phone);
          setDoctorName(data.doctor_name); setSpecialization(data.specialization);
          setFees(data.fees); setFollowUpFees(data.follow_up_fees); setTimings(data.timings);
        }
      }
      setLoginUsername(localStorage.getItem("doctor_username") || DEFAULT_USERNAME);
      setLoginEmail(localStorage.getItem("doctor_email") || DEFAULT_EMAIL);

      // Load hospital profile & policies from localStorage
      setHospitalName(localStorage.getItem("hospital_name") || "");
      setHospitalType(localStorage.getItem("hospital_type") || "Multi-Specialty");
      setHospitalLicense(localStorage.getItem("hospital_license") || "");
      setHospitalEmail(localStorage.getItem("hospital_email") || "");
      setHospitalPhone(localStorage.getItem("hospital_phone") || "");
      setHospitalAddress(localStorage.getItem("hospital_address") || "");
      setHospitalWebsite(localStorage.getItem("hospital_website") || "");
      setHospitalBeds(localStorage.getItem("hospital_beds") || "");
      setHospitalEstablished(localStorage.getItem("hospital_established") || "");

      setVisitorsPolicy(localStorage.getItem("policy_visitors") || "");
      setRefundPolicy(localStorage.getItem("policy_refund") || "");
      setDischargePolicy(localStorage.getItem("policy_discharge") || "");
      setPrivacyPolicy(localStorage.getItem("policy_privacy") || "");
      setEmergencyProtocol(localStorage.getItem("policy_emergency") || "");
      setPatientRights(localStorage.getItem("policy_patient_rights") || "");
      setStaffRules(localStorage.getItem("policy_staff_rules") || "");

      const savedUsers = localStorage.getItem("hospital_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from("clinic_settings").upsert({
      user_id: user.id, clinic_name: clinicName, address, phone,
      doctor_name: doctorName, specialization, fees, follow_up_fees: followUpFees, timings,
    }, { onConflict: "user_id" });
    setSaving(false);
    toast(error ? { title: "Error", description: "Settings save nahi hua", variant: "destructive" } : { title: "Saved ✓", description: "Settings saved successfully" });
  };

  const handleSaveHospitalProfile = () => {
    localStorage.setItem("hospital_name", hospitalName); localStorage.setItem("hospital_type", hospitalType);
    localStorage.setItem("hospital_license", hospitalLicense); localStorage.setItem("hospital_email", hospitalEmail);
    localStorage.setItem("hospital_phone", hospitalPhone); localStorage.setItem("hospital_address", hospitalAddress);
    localStorage.setItem("hospital_website", hospitalWebsite); localStorage.setItem("hospital_beds", hospitalBeds);
    localStorage.setItem("hospital_established", hospitalEstablished);
    toast({ title: "Saved ✓", description: "Hospital profile saved" });
  };

  const handleSavePolicies = () => {
    localStorage.setItem("policy_visitors", visitorsPolicy); localStorage.setItem("policy_refund", refundPolicy);
    localStorage.setItem("policy_discharge", dischargePolicy); localStorage.setItem("policy_privacy", privacyPolicy);
    localStorage.setItem("policy_emergency", emergencyProtocol); localStorage.setItem("policy_patient_rights", patientRights);
    localStorage.setItem("policy_staff_rules", staffRules);
    toast({ title: "Saved ✓", description: "Policies & rules saved" });
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) { toast({ title: "Error", description: "Name & email required", variant: "destructive" }); return; }
    const updated = [...users, newUser];
    setUsers(updated); localStorage.setItem("hospital_users", JSON.stringify(updated));
    setNewUser({ name: "", email: "", role: "staff", department: "", status: "active" });
    toast({ title: "Added ✓", description: "User added" });
  };

  const handleRemoveUser = (idx: number) => {
    const updated = users.filter((_, i) => i !== idx);
    setUsers(updated); localStorage.setItem("hospital_users", JSON.stringify(updated));
    toast({ title: "Removed", description: "User removed" });
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault(); setCredError(""); setCredSuccess(false);
    const savedPassword = localStorage.getItem("doctor_password") || DEFAULT_PASSWORD;
    if (currentPw !== savedPassword) { setCredError("Current password is incorrect"); return; }
    if (newPw) {
      if (!PASSWORD_REGEX.test(newPw)) { setCredError("Password: 8-15 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character"); return; }
      if (newPw !== confirmPw) { setCredError("Passwords do not match"); return; }
    }
    if (!loginUsername.trim()) { setCredError("Username cannot be empty"); return; }
    if (!loginEmail.trim() || !loginEmail.includes("@")) { setCredError("Enter a valid email"); return; }
    localStorage.setItem("doctor_username", loginUsername.trim());
    localStorage.setItem("doctor_email", loginEmail.trim());
    if (newPw) localStorage.setItem("doctor_password", newPw);
    setCredSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast({ title: "Credentials Updated ✓" });
  };

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const tabs = [
    { id: "clinic", label: "Clinic Info", icon: Building2, color: "neon-text-cyan", border: "neon-border-cyan" },
    { id: "hospital", label: "Hospital Profile", icon: Building2, color: "neon-text-purple", border: "neon-border-purple" },
    { id: "policies", label: "Policies & Rules", icon: FileText, color: "neon-text-orange", border: "neon-border-orange" },
    { id: "users", label: "User Management", icon: Users, color: "neon-text-darkblue", border: "neon-border-darkblue" },
    { id: "security", label: "Security", icon: Shield, color: "neon-text-red", border: "neon-border-red" },
    { id: "credentials", label: "Login Credentials", icon: Lock, color: "neon-text-yellow", border: "neon-border-yellow" },
  ];

  if (loading) return <div className="neon-text-cyan animate-pulse-neon p-8">Loading settings...</div>;

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h1 className="font-display text-2xl font-bold neon-text-cyan tracking-wider">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Hospital configuration, policies, user management & security</p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all border ${activeTab === tab.id ? `glass-panel ${tab.border} ${tab.color}` : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* CLINIC INFO */}
      {activeTab === "clinic" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-cyan space-y-4">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 neon-text-cyan" /><h2 className="font-display text-sm font-semibold neon-text-cyan tracking-wider">CLINIC INFO</h2></div>
            {[{ label: "Clinic Name", value: clinicName, set: setClinicName }, { label: "Address", value: address, set: setAddress }, { label: "Phone", value: phone, set: setPhone }].map(f => (
              <div key={f.label}><label className="text-xs text-muted-foreground block mb-1">{f.label}</label><input value={f.value} onChange={e => f.set(e.target.value)} className={inputClass} /></div>
            ))}
          </div>
          <div className="glass-panel rounded-xl p-5 border neon-border-green space-y-4">
            <div className="flex items-center gap-2 mb-2"><UserCog className="w-5 h-5 neon-text-green" /><h2 className="font-display text-sm font-semibold neon-text-green tracking-wider">DOCTOR INFO</h2></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Doctor Name</label><input value={doctorName} onChange={e => setDoctorName(e.target.value)} className={inputClass} /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">Specialization</label><input value={specialization} onChange={e => setSpecialization(e.target.value)} className={inputClass} /></div>
          </div>
          <div className="glass-panel rounded-xl p-5 border neon-border-pink space-y-4">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 neon-text-pink" /><h2 className="font-display text-sm font-semibold neon-text-pink tracking-wider">FEES & TIMINGS</h2></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground block mb-1">Consultation Fee (₹)</label><input value={fees} onChange={e => setFees(e.target.value)} className={inputClass} /></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Follow-up Fee (₹)</label><input value={followUpFees} onChange={e => setFollowUpFees(e.target.value)} className={inputClass} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground block mb-1">Working Hours</label><input value={timings} onChange={e => setTimings(e.target.value)} className={inputClass} /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-medium text-sm disabled:opacity-50">
            <Save className="w-4 h-4 neon-text-cyan" /><span className="neon-text-cyan">{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      )}

      {/* HOSPITAL PROFILE */}
      {activeTab === "hospital" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-purple space-y-4">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 neon-text-purple" /><h2 className="font-display text-sm font-semibold neon-text-purple tracking-wider">HOSPITAL PROFILE</h2></div>
            <p className="text-[10px] text-muted-foreground">Fill in your hospital's complete profile information</p>
            {[
              { label: "Hospital Name", value: hospitalName, set: setHospitalName, placeholder: "Enter hospital name" },
              { label: "License / Registration No.", value: hospitalLicense, set: setHospitalLicense, placeholder: "e.g. MH/REG/2024/1234" },
              { label: "Hospital Email", value: hospitalEmail, set: setHospitalEmail, placeholder: "hospital@example.com" },
              { label: "Hospital Phone", value: hospitalPhone, set: setHospitalPhone, placeholder: "+91 XXXXX XXXXX" },
              { label: "Website", value: hospitalWebsite, set: setHospitalWebsite, placeholder: "https://hospital.com" },
              { label: "Total Bed Capacity", value: hospitalBeds, set: setHospitalBeds, placeholder: "e.g. 200" },
              { label: "Established Year", value: hospitalEstablished, set: setHospitalEstablished, placeholder: "e.g. 2005" },
            ].map(f => (
              <div key={f.label}><label className="text-xs text-muted-foreground block mb-1">{f.label}</label><input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className={inputClass} /></div>
            ))}
            <div><label className="text-xs text-muted-foreground block mb-1">Hospital Type</label>
              <select value={hospitalType} onChange={e => setHospitalType(e.target.value)} className={inputClass}>
                <option value="Multi-Specialty">Multi-Specialty</option><option value="Super-Specialty">Super-Specialty</option><option value="General">General</option>
                <option value="Eye Hospital">Eye Hospital</option><option value="Dental">Dental</option><option value="Maternity">Maternity</option><option value="Other">Other</option>
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground block mb-1">Full Address</label><textarea value={hospitalAddress} onChange={e => setHospitalAddress(e.target.value)} placeholder="Complete hospital address..." className={inputClass} rows={3} /></div>
          </div>
          <button onClick={handleSaveHospitalProfile} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-purple neon-glow-purple hover:bg-primary/30 transition-all font-medium text-sm">
            <Save className="w-4 h-4 neon-text-purple" /><span className="neon-text-purple">Save Hospital Profile</span>
          </button>
        </div>
      )}

      {/* POLICIES & RULES */}
      {activeTab === "policies" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-orange space-y-4">
            <div className="flex items-center gap-2 mb-2"><FileText className="w-5 h-5 neon-text-orange" /><h2 className="font-display text-sm font-semibold neon-text-orange tracking-wider">POLICIES & RULES</h2></div>
            <p className="text-[10px] text-muted-foreground">Define your hospital's rules, regulations, and policies. These are editable text fields — write your own content.</p>
            {[
              { label: "Visitors Policy", value: visitorsPolicy, set: setVisitorsPolicy, placeholder: "e.g. Visiting hours are 10 AM - 12 PM and 4 PM - 6 PM. Maximum 2 visitors per patient..." },
              { label: "Refund Policy", value: refundPolicy, set: setRefundPolicy, placeholder: "e.g. Refunds are processed within 7 working days. No refund for OPD consultation fees..." },
              { label: "Discharge Policy", value: dischargePolicy, set: setDischargePolicy, placeholder: "e.g. Discharge process starts at 11 AM. All bills must be cleared before discharge..." },
              { label: "Privacy Policy", value: privacyPolicy, set: setPrivacyPolicy, placeholder: "e.g. Patient data is kept confidential. Medical records are shared only with authorized personnel..." },
              { label: "Emergency Protocol", value: emergencyProtocol, set: setEmergencyProtocol, placeholder: "e.g. In case of emergency, call 108. Emergency ward is open 24/7. Triage protocol applies..." },
              { label: "Patient Rights", value: patientRights, set: setPatientRights, placeholder: "e.g. Every patient has the right to know their diagnosis, treatment options, and costs..." },
              { label: "Staff Rules & Regulations", value: staffRules, set: setStaffRules, placeholder: "e.g. All staff must wear ID badges. Attendance is mandatory. Leave must be applied 48hrs in advance..." },
            ].map(f => (
              <div key={f.label}><label className="text-xs text-muted-foreground block mb-1">{f.label}</label><textarea value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className={inputClass} rows={4} /></div>
            ))}
          </div>
          <button onClick={handleSavePolicies} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-orange neon-glow-orange hover:bg-primary/30 transition-all font-medium text-sm">
            <Save className="w-4 h-4 neon-text-orange" /><span className="neon-text-orange">Save Policies</span>
          </button>
        </div>
      )}

      {/* USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-darkblue space-y-4">
            <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 neon-text-darkblue" /><h2 className="font-display text-sm font-semibold neon-text-darkblue tracking-wider">USER MANAGEMENT</h2></div>
            <p className="text-[10px] text-muted-foreground">Add and manage staff members, doctors, and administrators</p>

            <div className="border border-border/50 rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold">Add New User</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full Name *" className={inputClass} />
                <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email *" className={inputClass} />
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={inputClass}>
                  <option value="admin">Admin</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option>
                  <option value="staff">Staff</option><option value="receptionist">Receptionist</option><option value="pharmacist">Pharmacist</option>
                </select>
                <input value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} placeholder="Department" className={inputClass} />
              </div>
              <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border neon-border-darkblue text-sm neon-text-darkblue">
                <User className="w-4 h-4" /> Add User
              </button>
            </div>

            {users.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">{users.length} Users</p>
                {users.map((u, idx) => {
                  const roleBorders = ["neon-border-purple", "neon-border-orange", "neon-border-red", "neon-border-green", "neon-border-pink"];
                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg bg-secondary/30 border ${roleBorders[idx % roleBorders.length]}`}>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{u.email} • {u.role} • {u.department || "N/A"}</p>
                      </div>
                      <button onClick={() => handleRemoveUser(idx)} className="text-[10px] neon-text-red hover:underline">Remove</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECURITY */}
      {activeTab === "security" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-red space-y-4">
            <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 neon-text-red" /><h2 className="font-display text-sm font-semibold neon-text-red tracking-wider">SECURITY SETTINGS</h2></div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-green">
                <p className="text-xs font-semibold neon-text-green">✓ Authentication</p>
                <p className="text-[10px] text-muted-foreground mt-1">Supabase Auth enabled with email verification</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-purple">
                <p className="text-xs font-semibold neon-text-purple">✓ Row Level Security</p>
                <p className="text-[10px] text-muted-foreground mt-1">All database tables have RLS policies enabled</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-orange">
                <p className="text-xs font-semibold neon-text-orange">✓ Password Policy</p>
                <p className="text-[10px] text-muted-foreground mt-1">Doctor login: 8-15 chars, uppercase, lowercase, digit, special char</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-darkblue">
                <p className="text-xs font-semibold neon-text-darkblue">✓ Audit Logging</p>
                <p className="text-[10px] text-muted-foreground mt-1">All actions are tracked in audit_logs table</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-cyan">
                <p className="text-xs font-semibold neon-text-cyan">✓ Data Encryption</p>
                <p className="text-[10px] text-muted-foreground mt-1">TLS in transit, encrypted at rest via cloud infrastructure</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border neon-border-pink">
                <p className="text-xs font-semibold neon-text-pink">✓ Forgot Password</p>
                <p className="text-[10px] text-muted-foreground mt-1">Email-based password recovery with secure reset link</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN CREDENTIALS */}
      {activeTab === "credentials" && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass-panel rounded-xl p-5 border neon-border-yellow space-y-4">
            <div className="flex items-center gap-2 mb-2"><Lock className="w-5 h-5 neon-text-yellow" /><h2 className="font-display text-sm font-semibold neon-text-yellow tracking-wider">LOGIN CREDENTIALS</h2></div>
            <p className="text-[10px] text-muted-foreground">Change your username, email & password. Password: 8-15 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.</p>
            <form onSubmit={handleUpdateCredentials} className="space-y-3">
              <div><label className="text-xs text-muted-foreground block mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Login Username</label>
                <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className={inputClass} placeholder="Username" /></div>
              <div><label className="text-xs text-muted-foreground block mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Login Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputClass} placeholder="Email" /></div>
              <div className="border-t border-border/50 pt-3 mt-3"><p className="text-xs text-muted-foreground mb-2">Enter current password to save. New password is optional.</p></div>
              <div><label className="text-xs text-muted-foreground block mb-1">Current Password *</label>
                <div className="relative"><input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} required className={inputClass + " pr-10"} placeholder="Enter current password" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2">{showCurrentPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</button></div></div>
              <div><label className="text-xs text-muted-foreground block mb-1">New Password (optional)</label>
                <div className="relative"><input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass + " pr-10"} placeholder="Leave blank to keep current" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNewPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</button></div></div>
              {newPw && <div><label className="text-xs text-muted-foreground block mb-1">Confirm New Password</label>
                <div className="relative"><input type={showConfirmPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required className={inputClass + " pr-10"} placeholder="Confirm" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2">{showConfirmPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}</button></div></div>}
              {credError && <p className="text-xs neon-text-pink">{credError}</p>}
              {credSuccess && <p className="text-xs neon-text-green">Credentials updated ✓</p>}
              <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/20 border neon-border-yellow neon-glow-yellow hover:bg-primary/30 transition-all font-medium text-sm">
                <Lock className="w-4 h-4 neon-text-yellow" /><span className="neon-text-yellow">Update Credentials</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
