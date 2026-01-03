import { Task } from "@/types/streak";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const TaskItem = ({ task, onToggle, onDelete, disabled }: TaskItemProps) => {
  return (
    <div 
      className={cn(
        "task-item group animate-fade-in",
        task.completed && "bg-success/5 border-success/20"
      )}
    >
      <button
        onClick={() => !disabled && onToggle(task.id)}
        disabled={disabled}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          task.completed 
            ? "bg-success border-success text-success-foreground" 
            : "border-muted-foreground/40 hover:border-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {task.completed && <Check className="w-4 h-4" strokeWidth={3} />}
      </button>
      
      <span 
        className={cn(
          "flex-1 text-sm font-medium transition-all duration-200",
          task.completed && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>
      
      {!disabled && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TaskItem;
