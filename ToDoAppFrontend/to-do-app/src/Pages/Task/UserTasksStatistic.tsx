import { useTranslation } from "react-i18next";
import { useState, useImperativeHandle, forwardRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useGetCurrentUserQuery } from "../../apis/authApi";
import { MainLoader } from "../../Components/Layout/Common";

// Interfejs za ref metode
export interface UserTasksStatisticRef {
  refetch: () => void;
}

// Statistika za taskove (koliko ih je korisnik uspesno zavrsio, koliko su mu na cekanju, koliko ih je isteklo)
const UserTasksStatistic = forwardRef<UserTasksStatisticRef>((props, ref) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, isError, refetch } =
    useGetCurrentUserQuery(undefined);

  // Izlaze refetch metodu roditelju (MyTask komponenti)
  useImperativeHandle(ref, () => ({
    refetch,
  }));

  if (isLoading) return <MainLoader />;
  if (isError || !data?.result) return <div>{t("myTasksPage.error")}</div>;

  // Prebrojava koliko je kojih taskova
  const { completedTasksCount, pendingTasksCount, overdueTasksCount } =
    data.result;

  const totalTasks =
    (completedTasksCount ?? 0) +
    (pendingTasksCount ?? 0) +
    (overdueTasksCount ?? 0);

  return (
    <div className="card shadow-sm mb-4">
      <div
        className="card-header d-flex justify-content-between align-items-center bg-light"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer", userSelect: "none" }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <h5 className="mb-0">{t("myTasksPage.summary.title")}</h5>
        <button className="btn btn-link p-0">
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
});

UserTasksStatistic.displayName = "UserTasksStatistic";

export default UserTasksStatistic;
