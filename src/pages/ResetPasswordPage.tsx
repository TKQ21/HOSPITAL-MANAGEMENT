import { useState, useEffect } from "react";
import { Activity, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,15}$/;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a recovery flow
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!PASSWORD_REGEX.test(password)) {
      setError("Password must be 8-15 characters with at least 1 uppercase, 1 lowercase, 1 digit & 1 special character");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="stars-layer" />
        <div className="stars-layer stars-layer-2" />
        <div className="stars-layer stars-layer-3" />
        <div className="glass-panel rounded-2xl border neon-border-pink p-8 text-center relative z-10">
          <p className="neon-text-pink text-sm">Invalid or expired reset link</p>
          <button onClick={() => navigate("/")} className="mt-4 text-xs neon-text-cyan hover:underline">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen stars-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />

      <div className="w-full max-w-sm glass-panel rounded-2xl border neon-border-cyan neon-glow-cyan p-8 animate-slide-in relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Activity className="w-8 h-8 neon-text-cyan mb-2" />
          <h1 className="font-display text-lg font-bold neon-text-cyan tracking-wider">SET NEW PASSWORD</h1>
          <p className="text-[10px] text-muted-foreground mt-1">Min 8, Max 15 chars • 1 uppercase • 1 lowercase • 1 digit • 1 special char</p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="neon-text-green text-sm">Password updated! Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-10 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            {error && <p className="text-xs neon-text-pink">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary/20 border neon-border-cyan neon-glow-cyan hover:bg-primary/30 transition-all font-display text-sm font-bold neon-text-cyan tracking-wider disabled:opacity-50">
              {loading ? "Updating..." : "SET PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
