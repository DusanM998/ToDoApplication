import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import type { TaskPriority } from "../../Interfaces";
import { useFormik } from "formik";
import { toastNotify } from "../../Helper";

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

  const formik = useFormik({
    initialValues: {
      search: "",
      status: undefined as StatusTaska | undefined,
      dueDateFrom: "",
      dueDateTo: "",
      category: "",
      priority: undefined as TaskPriority | undefined,
    },
    onSubmit: (values) => {
      // Validacija datuma
      if (
        values.dueDateFrom &&
        values.dueDateTo &&
        values.dueDateFrom > values.dueDateTo
      ) {
        toastNotify(t("toastNotify.invalidDateRange"), "info");
        return;
      }

      const from = values.dueDateFrom
        ? new Date(values.dueDateFrom + "T00:00:00Z").toISOString()
        : undefined;

      const to = values.dueDateTo
        ? new Date(values.dueDateTo + "T23:59:59Z").toISOString()
        : undefined;

      onFilterChange({
        search: values.search,
        status: values.status,
        dueDateFrom: from,
        dueDateTo: to,
        category: values.category || undefined,
        priority: values.priority,
      });
    },
  });

  //const isFilterSet = search !== "" || status !== undefined || dueDateFrom !== "" || dueDateTo !== "";

  const isFilterSet =
    formik.values.search !== "" ||
    formik.values.status !== undefined ||
    formik.values.dueDateFrom !== "" ||
    formik.values.dueDateTo !== "" ||
    formik.values.category !== "" ||
    formik.values.priority !== undefined;

  useEffect(() => {
    if (!isFilterSet) {
      onFilterChange({
        search: "",
        status: undefined,
        dueDateFrom: undefined,
        dueDateTo: undefined,
        category: undefined,
        priority: undefined,
      });
    }
  }, [isFilterSet]);

  const handleClearFilters = () => {
    formik.resetForm();
    onFilterChange({
      search: "",
      status: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
      category: undefined,
      priority: undefined,
    });
  };

  return (
    <div className="card mb-4 shadow-sm" style={{ borderRadius: "10px" }}>
      <form onSubmit={formik.handleSubmit}>
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
              name="search"
              value={formik.values.search}
              onChange={formik.handleChange}
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
              name="status"
              value={
                formik.values.status !== undefined
                  ? String(formik.values.status)
                  : ""
              }
              onChange={(e) =>
                formik.setFieldValue(
                  "status",
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
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
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
              name="priority"
              value={
                formik.values.priority !== undefined
                  ? String(formik.values.priority)
                  : ""
              }
              onChange={(e) =>
                formik.setFieldValue(
                  "priority",
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
              name="dueDateFrom"
              value={formik.values.dueDateFrom}
              onChange={formik.handleChange}
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
              name="dueDateTo"
              value={formik.values.dueDateTo}
              onChange={formik.handleChange}
            />
          </div>
          {isFilterSet && (
            <div className="col-12 text-center">
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  backgroundColor: "#51285f",
                  borderColor: "#51285f",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  transition: "all 0.3s",
                }}
              >
                {t("myTasksPage.applyFilters")}
              </button>
              <button
                type="button"
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
      </form>
    </div>
  );
};

export default TaskFilter;
