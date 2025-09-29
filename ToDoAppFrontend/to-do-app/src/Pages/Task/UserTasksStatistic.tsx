import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useGetCurrentUserQuery } from "../../apis/authApi";
import { MainLoader } from "../../Components/Layout/Common";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import type { toDoTaskModel } from "../../Interfaces";

const UserTasksStatistic: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined);

  // Preuzmi taskove trenutnog korisnika
  const tasks: toDoTaskModel[] = data?.result?.tasks ?? [];

  // Prebroj taskove po statusu i da li su overdue
  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.status === StatusTaska.Completed).length,
    [tasks]
  );
  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === StatusTaska.Pending).length,
    [tasks]
  );
  const overdueTasksCount = useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const now = new Date();
        return t.status !== StatusTaska.Completed && due < now;
      }).length,
    [tasks]
  );

  const totalTasks = useMemo(
    () => tasks.length,
    [tasks]
  );

  if (isLoading) return <MainLoader />;
  if (isError || !data?.result) return <div>{t("myTasksPage.error")}</div>;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center bg-light">
        <h5 className="mb-0">{t("myTasksPage.summary.title")}</h5>
        <button
          className="btn btn-link p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp size={20} color="#51285f" />
          ) : (
            <ChevronDown size={20} color="#51285f" />
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between">
              <span>{t("myTasksPage.summary.completed")}</span>
              <span className="badge bg-success">{completedTasksCount}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>{t("myTasksPage.summary.pending")}</span>
              <span className="badge bg-warning">{pendingTasksCount}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between">
              <span>{t("myTasksPage.summary.notCompleted")}</span>
              <span className="badge bg-danger">{overdueTasksCount}</span>
            </li>
            <br />
            <li className="list-group-item d-flex justify-content-between">
              <span>{t("myTasksPage.summary.total")}</span>
              <span className="badge bg-primary">{totalTasks}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserTasksStatistic;
