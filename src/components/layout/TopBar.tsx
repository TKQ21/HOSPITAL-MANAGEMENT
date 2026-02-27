import { Menu, Moon, Sun, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="h-14 glass-panel border-b flex items-center justify-between px-4 z-10">
      <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-secondary/50 md:hidden">
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-pink animate-pulse-neon" />
        </button>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          {dark ? (
            <Sun className="w-5 h-5 text-neon-yellow" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-glow-cyan">
          <span className="text-xs font-display font-bold neon-text-cyan">DR</span>
        </div>
      </div>
    </header>
  );
}
