import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Activity, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "patient" | "ai";
  timestamp: string;
}

// Appointment collection state machine
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

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Namaste! 🙏 Main City Health Clinic ka AI assistant hoon. Aapki kya help kar sakta hoon?\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Location / address",
    sender: "ai",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

// Stored appointments that doctor dashboard will read
function getStoredAppointments(): any[] {
  const stored = localStorage.getItem("clinic_appointments");
  return stored ? JSON.parse(stored) : [];
}

function saveAppointment(data: any) {
  const appointments = getStoredAppointments();
  const newAppt = {
    id: Date.now(),
    patientName: data.name,
    phone: data.phone,
    reason: data.reason,
    date: data.date,
    time: data.time,
    status: "pending",
    source: "Web",
    createdAt: new Date().toISOString(),
  };
  appointments.push(newAppt);
  localStorage.setItem("clinic_appointments", JSON.stringify(appointments));

  // Also save patient
  const patients = JSON.parse(localStorage.getItem("clinic_patients") || "[]");
  const exists = patients.find((p: any) => p.phone === data.phone);
  if (!exists) {
    patients.push({
      id: Date.now(),
      name: data.name,
      phone: data.phone,
      visits: 0,
      lastVisit: null,
      notes: data.reason,
      followUp: null,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("clinic_patients", JSON.stringify(patients));
  }
}

export default function PatientChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [collection, setCollection] = useState<CollectionState>({ step: "idle", data: {} });
  const [dark, setDark] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addAIMessage = (text: string) => {
    const aiMsg: Message = {
      id: Date.now() + 1,
      text,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTimeout(() => setMessages((prev) => [...prev, aiMsg]), 600);
  };

  const processInput = (text: string) => {
    const lower = text.toLowerCase().trim();

    // If in collection flow
    if (collection.step !== "idle") {
      const newData = { ...collection.data };

      switch (collection.step) {
        case "name":
          newData.name = text.trim();
          setCollection({ step: "phone", data: newData });
          addAIMessage(`Shukriya ${newData.name}! 📱\n\nAb aapka phone number bataiye (10 digit):`);
          return;

        case "phone":
          const phoneClean = text.replace(/\D/g, "");
          if (phoneClean.length < 10) {
            addAIMessage("Phone number 10 digit ka hona chahiye. Please dubara enter karein:");
            return;
          }
          newData.phone = phoneClean.slice(-10);
          setCollection({ step: "reason", data: newData });
          addAIMessage("Aap kis problem / bimari ke liye doctor se milna chahte hain?\n\nFor example: Bukhar, Pet dard, Follow-up, Report dikhana, General check-up, etc.");
          return;

        case "reason":
          newData.reason = text.trim();
          setCollection({ step: "date", data: newData });
          addAIMessage("Kaunsi date pe aana chahenge?\n\nFor example: Kal, 2026-03-05, Monday, etc.");
          return;

        case "date":
          newData.date = text.trim();
          setCollection({ step: "time", data: newData });
          addAIMessage("Kis time pe aana chahenge?\n\nClinic timings: 10:00 AM - 6:00 PM\nLunch: 1:00 PM - 2:00 PM\n\nFor example: 11:00 AM, 3:30 PM, etc.");
          return;

        case "time":
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

    // Normal flow
    if (lower.includes("appointment") || lower.includes("book") || lower.includes("milna") || lower.includes("dikhana") || lower.match(/^1$/)) {
      setCollection({ step: "name", data: {} });
      addAIMessage("Zaroor! Appointment request ke liye kuch details chahiye.\n\nSabse pehle, aapka poora naam bataiye:");
      return;
    }

    if (lower.includes("fee") || lower.includes("charge") || lower.includes("cost") || lower.includes("paisa") || lower.includes("kitna") || lower.match(/^2$/)) {
      addAIMessage("💰 Dr. Sharma ki consultation fees:\n\n• First visit: ₹500\n• Follow-up (7 din ke andar): ₹200\n\nKya aap appointment book karna chahenge?");
      return;
    }

    if (lower.includes("time") || lower.includes("timing") || lower.includes("open") || lower.includes("kab") || lower.match(/^3$/)) {
      addAIMessage("🕐 City Health Clinic timings:\n\n• Monday - Saturday: 10:00 AM - 6:00 PM\n• Sunday: Closed\n• Lunch: 1:00 PM - 2:00 PM\n\nKya appointment book karna hai?");
      return;
    }

    if (lower.includes("location") || lower.includes("address") || lower.includes("kahan") || lower.match(/^4$/)) {
      addAIMessage("📍 City Health Clinic\n123 Medical Road, Sector 5\nNear Central Market\n\nGoogle Maps: https://maps.google.com\n\nKya aur kuch help chahiye?");
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    processInput(currentInput);
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-cyan">
            <Activity className="w-5 h-5 neon-text-cyan" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
            <p className="text-[10px] text-muted-foreground">AI Clinic Receptionist • 24/7 Available</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {dark ? <Sun className="w-5 h-5 text-neon-yellow" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>
          <Link
            to="/login"
            className="text-[10px] px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 text-muted-foreground transition-colors"
          >
            Doctor Login
          </Link>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin max-w-3xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-in ${msg.sender === "patient" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "ai"
                  ? "bg-primary/20 neon-glow-green"
                  : "bg-neon-pink/20 neon-glow-pink"
              }`}
            >
              {msg.sender === "ai" ? (
                <Bot className="w-4 h-4 neon-text-green" />
              ) : (
                <User className="w-4 h-4 neon-text-pink" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-xl p-3 ${
                msg.sender === "ai"
                  ? "glass-panel border neon-border-green"
                  : "bg-primary/10 border border-primary/30"
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="glass-panel border-t p-3 max-w-3xl mx-auto w-full">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Apna message type karein..."
            className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            className="p-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors neon-glow-green"
          >
            <Send className="w-5 h-5 neon-text-green" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          ⚕️ This AI assistant does not provide medical advice. For emergencies, call your doctor directly.
        </p>
      </div>
    </div>
  );
}
