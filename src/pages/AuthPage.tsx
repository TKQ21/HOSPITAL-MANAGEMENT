import { useState } from "react";
import { Activity, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password.length < 6) {
          setError("Password kam se kam 6 characters ka hona chahiye");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />

      <div className="w-full max-w-sm glass-panel rounded-2xl border neon-border-cyan neon-glow-cyan p-8 animate-slide-in relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow-cyan mb-4">
            <Activity className="w-8 h-8 neon-text-cyan" />
          </div>
          <h1 className="font-display text-xl font-bold neon-text-cyan tracking-wider">MEDI ASSIST</h1>
          <p className="text-xs text-muted-foreground mt-1">AI Clinic Receptionist • 24/7</p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all ${
              isLogin ? "glass-panel neon-border-cyan neon-text-cyan" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all ${
              !isLogin ? "glass-panel neon-border-green neon-text-green" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="apna@email.com"
              required
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
                required
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
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-display text-sm font-bold neon-text-cyan tracking-wider disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "LOGIN" : "SIGN UP"}
          </button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center mt-6">
          {isLogin ? "Account nahi hai?" : "Already account hai?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="neon-text-cyan hover:underline">
            {isLogin ? "Sign Up karein" : "Login karein"}
          </button>
        </p>
      </div>
    </div>
  );
}
