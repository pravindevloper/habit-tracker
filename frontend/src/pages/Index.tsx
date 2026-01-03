import { useNavigate } from "react-router-dom";
import { useStreak } from "@/context/StreakContext";
import { useEffect } from "react";
import { Zap, CheckCircle, Flame, BarChart3, ArrowRight } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useStreak();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: CheckCircle,
      title: "Daily Discipline",
      description: "Complete at least one task daily to maintain your streak",
    },
    {
      icon: Flame,
      title: "Build Habits",
      description: "Watch your consistency grow with visual streak tracking",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "GitHub-style heatmap shows your learning journey",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl gradient-success flex items-center justify-center glow-success">
              <Zap className="w-8 h-8 text-success-foreground" />
            </div>
            <span className="text-3xl font-bold">Streak</span>
          </div>
          
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Build Discipline.
            <br />
            <span className="text-success">One Day at a Time.</span>
          </h1>
          
          <p 
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            Track your daily learning habits with a beautiful, minimal streak tracker. 
            Stay consistent, visualize progress, and never break the chain.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-4 rounded-xl bg-success text-success-foreground font-semibold hover:bg-success/90 transition-all flex items-center gap-2 glow-success"
            >
              Start Your Streak
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-4 rounded-xl bg-card border border-border/50 font-semibold hover:bg-accent transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <feature.icon className="w-10 h-10 text-success mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Built with discipline. Never break the chain.
        </div>
      </footer>
    </div>
  );
};

export default Index;
