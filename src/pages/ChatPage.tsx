import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "patient" | "ai";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Namaste! 🙏 Main City Health Clinic ka AI assistant hoon. Aapki kya help kar sakta hoon?\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings\n4. Follow-up",
    sender: "ai",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const aiResponses: Record<string, string> = {
  appointment:
    "Appointment request ke liye mujhe yeh details chahiye:\n\n• Aapka naam\n• Phone number\n• Problem type (general / follow-up / report)\n• Preferred date & time\n\nPlease share karein.",
  fees: "Dr. Sharma ki consultation fees ₹500 hai.\nFollow-up (7 din ke andar): ₹200\n\nKya aap appointment book karna chahenge?",
  timing:
    "City Health Clinic timings:\n\n🕐 Monday - Saturday: 10:00 AM - 6:00 PM\n🚫 Sunday: Closed\n\nLunch break: 1:00 PM - 2:00 PM",
  default:
    "Main samajh nahi paaya. Kya aap yeh batana chahenge:\n\n1. Appointment book karna\n2. Fees jaanna\n3. Clinic timings",
  booked:
    "✅ Aapka appointment request create ho gaya hai!\n\nDetails:\n• Patient: Ravi Kumar\n• Date: Kal\n• Time: 11:00 AM\n\n⏳ Doctor confirm karenge. Aapko message aayega shortly.\n\nDhanyavaad! 🙏",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("appointment") || lower.includes("book") || lower.includes("appoint"))
    return aiResponses.appointment;
  if (lower.includes("fee") || lower.includes("charge") || lower.includes("cost") || lower.includes("paisa"))
    return aiResponses.fees;
  if (lower.includes("time") || lower.includes("timing") || lower.includes("open") || lower.includes("kab"))
    return aiResponses.timing;
  if (lower.includes("ravi") || lower.includes("11") || lower.includes("kal"))
    return aiResponses.booked;
  return aiResponses.default;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "patient",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: getAIResponse(input),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] animate-slide-in">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold neon-text-green tracking-wider">AI Chat</h1>
        <p className="text-muted-foreground text-sm mt-1">Patient-facing AI receptionist</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass-panel rounded-xl border neon-border-green overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
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
        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
            <button
              onClick={send}
              className="p-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors neon-glow-green"
            >
              <Send className="w-5 h-5 neon-text-green" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        This AI assistant does not provide medical advice.
      </p>
    </div>
  );
}
