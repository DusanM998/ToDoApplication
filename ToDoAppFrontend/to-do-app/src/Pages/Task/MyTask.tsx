import React, { useCallback, useMemo, useState } from "react";
import { CheckCircle, Circle, Link, Trash2 } from "lucide-react";
import {
  useDeleteTaskMutation,
  useGetFilteredTasksQuery,
  useUpdateTaskMutation,
} from "../../apis/taskApi";
import type { toDoTaskModel } from "../../Interfaces";
import { useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../../Components/Layout/Common";
import TaskFilter from "./TaskFilter";

const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<{
    search?: string;
    status?: "completed" | "pending" | "";
    dueDateFrom?: string;
    dueDateTo?: string;
  }>({});

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 6;

  const {
    data: tasks,
    isLoading,
    isError,
  } = useGetFilteredTasksQuery({
    search: filters.search,
    isCompleted:
      filters.status === "completed"
        ? true
        : filters.status === "pending"
        ? false
        : undefined,
    dueDateFrom: filters.dueDateFrom,
    dueDateTo: filters.dueDateTo,
    pageNumber,
    pageSize,
  });

  const handleToggleComplete = useCallback(
    async (task: toDoTaskModel) => {
      try {
        await updateTask({
          ...task,
          isCompleted: !task.isCompleted,
        }).unwrap();
      } catch (err) {
        console.error("Greška pri ažuriranju taska:", err);
      }
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteTask(id).unwrap();
      } catch (err) {
        console.error("Greška pri brisanju taska:", err);
      }
    },
    [deleteTask]
  );

  const userTasks = useMemo(() => {
    return (
      tasks?.filter((task) => task.applicationUserId === userData?.id) || []
    );
  }, [tasks, userData?.id]);

  return (
    <div className="container py-5" style={{ marginTop: "50px" }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{t("myTasksPage.title")}</h2>
        <button
          className="btn btn-primary mt-2 mt-md-0"
          style={{ backgroundColor: "#51285f", borderColor: "#51285f" }}
          onClick={() => navigate("/tasks/create")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {t("myTasksPage.addNewTask")}
        </button>
      </div>
      
      {userTasks.length > 0 && (
        <TaskFilter
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPageNumber(1);
          }}
        />
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center h-64">
          <MainLoader />
        </div>
      ) : isError ? (
        <div className="d-flex justify-content-center align-items-center h-64">
          <p className="text-red-500 text-lg font-medium">
            {t("myTasksPage.error")}
          </p>
        </div>
      ) : userTasks.length > 0 ? (
        <>
          <div className="row g-4">
            {userTasks.map((task) => (
              <div className="col-12 col-md-6" key={task.id}>
                <div
                  className={`card shadow-sm ${
                    task.isCompleted ? "border-success bg-light" : ""
                  }`}
                >
                  <div
                    className="card-body d-flex cursor-pointer"
                    onClick={() => handleToggleComplete(task)}
                  >
                    <div className="me-3 d-flex align-items-start">
                      {task.isCompleted ? (
                        <CheckCircle className="text-success" size={24} />
                      ) : (
                        <Circle className="text-secondary" size={24} />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h5
                        className={`card-title mb-1 ${
                          task.isCompleted
                            ? "text-decoration-line-through text-muted"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h5>
                      {task.description && (
                        <p className="card-text mb-1 text-secondary">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <small className="text-muted">
                          {t("myTasksPage.dueDate")}{" "}
                          {new Date(task.dueDate).toLocaleDateString("sr-RS", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </small>
                      )}
                    </div>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      disabled={task.isCompleted}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="btn btn-warning btn-sm ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/editTask/${task.id}`);
                      }}
                      disabled={task.isCompleted}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    style={{
                      backgroundColor: pageNumber === 1 ? "#e9ecef" : "#fff",
                      color: pageNumber === 1 ? "#6c757d" : "#51285f",
                      borderColor: "#51285f",
                      borderRadius: "8px 0 0 8px",
                      padding: "8px 16px",
                      transition: "all 0.3s",
                    }}
                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                    disabled={pageNumber === 1}
                  >
                    {t("myTasksPage.previous")}
                  </button>
                </li>
                <li className="page-item active">
                  <span
                    className="page-link"
                    style={{
                      backgroundColor: "#51285f",
                      color: "#fff",
                      borderColor: "#51285f",
                      padding: "8px 16px",
                      fontWeight: "500",
                    }}
                  >
                    {pageNumber}
                  </span>
                </li>
                <li className="page-item">
                  <button
                    className="page-link"
                    style={{
                      backgroundColor: "#fff",
                      color: "#51285f",
                      borderColor: "#51285f",
                      borderRadius: "0 8px 8px 0",
                      padding: "8px 16px",
                      transition: "all 0.3s",
                    }}
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    disabled={userTasks.length < pageSize}
                  >
                    {t("myTasksPage.next")}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      ) : (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-secondary fw-medium">
            {t("myTasksPage.noTasksFound")}
          </p>
          <Link
            to="/tasks/create"
            className="btn btn-primary mt-3"
            style={{ backgroundColor: "#51285f", borderColor: "#51285f" }}
          >
            {t("myTasksPage.createFirstTask")}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTasks;