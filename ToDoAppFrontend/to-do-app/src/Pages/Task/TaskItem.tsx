import { useTranslation } from "react-i18next";
import type { toDoTaskModel } from "../../Interfaces";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Circle,
  Trash2,
  XCircle,
} from "lucide-react";
import { StatusTaska } from "../../Interfaces/StatusTaska";

interface TaskItemProps {
  task: toDoTaskModel;
  onToggleComplete: (task: toDoTaskModel) => void;
  onDelete: (id: number) => void;
  navigate: (path: string) => void;
}

// Komponenta za prikaz kartice taska
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  navigate,
}) => {
  const { t } = useTranslation();
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  let priorityIconColor = "";
  let priorityIconTitle = "";
  switch (task.priority) {
    case 3: // Visok prioritet
      priorityIconColor = "text-danger";
      priorityIconTitle = t("myTasksPage.priorityHigh");
      break;
    case 2: // Medium prioritet
      priorityIconColor = "text-warning";
      priorityIconTitle = t("myTasksPage.priorityNormal");
      break;
    case 1: // Nizak prioritet
      priorityIconColor = "text-success";
      priorityIconTitle = t("myTasksPage.priorityLow");
      break;
    default:
      priorityIconColor = "text-secondary";
      priorityIconTitle = t("myTasksPage.priorityNone");
  }

  return (
    <div className="col-12 col-md-6">
      <div
        className={`card shadow-sm ${
          task.status === StatusTaska.Completed
            ? "border-success bg-light"
            : task.status === StatusTaska.Overdue
            ? "border-danger bg-light"
            : ""
        }`}
      >
        <div
          className="card-body"
          style={{
            pointerEvents:
              task.status === StatusTaska.Overdue ? "none" : "auto",
            opacity: task.status === StatusTaska.Overdue ? 0.6 : 1,
          }}
        >
          <div
            className="d-flex cursor-pointer"
            onClick={() => onToggleComplete(task)}
            style={{
              pointerEvents:
                task.status === StatusTaska.Overdue ? "none" : "auto",
            }}
          >
            <div className="me-3 d-flex align-items-start">
              {task.status === StatusTaska.Completed ? (
                <CheckCircle className="text-success" size={24} />
              ) : task.status === StatusTaska.Overdue ? (
                <XCircle className="text-danger" size={24} />
              ) : (
                <Circle className="text-secondary" size={24} />
              )}
            </div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center">
                <h5
                  className={`card-title mb-1 me-2 ${
                    task.status === StatusTaska.Completed
                      ? "text-decoration-line-through text-muted"
                      : ""
                  }`}
                >
                  {task.title}
                </h5>
                {task.priority && (
                  <span title={priorityIconTitle}>
                    <AlertCircle className={priorityIconColor} size={16} />
                  </span>
                )}
              </div>
              {task.dueDate && (
                <small className="text-muted d-block mb-1">
                  {t("myTasksPage.dueDate")}{" "}
                  {new Date(task.dueDate).toLocaleDateString("sr-RS", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </small>
              )}
              {task.category && (
                <small className="text-muted d-block mb-1">
                  {t("myTasksPage.category")}: {task.category}
                </small>
              )}
            </div>
            <button
              className="btn btn-link p-0 ms-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsTaskExpanded(!isTaskExpanded);
              }}
            >
              {isTaskExpanded ? (
                <ChevronUp size={20} color="#51285f" />
              ) : (
                <ChevronDown size={20} color="#51285f" />
              )}
            </button>
          </div>
          {isTaskExpanded && task.description && (
            <p className="card-text mt-2 text-secondary">
              {t("createTaskPage.descriptionLabel")}: {task.description}
            </p>
          )}
          <div className="d-flex justify-content-end mt-2">
            <button
              className="btn btn-danger btn-sm me-2"
              style={{
                pointerEvents: "auto", 
                opacity: 4, 
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 size={16} />
            </button>

            {task.status === StatusTaska.Pending && (
              <button
                className="btn btn-warning btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tasks/editTask/${task.id}`);
                }}
              >
                <i className="bi bi-pencil"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
