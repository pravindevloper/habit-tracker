import { useStreak } from "@/context/StreakContext";
import { LogOut, Zap } from "lucide-react";

const Header = () => {
  const { user, logout } = useStreak();

  return (
    <header className="w-full border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-success flex items-center justify-center">
            <Zap className="w-5 h-5 text-success-foreground" />
          </div>
          <span className="font-bold text-lg">Streak</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
