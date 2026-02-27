import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("doctor@clinic.com");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "doctor@clinic.com" && password === "admin123") {
      localStorage.setItem("clinic_auth", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel rounded-2xl border neon-border-cyan neon-glow-cyan p-8 animate-slide-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow-cyan mb-4">
            <Activity className="w-8 h-8 neon-text-cyan" />
          </div>
          <h1 className="font-display text-xl font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
          <p className="text-xs text-muted-foreground mt-1">AI Clinic Receptionist</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs neon-text-pink">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-display text-sm font-bold neon-text-cyan tracking-wider"
          >
            LOGIN
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-6">
          Demo: doctor@clinic.com / admin123
        </p>
      </div>
    </div>
  );
}
