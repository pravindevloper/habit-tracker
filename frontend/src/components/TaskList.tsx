import { useState } from "react";
import { useStreak } from "@/context/StreakContext";
import TaskItem from "./TaskItem";
import { Plus, Calendar, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

const TaskList = () => {
  const { 
    todayTasks, 
    yesterdayTasks, 
    viewingYesterday, 
    setViewingYesterday,
    addTask, 
    toggleTask, 
    deleteTask 
  } = useStreak();
  
  const [newTask, setNewTask] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask("");
    }
  };

  const tasks = viewingYesterday ? yesterdayTasks : todayTasks;
  const completedCount = tasks.filter(t => t.completed).length;
  const allTasksCompleted = tasks.length > 0 && completedCount === tasks.length;

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {viewingYesterday && (
            <button
              onClick={() => setViewingYesterday(false)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {viewingYesterday ? "Yesterday's Tasks" : "Today's Tasks"}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(
                viewingYesterday ? new Date(Date.now() - 86400000) : new Date(), 
                "EEEE, MMM d"
              )}
            </p>
          </div>
        </div>
        
        {!viewingYesterday && (
          <button
            onClick={() => setViewingYesterday(true)}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-all"
          >
            View Yesterday
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                allTasksCompleted ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {completedCount}/{tasks.length}
          </span>
          {allTasksCompleted && (
            <span className="text-xs text-success font-medium animate-fade-in">
              ✓ All done!
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">
              {viewingYesterday 
                ? "No tasks were added yesterday" 
                : "No tasks yet. Add one below!"
              }
            </p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div 
              key={task.id}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskItem
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                disabled={viewingYesterday}
              />
            </div>
          ))
        )}
      </div>

      {!viewingYesterday && (
        <form onSubmit={handleAddTask} className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="w-full px-4 py-3 pr-12 rounded-xl bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-success text-success-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-success/90 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default TaskList;
