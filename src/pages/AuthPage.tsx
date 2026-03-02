import { useState } from "react";
import { Activity, Eye, EyeOff, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(emailOrUsername, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess("Password reset link sent to your email. Please check your inbox.");
        setLoading(false);
        return;
      }

      if (mode === "login") {
        // Try login with email or username
        let loginEmail = emailOrUsername;
        // If not an email format, treat as username — but Supabase auth needs email
        // We'll just try as email; username login requires profiles lookup
        if (!emailOrUsername.includes("@")) {
          setError("Please enter a valid email address to login");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
      } else {
        // Signup
        if (!PASSWORD_REGEX.test(password)) {
          setError("Password must be 8-15 characters with at least 1 uppercase, 1 lowercase, 1 digit & 1 special character");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccess("Account created! Please check your email to verify.");
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

        {mode !== "forgot" && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all ${
                mode === "login" ? "glass-panel neon-border-cyan neon-text-cyan" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-display font-bold tracking-wider transition-all ${
                mode === "signup" ? "glass-panel neon-border-green neon-text-green" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SIGN UP
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "forgot" ? (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Email Address</label>
              <input
                type="email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ) : mode === "login" ? (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email</label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="your@email.com"
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
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                    placeholder="8-15 chars, A-z, 0-9, special"
                    required
                    className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Min 8, Max 15 chars • 1 uppercase • 1 lowercase • 1 digit • 1 special char</p>
              </div>
            </>
          )}

          {error && <p className="text-xs neon-text-pink">{error}</p>}
          {success && <p className="text-xs neon-text-green">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-display text-sm font-bold neon-text-cyan tracking-wider disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "forgot" ? "SEND RESET LINK" : mode === "login" ? "LOGIN" : "SIGN UP"}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          {mode === "forgot" ? (
            <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="text-[10px] neon-text-cyan hover:underline">
              ← Back to Login
            </button>
          ) : (
            <>
              <p className="text-[10px] text-muted-foreground">
                {mode === "login" ? "Account nahi hai?" : "Already account hai?"}{" "}
                <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }} className="neon-text-cyan hover:underline">
                  {mode === "login" ? "Sign Up karein" : "Login karein"}
                </button>
              </p>
              {mode === "login" && (
                <button onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} className="text-[10px] neon-text-yellow hover:underline">
                  Forgot Password?
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
