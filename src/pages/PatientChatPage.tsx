import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Activity, Moon, Sun, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: number;
  text: string;
  sender: "patient" | "ai";
  timestamp: string;
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

// Validation helpers
function isValidPhone(val: string): boolean {
  const digits = val.replace(/\D/g, "");
  return digits.length === 10;
}

function isValidDate(val: string): boolean {
  // Accept formats: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, or natural like "kal", "monday" etc
  const natural = ["kal", "aaj", "parso", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "somvar", "mangalvar", "budhvar", "guruvar", "shukravar", "shanivar"];
  if (natural.some(n => val.toLowerCase().includes(n))) return true;
  // Check date pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{2}[-\/]\d{2}[-\/]\d{4}$|^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}$/i;
  if (datePattern.test(val.trim())) return true;
  // Try parsing
  const d = new Date(val);
  return !isNaN(d.getTime());
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get user and show initial message
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setMessages([{
          id: 1,
          text: `Hello! 👋 Main MEDI ASSIST ka AI assistant hoon. Aapki kya help kar sakta hoon?\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Location / address`,
          sender: "ai",
          timestamp: timeNow(),
        }]);
      }
    });
  }, []);

  // Listen for reschedule notifications via realtime
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('patient-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as any;
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: n.message,
          sender: "ai" as const,
          timestamp: timeNow(),
        }]);
        // Mark as read
        supabase.from('notifications').update({ is_read: true }).eq('id', n.id).then();
      })
      .subscribe();

    // Also check existing unread notifications
    supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false).then(({ data }) => {
      if (data && data.length > 0) {
        data.forEach(n => {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            text: n.message,
            sender: "ai" as const,
            timestamp: timeNow(),
          }]);
        });
        // Mark all read
        supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false).then();
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const addAIMessage = (text: string) => {
    const aiMsg: Message = {
      id: Date.now() + 1,
      text,
      sender: "ai",
      timestamp: timeNow(),
    };
    setTimeout(() => setMessages(prev => [...prev, aiMsg]), 600);
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

  const processInput = (text: string) => {
    const lower = text.toLowerCase().trim();

    if (collection.step !== "idle") {
      const newData = { ...collection.data };

      switch (collection.step) {
        case "name":
          // Name should be text only, no numbers
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
          // Reason should be text, not just numbers
          if (/^\d+$/.test(text.trim())) {
            addAIMessage("❌ Invalid reason! Apni problem ya bimari ka naam likhein. Numbers nahi:");
            return;
          }
          newData.reason = text.trim();
          setCollection({ step: "date", data: newData });
          addAIMessage("📅 Kaunsi date pe aana chahenge?\n\nFormat: YYYY-MM-DD (jaise: 2026-03-05)\nYa: kal, parso, Monday, etc.");
          return;
        case "date":
          if (!isValidDate(text)) {
            addAIMessage("❌ Invalid date! Sahi date enter karein.\n\nFormat: YYYY-MM-DD (jaise: 2026-03-05)\nYa: kal, parso, Monday, etc.");
            return;
          }
          newData.date = text.trim();
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

    if (lower.includes("appointment") || lower.includes("book") || lower.includes("milna") || lower.includes("dikhana") || lower.match(/^1$/)) {
      setCollection({ step: "name", data: {} });
      addAIMessage("Zaroor! Appointment ke liye kuch details chahiye.\n\nSabse pehle, aapka poora naam bataiye:");
      return;
    }

    if (lower.includes("fee") || lower.includes("charge") || lower.includes("cost") || lower.includes("paisa") || lower.includes("kitna") || lower.match(/^2$/)) {
      addAIMessage("💰 Consultation fees:\n\n• First visit: ₹500\n• Follow-up (7 din ke andar): ₹200\n\nKya aap appointment book karna chahenge?");
      return;
    }

    if (lower.includes("time") || lower.includes("timing") || lower.includes("open") || lower.includes("kab") || lower.match(/^3$/)) {
      addAIMessage("🕐 Clinic timings:\n\n• Monday - Saturday: 10:00 AM - 6:00 PM\n• Sunday: Closed\n• Lunch: 1:00 PM - 2:00 PM\n\nKya appointment book karna hai?");
      return;
    }

    if (lower.includes("location") || lower.includes("address") || lower.includes("kahan") || lower.match(/^4$/)) {
      addAIMessage("📍 City Health Clinic\n123 Medical Road, Sector 5\nNear Central Market\n\nKya aur kuch help chahiye?");
      return;
    }

    if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("helo")) {
      addAIMessage("Hello! 👋 Aapki kya help kar sakta hoon?\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Location / address");
      return;
    }

    addAIMessage("Main samajh nahi paaya. Kya aap yeh batana chahenge:\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Location / address");
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
            <h1 className="font-display text-xs sm:text-sm font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">AI Clinic Receptionist • 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {dark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 neon-text-yellow" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          </button>
          <Link to="/login" className="text-[9px] sm:text-[10px] px-2 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 text-muted-foreground transition-colors">
            Doctor Login
          </Link>
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
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">{msg.timestamp}</p>
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
