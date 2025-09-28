import { useState } from "react";
import { useTranslation } from "react-i18next";

interface TaskFilterProps {
  onFilterChange: (filters: {
    search?: string;
    status?: "completed" | "pending" | "";
    dueDateFrom?: string;
    dueDateTo?: string;
  }) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "completed" | "pending">("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");

  const handleChange = () => {
    onFilterChange({ search, status, dueDateFrom, dueDateTo });
  };

  return (
    <div className="card mb-4">
      <div className="card-body row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">{t("myTasksPage.search")}</label>
          <input
            type="text"
            className="form-control"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleChange();
            }}
            placeholder={t("myTasksPage.searchPlaceholder")}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">{t("myTasksPage.status")}</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              handleChange();
            }}
          >
            <option value="">{t("myTasksPage.all")}</option>
            <option value="completed">{t("myTasksPage.completed")}</option>
            <option value="pending">{t("myTasksPage.pending")}</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">{t("myTasksPage.dueDateFrom")}</label>
          <input
            type="date"
            className="form-control"
            value={dueDateFrom}
            onChange={(e) => {
              setDueDateFrom(e.target.value);
              handleChange();
            }}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">{t("myTasksPage.dueDateTo")}</label>
          <input
            type="date"
            className="form-control"
            value={dueDateTo}
            onChange={(e) => {
              setDueDateTo(e.target.value);
              handleChange();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
