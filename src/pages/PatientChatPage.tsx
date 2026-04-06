import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Activity, Moon, Sun, LogOut, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number | string;
  text: string;
  sender: "patient" | "ai";
  timestamp: string;
  createdAt?: string;
  kind?: "chat" | "notification";
}

interface CollectionState {
  step: "idle" | "name" | "phone" | "reason" | "date" | "time" | "confirm";
  data: {
    name?: string;
    phone?: string;
    reason?: string;
    date?: string;
    time?: string;
  };
}

const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatMessageTime = (value: string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Validation helpers
function isValidPhone(val: string): boolean {
  const digits = val.replace(/\D/g, "");
  return digits.length === 10;
}

function parseNaturalDate(val: string): string | null {
  const lower = val.toLowerCase().trim();
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  // Hindi/English natural language
  if (lower === "aaj" || lower === "today") return fmt(today);
  if (lower === "kal" || lower === "tomorrow" || lower === "tmrw" || lower === "tmr") {
    const d = new Date(today); d.setDate(d.getDate() + 1); return fmt(d);
  }
  if (lower === "parso" || lower === "day after tomorrow") {
    const d = new Date(today); d.setDate(d.getDate() + 2); return fmt(d);
  }

  // Day names
  const dayMap: Record<string, number> = {
    sunday: 0, somvar: 1, monday: 1, mangalvar: 2, tuesday: 2,
    budhvar: 3, wednesday: 3, guruvar: 4, thursday: 4,
    shukravar: 5, friday: 5, shanivar: 6, saturday: 6,
  };
  for (const [name, dayNum] of Object.entries(dayMap)) {
    if (lower.includes(name)) {
      const d = new Date(today);
      const diff = (dayNum - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return fmt(d);
    }
  }

  // Date patterns
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (datePattern.test(lower)) return lower;
  
  const ddmmyyyy = lower.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;

  // Try JS parse
  const d = new Date(val);
  if (!isNaN(d.getTime())) return fmt(d);

  return null;
}

function isValidDate(val: string): boolean {
  return parseNaturalDate(val) !== null;
}

function isValidTime(val: string): boolean {
  // Accept: 10:00 AM, 3:30 PM, 10:00, 15:30, etc
  const timePattern = /^\d{1,2}:\d{2}\s*(am|pm)?$/i;
  if (timePattern.test(val.trim())) return true;
  // Natural
  const natural = ["subah", "dopahar", "sham", "morning", "afternoon", "evening"];
  return natural.some(n => val.toLowerCase().includes(n));
}

export default function PatientChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [collection, setCollection] = useState<CollectionState>({ step: "idle", data: {} });
  const [dark, setDark] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [hospitalName, setHospitalName] = useState("MEDI ASSIST");
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [policies, setPolicies] = useState<any>({});
  const [chatLoaded, setChatLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const buildNotificationMessage = (notification: any): Message => ({
    id: `notification-${notification.id}`,
    text: `📩 ${notification.message}`,
    sender: "ai",
    timestamp: formatMessageTime(notification.created_at),
    createdAt: notification.created_at,
    kind: "notification",
  });

  // Save a message to the database
  const saveMessageToDB = async (text: string, sender: "patient" | "ai", uid?: string) => {
    const id = uid || userId;
    if (!id) return;
    await (supabase.from as any)('chat_messages').insert({
      user_id: id,
      text,
      sender,
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get user and show initial message
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);

        // Load clinic settings from DB
        const { data: settings } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();
        
        if (settings) {
          setClinicSettings(settings);
          if (settings.clinic_name) setHospitalName(settings.clinic_name);
        }

        // Load hospital profile & policies from localStorage
        const savedProfile = localStorage.getItem("hospital_profile");
        const savedPolicies = localStorage.getItem("hospital_policies");
        const profileData = savedProfile ? JSON.parse(savedProfile) : {};
        const policyData = savedPolicies ? JSON.parse(savedPolicies) : {};
        
        if (profileData.hospitalName) setHospitalName(profileData.hospitalName);
        setPolicies({ ...profileData, ...policyData });

        const displayName = profileData.hospitalName || settings?.clinic_name || "MEDI ASSIST";

        const [{ data: chatHistory }, { data: notificationHistory }] = await Promise.all([
          (supabase.from as any)('chat_messages')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: true }),
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: true }),
        ]);

        const notificationTexts = new Set((notificationHistory || []).map((n: any) => `📩 ${n.message}`));
        const loadedMessages: Message[] = [
          ...((chatHistory || []) as any[])
            .filter((m: any) => !(m.sender === "ai" && typeof m.text === "string" && m.text.startsWith("📩") && notificationTexts.has(m.text)))
            .map((m: any, idx: number) => ({
              id: m.id || `chat-${idx + 1}`,
              text: m.text,
              sender: m.sender as "patient" | "ai",
              timestamp: formatMessageTime(m.created_at),
              createdAt: m.created_at,
              kind: "chat" as const,
            })),
          ...((notificationHistory || []) as any[]).map(buildNotificationMessage),
        ].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          // First time - show welcome message
          const welcomeText = `Hello! 👋 Main ${displayName} ka AI assistant hoon. Aapki kya help kar sakta hoon?\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Location / address\n5. Hospital policies & rules\n6. Hospital ke baare mein jaankari`;
          setMessages([{
            id: 1,
            text: welcomeText,
            sender: "ai",
            timestamp: timeNow(),
          }]);
          saveMessageToDB(welcomeText, "ai", uid);
        }

        // Check for permission requests approved/denied while offline
        const { data: permRequests } = await supabase
          .from('permission_requests')
          .select('*')
          .eq('user_id', uid)
          .in('status', ['approved', 'denied'])
          .order('updated_at', { ascending: true });

        if (permRequests && permRequests.length > 0) {
          // Check which permission responses are already in chat history
          const existingPermIds = new Set(
            (loadedMessages || [])
              .filter(m => typeof m.id === 'string' && (m.id as string).startsWith('perm-'))
              .map(m => (m.id as string).replace('perm-', ''))
          );

          for (const req of permRequests) {
            if (existingPermIds.has(req.id)) continue;
            // Also check if response text already exists in chat
            const alreadySaved = (chatHistory || []).some((m: any) => 
              m.sender === 'ai' && (
                (req.status === 'approved' && m.text.includes('Doctor ne permission de di hai')) ||
                (req.status === 'denied' && m.text.includes('doctor ne is information ko share karne ki permission nahi di hai'))
              ) && new Date(m.created_at).getTime() >= new Date(req.updated_at).getTime() - 60000
            );
            if (alreadySaved) continue;

            let responseText = '';
            if (req.status === 'approved') {
              const savedPolicies = localStorage.getItem("hospital_policies");
              const savedProfile = localStorage.getItem("hospital_profile");
              const pol = { ...(savedProfile ? JSON.parse(savedProfile) : {}), ...(savedPolicies ? JSON.parse(savedPolicies) : {}) };
              const parts: string[] = [];
              if (pol.visitorPolicy) parts.push(`👥 Visitor Policy: ${pol.visitorPolicy}`);
              if (pol.refundPolicy) parts.push(`💰 Refund Policy: ${pol.refundPolicy}`);
              if (pol.emergencyProtocol) parts.push(`🚨 Emergency Protocol: ${pol.emergencyProtocol}`);
              if (pol.admissionPolicy) parts.push(`🏥 Admission Policy: ${pol.admissionPolicy}`);
              if (pol.dischargePolicy) parts.push(`📋 Discharge Policy: ${pol.dischargePolicy}`);
              if (pol.patientRights) parts.push(`⚖️ Patient Rights: ${pol.patientRights}`);
              if (parts.length === 0) parts.push("Abhi hospital ne koi specific policies set nahi ki hain. Doctor se directly poochiye.");
              responseText = `✅ Doctor ne permission de di hai! Aap is baare mein pooch sakte hain.\n\nYeh rahi hospital ki policies aur information:\n\n${parts.join("\n\n")}`;
            } else {
              responseText = "❌ Sorry, doctor ne is information ko share karne ki permission nahi di hai. Agar aapko koi aur jaankari chahiye toh zaroor poochiye! 🙏";
            }

            const permMsg: Message = {
              id: `perm-${req.id}`,
              text: responseText,
              sender: "ai",
              timestamp: formatMessageTime(req.updated_at),
              createdAt: req.updated_at,
            };
            setMessages(prev => prev.some(m => m.id === permMsg.id) ? prev : [...prev, permMsg]);
            await saveMessageToDB(responseText, "ai", uid);
          }
        }

        await supabase.from('notifications').update({ is_read: true }).eq('user_id', uid).eq('is_read', false);
        setChatLoaded(true);
      }
    });
  }, []);

  // Listen for reschedule notifications via realtime
  useEffect(() => {
    if (!userId || !chatLoaded) return;
    
    const channel = supabase
      .channel('patient-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as any;
        const notifMessage = buildNotificationMessage(n);
        setMessages(prev => prev.some(msg => msg.id === notifMessage.id) ? prev : [...prev, notifMessage]);
        supabase.from('notifications').update({ is_read: true }).eq('id', n.id).then();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, chatLoaded]);

  const downloadMessagePDF = (msg: Message) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Notification Receipt</title><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#222}
      .header{text-align:center;border-bottom:2px solid #00b4d8;padding-bottom:16px;margin-bottom:24px}
      .header h1{color:#00b4d8;margin:0;font-size:22px}
      .content{background:#f8f9fa;border-radius:8px;padding:20px;white-space:pre-line;font-size:14px;line-height:1.6}
      .footer{text-align:center;margin-top:32px;color:#888;font-size:11px}
    </style></head><body>
      <div class="header"><h1>🏥 ${hospitalName}</h1><p>Notification Receipt</p></div>
      <div class="content">${msg.text}</div>
      <p style="margin-top:16px;font-size:12px;color:#666">Time: ${msg.timestamp} | Date: ${msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
      <div class="footer">© 2026 Mohd Kaif • Built with AI assistance</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const addAIMessage = (text: string) => {
    const aiMsg: Message = {
      id: Date.now() + 1,
      text,
      sender: "ai",
      timestamp: timeNow(),
    };
    setTimeout(() => {
      setMessages(prev => [...prev, aiMsg]);
      saveMessageToDB(text, "ai");
    }, 600);
  };

  const saveAppointment = async (data: CollectionState["data"]) => {
    // Save to database
    const { error } = await supabase.from('appointments').insert({
      user_id: userId,
      patient_name: data.name!,
      phone: data.phone!,
      reason: data.reason!,
      appointment_date: data.date!,
      appointment_time: data.time!,
    });

    if (error) {
      console.error("Error saving appointment:", error);
      return;
    }

    // Check if patient exists, if not create
    const { data: existing } = await supabase.from('patients').select('id').eq('phone', data.phone!).eq('user_id', userId).maybeSingle();
    if (!existing) {
      await supabase.from('patients').insert({
        user_id: userId,
        name: data.name!,
        phone: data.phone!,
        notes: data.reason,
      });
    }
  };

  const getAIReply = async (text: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('hospital-chat', {
        body: {
          message: text,
          clinicSettings: clinicSettings || {},
          policies: policies || {},
          hospitalName,
        },
      });
      if (error) throw error;
      return data?.reply || "Sorry, kuch problem ho gayi. Please dubara try karein.";
    } catch {
      return "Sorry, abhi response nahi aa raha. Please call karein: 011-1234-5678";
    }
  };

  // Permission request flow
  const createPermissionRequest = async (question: string, topic: string) => {
    if (!userId) return;
    // Get user display name
    const { data: { session } } = await supabase.auth.getSession();
    const patientName = session?.user?.email || "Patient";
    
    await supabase.from('permission_requests' as any).insert({
      user_id: userId,
      patient_name: patientName,
      question,
      request_type: topic,
      status: 'pending',
    } as any);
  };

  // Listen for permission request updates
  useEffect(() => {
    if (!userId || !chatLoaded) return;
    const channel = supabase
      .channel('patient-permissions')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'permission_requests',
      }, (payload) => {
        const req = payload.new as any;
        if (req.user_id !== userId) return;
        if (req.status === 'approved') {
          const approvedMsg = `✅ Doctor ne permission de di hai! Aap is baare mein pooch sakte hain.\n\nYeh rahi hospital ki policies aur information:\n\n${buildPoliciesInfo()}`;
          const msg: Message = { id: `perm-${req.id}`, text: approvedMsg, sender: "ai", timestamp: timeNow() };
          setMessages(prev => [...prev, msg]);
          saveMessageToDB(approvedMsg, "ai");
        } else if (req.status === 'denied') {
          const deniedMsg = "❌ Sorry, doctor ne is information ko share karne ki permission nahi di hai. Agar aapko koi aur jaankari chahiye toh zaroor poochiye! 🙏";
          const msg: Message = { id: `perm-${req.id}`, text: deniedMsg, sender: "ai", timestamp: timeNow() };
          setMessages(prev => [...prev, msg]);
          saveMessageToDB(deniedMsg, "ai");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, chatLoaded, policies]);

  const buildPoliciesInfo = () => {
    const parts: string[] = [];
    if (policies.visitorPolicy) parts.push(`👥 Visitor Policy: ${policies.visitorPolicy}`);
    if (policies.refundPolicy) parts.push(`💰 Refund Policy: ${policies.refundPolicy}`);
    if (policies.emergencyProtocol) parts.push(`🚨 Emergency Protocol: ${policies.emergencyProtocol}`);
    if (policies.admissionPolicy) parts.push(`🏥 Admission Policy: ${policies.admissionPolicy}`);
    if (policies.dischargePolicy) parts.push(`📋 Discharge Policy: ${policies.dischargePolicy}`);
    if (policies.patientRights) parts.push(`⚖️ Patient Rights: ${policies.patientRights}`);
    if (parts.length === 0) parts.push("Abhi hospital ne koi specific policies set nahi ki hain. Doctor se directly poochiye.");
    return parts.join("\n\n");
  };

  const addAIMessageAsync = async (text: string) => {
    // Show typing indicator
    const typingId = Date.now() + 99;
    const typingMsg: Message = { id: typingId, text: "⏳ Typing...", sender: "ai", timestamp: timeNow() };
    setMessages(prev => [...prev, typingMsg]);

    const reply = await getAIReply(text);

    // Check if AI wants to trigger appointment booking or permission request
    try {
      const parsed = JSON.parse(reply);
      if (parsed.action === "book_appointment") {
        setMessages(prev => prev.filter(m => m.id !== typingId));
        setCollection({ step: "name", data: {} });
        addAIMessage("Zaroor! Appointment ke liye kuch details chahiye.\n\nSabse pehle, aapka poora naam bataiye:");
        return;
      }
      if (parsed.action === "request_permission") {
        setMessages(prev => prev.filter(m => m.id !== typingId));
        await createPermissionRequest(text, parsed.topic || "policies");
        addAIMessage("🔒 Yeh sensitive information hai. Doctor se permission li ja rahi hai...\n\n⏳ Please thoda wait karein, jaise hi doctor approve karenge, aapko yahan information mil jayegi.");
        return;
      }
    } catch {
      // Not JSON, use as regular reply
    }

    setMessages(prev => prev.map(m => m.id === typingId ? { ...m, id: Date.now() + 1, text: reply } : m));
    saveMessageToDB(reply, "ai");
  };

  const processInput = (text: string) => {
    const lower = text.toLowerCase().trim();

    if (collection.step !== "idle") {
      const newData = { ...collection.data };

      switch (collection.step) {
        case "name":
          if (/^\d+$/.test(text.trim())) {
            addAIMessage("❌ Invalid name! Sirf apna naam likhein, numbers nahi. Please dubara enter karein:");
            return;
          }
          newData.name = text.trim();
          setCollection({ step: "phone", data: newData });
          addAIMessage(`Shukriya ${newData.name}! 📱\n\nAb aapka mobile number bataiye (sirf 10 digit):`);
          return;
        case "phone":
          if (!isValidPhone(text)) {
            addAIMessage("❌ Invalid mobile number! Sirf 10 digit ka number enter karein (jaise: 9876543210). Koi text ya extra digit nahi:");
            return;
          }
          newData.phone = text.replace(/\D/g, "").slice(-10);
          setCollection({ step: "reason", data: newData });
          addAIMessage("Aap kis problem / bimari ke liye doctor se milna chahte hain?\n\nFor example: Bukhar, Pet dard, Follow-up, Report dikhana, General check-up, etc.");
          return;
        case "reason":
          if (/^\d+$/.test(text.trim())) {
            addAIMessage("❌ Invalid reason! Apni problem ya bimari ka naam likhein. Numbers nahi:");
            return;
          }
          newData.reason = text.trim();
          setCollection({ step: "date", data: newData });
          addAIMessage("📅 Kaunsi date pe aana chahenge?\n\nFormat: YYYY-MM-DD (jaise: 2026-04-05)\nYa: today, tomorrow, kal, parso, Monday, etc.");
          return;
        case "date":
          const parsedDate = parseNaturalDate(text);
          if (!parsedDate) {
            addAIMessage("❌ Invalid date! Sahi date enter karein.\n\nFormat: YYYY-MM-DD (jaise: 2026-03-05)\nYa: today, tomorrow, kal, parso, Monday, etc.");
            return;
          }
          newData.date = parsedDate;
          setCollection({ step: "time", data: newData });
          addAIMessage("🕐 Kis time pe aana chahenge?\n\nClinic timings: 10:00 AM - 6:00 PM\nLunch: 1:00 PM - 2:00 PM\n\nFormat: HH:MM AM/PM (jaise: 11:00 AM, 3:30 PM)");
          return;
        case "time":
          if (!isValidTime(text)) {
            addAIMessage("❌ Invalid time! Sahi time enter karein.\n\nFormat: HH:MM AM/PM (jaise: 11:00 AM, 3:30 PM)\nClinic: 10:00 AM - 6:00 PM");
            return;
          }
          newData.time = text.trim();
          setCollection({ step: "confirm", data: newData });
          addAIMessage(
            `Please confirm karein:\n\n👤 Name: ${newData.name}\n📱 Phone: ${newData.phone}\n🏥 Problem: ${newData.reason}\n📅 Date: ${newData.date}\n🕐 Time: ${newData.time}\n\n✅ Sahi hai? (Haan / Nahi)`
          );
          return;
        case "confirm":
          if (lower.includes("haan") || lower.includes("yes") || lower.includes("ha") || lower.includes("sahi") || lower.includes("ok")) {
            saveAppointment(newData);
            setCollection({ step: "idle", data: {} });
            addAIMessage(
              `✅ Aapka appointment request save ho gaya hai!\n\n📋 Details:\n👤 ${newData.name}\n📱 ${newData.phone}\n🏥 ${newData.reason}\n📅 ${newData.date}\n🕐 ${newData.time}\n\n⏳ Doctor review karenge aur confirm karenge. Aapko message aayega.\n\nDhanyavaad! 🙏`
            );
          } else {
            setCollection({ step: "idle", data: {} });
            addAIMessage("Koi baat nahi! Aap dubara try kar sakte hain. 🙏\n\nKya aur kuch help chahiye?");
          }
          return;
      }
    }

    // Use AI for all other messages - semantic understanding
    addAIMessageAsync(text);
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "patient",
      timestamp: timeNow(),
    };
    setMessages(prev => [...prev, userMsg]);
    saveMessageToDB(input, "patient");
    const currentInput = input;
    setInput("");
    processInput(currentInput);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen stars-bg flex flex-col relative overflow-hidden">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />

      {/* Header */}
      <header className="glass-panel border-b flex items-center justify-between px-3 sm:px-4 py-3 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 neon-text-cyan" />
          </div>
          <div>
            <h1 className="font-display text-xs sm:text-sm font-bold neon-text-cyan tracking-wider">{hospitalName}</h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">AI Hospital Assistant • 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {dark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 neon-text-yellow" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors" title="Logout">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin max-w-3xl mx-auto w-full relative z-10">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 sm:gap-3 animate-slide-in ${msg.sender === "patient" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === "ai" ? "bg-primary/20 neon-glow-green" : "bg-neon-pink/20 neon-glow-pink"
            }`}>
              {msg.sender === "ai" ? <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 neon-text-green" /> : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 neon-text-pink" />}
            </div>
            <div className={`max-w-[80%] sm:max-w-[75%] rounded-xl p-2.5 sm:p-3 ${
              msg.sender === "ai" ? "glass-panel border neon-border-green" : "bg-primary/10 border border-primary/30"
            }`}>
              <p className="text-xs sm:text-sm whitespace-pre-line">{msg.text}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">{msg.timestamp}</p>
                {msg.sender === "ai" && (msg.kind === "notification" || msg.text.includes("📩")) && (
                  <button onClick={() => downloadMessagePDF(msg)} className="flex items-center gap-1 text-[9px] sm:text-[10px] neon-text-cyan hover:underline" title="Download as PDF">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="glass-panel border-t p-2.5 sm:p-3 max-w-3xl mx-auto w-full relative z-10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Apna message type karein..."
            className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <button onClick={send} className="p-2 sm:p-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors neon-glow-green">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 neon-text-green" />
          </button>
        </div>
        <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center mt-2">
          ⚕️ This AI assistant does not provide medical advice. For emergencies, call your doctor directly.
        </p>
      </div>
    </div>
  );
}
