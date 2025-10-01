import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import type { TaskPriority } from "../../Interfaces";

interface TaskFilterProps {
  onFilterChange: (filters: {
    search?: string;
    status?: StatusTaska;
    dueDateFrom?: string;
    dueDateTo?: string;
    category?: string;
    priority?: TaskPriority;
  }) => void;
  categories: string[];
}

// Komponenta za filtriranje taskova
const TaskFilter: React.FC<TaskFilterProps> = ({
  onFilterChange,
  categories,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusTaska | undefined>(undefined);
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);

  //const isFilterSet = search !== "" || status !== undefined || dueDateFrom !== "" || dueDateTo !== "";

  const handleApplyFilters = () => {
    const from = dueDateFrom
      ? new Date(dueDateFrom + "T00:00:00Z").toISOString()
      : undefined;

    const to = dueDateTo
      ? new Date(dueDateTo + "T23:59:59Z").toISOString()
      : undefined;

    onFilterChange({
      search,
      status: status,
      dueDateFrom: from,
      dueDateTo: to,
      category: category || undefined,
      priority: priority,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setDueDateFrom("");
    setDueDateTo("");
    setCategory("");
    onFilterChange({
      search: "",
      status: undefined,
      dueDateFrom: "",
      dueDateTo: "",
      category: undefined,
    });
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
                onFilterChange({
                  search: "",
                  status: undefined,
                  dueDateFrom,
                  dueDateTo,
                });
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
              setStatus(
                e.target.value === ""
                  ? undefined
                  : (Number(e.target.value) as StatusTaska)
              )
            }
          >
            <option value="">{t("myTasksPage.all")}</option>
            <option value={StatusTaska.Completed}>
              {t("myTasksPage.summary.completed")}
            </option>
            <option value={StatusTaska.Pending}>
              {t("myTasksPage.summary.pending")}
            </option>
            <option value={StatusTaska.Overdue}>
              {t("myTasksPage.summary.notCompleted")}
            </option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("myTasksPage.category")}
          </label>
          <select
            className="form-select"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{t("myTasksPage.allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-medium text-muted">
            {t("createTaskPage.priorityLabel")}
          </label>
          <select
            className="form-select"
            style={{
              borderColor: "#51285f",
              borderRadius: "8px",
              padding: "10px",
            }}
            value={priority ?? ""}
            onChange={(e) =>
              setPriority(
                e.target.value === ""
                  ? undefined
                  : (Number(e.target.value) as TaskPriority)
              )
            }
          >
            <option value="">{t("myTasksPage.allPriorities")}</option>
            <option value={1}>{t("myTasksPage.priorityLow")}</option>
            <option value={2}>{t("myTasksPage.priorityNormal")}</option>
            <option value={3}>{t("myTasksPage.priorityHigh")}</option>
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
            onChange={(e) => setDueDateFrom(e.target.value)}
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
            onChange={(e) => setDueDateTo(e.target.value)}
          />
        </div>
        {/*{isFilterSet && (*/}
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
        {/*)}*/}
      </div>
    </div>
  );
};

export default TaskFilter;
