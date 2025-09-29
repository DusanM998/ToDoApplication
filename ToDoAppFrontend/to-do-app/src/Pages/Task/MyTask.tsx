import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useDeleteTaskMutation,
  useGetFilteredTasksQuery,
  useUpdateTaskMutation,
} from "../../apis/taskApi";
import type { toDoTaskModel } from "../../Interfaces";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../../Components/Layout/Common";
import TaskFilter from "./TaskFilter";
import MyTaskPagination from "./MyTaskPagination";
import { setTasks } from "../../Storage/Redux/tasksSlice";
import TaskItem from "./TaskItem";
import UserTasksStatistic from "./UserTasksStatistic";

const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const tasks = useSelector((state: RootState) => state.taskStore.tasks);

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

  console.log("UserData:", userData);

  const {
    data: tasksResponse,
    isLoading,
    isError,
    refetch,
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

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  const pagination = tasksResponse?.pagination;

  useEffect(() => {
    if (tasksResponse?.data) {
      dispatch(setTasks(tasksResponse.data));
    }
  }, [tasksResponse, dispatch]);

  console.log("Taskovi:", tasks, "Paginacija:", pagination);

  useEffect(() => {
    if (userData?.id) {
      refetch();
    }
  }, [userData?.id, refetch]); // Povlaci najnovije taskove cim se aplikacija otvori sa perzistovanim korisnikom

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

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPageNumber(1);
  }, []);

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
        <>
          <UserTasksStatistic />
          <TaskFilter
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPageNumber(1);
            }}
          />
        </>
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
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                navigate={navigate}
              />
            ))}
          </div>

          <MyTaskPagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            totalRecords={pagination?.TotalRecords || 0}
            totalPages={pagination?.TotalPages || 1}
            pageSize={pagination?.PageSize || pageSize}
          />
        </>
      ) : filters.search ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-secondary fw-medium">
            {t("myTasksPage.noTasksFound")}
          </p>
          <button
            className="btn btn-outline-primary mt-3"
            style={{ color: "#51285f", borderColor: "#51285f" }}
            onClick={handleClearFilters}
          >
            {t("myTasksPage.clearFilters")}
          </button>
        </div>
      ) : (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-secondary fw-medium">
            {t("myTasksPage.noTasksFound")}
          </p>
          <button
            className="btn btn-primary mt-3"
            style={{ backgroundColor: "#51285f", borderColor: "#51285f" }}
            onClick={() => navigate("/tasks/create")}
          >
            {t("myTasksPage.createFirstTask")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
