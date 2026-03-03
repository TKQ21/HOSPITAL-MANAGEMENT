import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, ArrowLeft, Sun, Moon } from "lucide-react";

const DEFAULT_EMAIL = "doctor@clinic.com";
const DEFAULT_USERNAME = "doctor";
const DEFAULT_PASSWORD = "admin123";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedEmail = localStorage.getItem("doctor_email") || DEFAULT_EMAIL;
    const savedUsername = localStorage.getItem("doctor_username") || DEFAULT_USERNAME;
    const savedPassword = localStorage.getItem("doctor_password") || DEFAULT_PASSWORD;

    if ((identifier === savedEmail || identifier === savedUsername) && password === savedPassword) {
      localStorage.setItem("clinic_auth", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username/email or password");
    }
  };

  return (
    <div className="min-h-screen stars-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />
      <div className="w-full max-w-sm glass-panel rounded-2xl border neon-border-cyan neon-glow-cyan p-8 animate-slide-in relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to AI Chat
          </Link>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            {dark ? <Sun className="w-4 h-4 neon-text-yellow" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow-cyan mb-4">
            <Activity className="w-8 h-8 neon-text-cyan" />
          </div>
          <h1 className="font-display text-xl font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
          <p className="text-xs text-muted-foreground mt-1">Doctor Login Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Username or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Email"
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
                placeholder="Enter password"
                className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
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
          Default: doctor@clinic.com / admin123
        </p>
      </div>
    </div>
  );
}
