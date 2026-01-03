import { useNavigate } from "react-router-dom";
import { useStreak } from "@/context/StreakContext";
import { useEffect } from "react";
import Header from "@/components/Header";
import StreakCounter from "@/components/StreakCounter";
import TaskList from "@/components/TaskList";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import StatsCards from "@/components/StatsCards";
import StreakBrokenModal from "@/components/StreakBrokenModal";

const Dashboard = () => {
  const { isAuthenticated } = useStreak();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StreakBrokenModal />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-10">
          {/* Streak Counter */}
          <section className="text-center">
            <StreakCounter />
          </section>

          {/* Task List */}
          <section>
            <TaskList />
          </section>

          {/* Stats Cards */}
          <section>
            <StatsCards />
          </section>

          {/* Contribution Heatmap */}
          <section className="bg-card border border-border/50 rounded-2xl p-6">
            <ContributionHeatmap />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
