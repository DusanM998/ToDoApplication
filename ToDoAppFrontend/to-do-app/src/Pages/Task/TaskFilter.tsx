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

  const isFilterSet = search || status || dueDateFrom || dueDateTo;

  const handleApplyFilters = () => {
    onFilterChange({ search, status, dueDateFrom, dueDateTo });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setDueDateFrom("");
    setDueDateTo("");
    onFilterChange({ search: "", status: "", dueDateFrom: "", dueDateTo: "" });
  };

  return (
    <div className="card mb-4 shadow-sm" style={{ borderRadius: "10px" }}>
      <div className="card-body row g-4 align-items-end">
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("myTasksPage.search")}
          </label>
          <input
            type="text"
            className="form-control"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={search}
            onChange={(e) => {
              const newSearch = e.target.value;
              setSearch(newSearch);
              if (newSearch === "") {
                onFilterChange({ search: "", status, dueDateFrom, dueDateTo });
              }
            }}
            placeholder={t("myTasksPage.searchPlaceholder")}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("myTasksPage.status")}
          </label>
          <select
            className="form-select"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "" | "completed" | "pending")
            }
          >
            <option value="">{t("myTasksPage.all")}</option>
            <option value="completed">{t("myTasksPage.completed")}</option>
            <option value="pending">{t("myTasksPage.pending")}</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("myTasksPage.dueDateFrom")}
          </label>
          <input
            type="date"
            className="form-control"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={dueDateFrom}
            onChange={(e) => {
              const value = e.target.value;
              setDueDateFrom(value);
            }}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("myTasksPage.dueDateTo")}
          </label>
          <input
            type="date"
            className="form-control"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={dueDateTo}
            onChange={(e) => {
              const value = e.target.value;
              setDueDateTo(value);
            }}
          />
        </div>
        {isFilterSet && (
          <div className="col-12 text-center">
            <button
              className="btn btn-primary"
              style={{
                backgroundColor: "#51285f",
                borderColor: "#51285f",
                borderRadius: "8px",
                padding: "10px 20px",
                transition: "all 0.3s",
              }}
              onClick={handleApplyFilters}
            >
              {t("myTasksPage.applyFilters")}
            </button>
            <button
              className="btn btn-outline-secondary"
              style={{
                borderColor: "#51285f",
                color: "#51285f",
                borderRadius: "8px",
                padding: "10px 20px",
                transition: "all 0.3s",
                marginLeft: "10px",
              }}
              onClick={handleClearFilters}
            >
              {t("myTasksPage.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;
