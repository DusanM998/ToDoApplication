import { useTranslation } from "react-i18next";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import { Pencil, Trash2 } from "lucide-react";
import type { toDoTaskModel } from "../../Interfaces";

interface TasksTableProps {
  tasks: toDoTaskModel[];
  onToggleComplete: (task: toDoTaskModel) => void;
  onDelete: (id: number) => void;
  navigate: (path: string) => void;
}

const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  navigate,
}) => {
  const { t } = useTranslation();

  const getStatusLabel = (status: number) => {
    switch (status) {
      case StatusTaska.Pending:
        return <span className="badge bg-warning text-dark">{t("myTasksPage.statusPending")}</span>;
      case StatusTaska.Completed:
        return <span className="badge bg-success">{t("myTasksPage.statusCompleted")}</span>;
      default:
        return <span className="badge bg-secondary">{t("myTasksPage.statusUnknown")}</span>;
    }
  };

  return (
    <div className="table-responsive rounded">
      <table className="table table-hover table-bordered align-middle">
        <thead style={{ backgroundColor: "#51285f", color: "#fff" }}>
          <tr>
            <th scope="col">{t("myTasksPage.title")}</th>
            <th scope="col">{t("createTaskPage.descriptionLabel")}</th>
            <th scope="col">{t("myTasksPage.status")}</th>
            <th scope="col">{t("myTasksPage.dueDate")}</th>
            <th scope="col">{t("adminTasksPage.owner")}</th>
            <th scope="col">{t("adminTasksPage.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td
                className="cursor-pointer"
                onClick={() => onToggleComplete(task)}
                style={{ maxWidth: "200px" }}
              >
                <span className={task.status === StatusTaska.Completed ? "text-decoration-line-through text-muted" : ""}>
                  {task.title}
                </span>
              </td>
              <td style={{ maxWidth: "300px" }}>{task.description || "-"}</td>
              <td>{getStatusLabel(task.status)}</td>
              <td>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("sr-RS", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </td>
              <td>{task?.name || "Unknown"}</td>
              <td>
                <div className="d-flex gap-2">
                  {task.status !== StatusTaska.Completed && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/editTask/${task.id}`);
                      }}
                      title={t("myTasksPage.edit")}
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    title={t("myTasksPage.delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TasksTable;