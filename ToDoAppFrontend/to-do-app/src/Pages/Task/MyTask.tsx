import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  useDeleteTaskMutation,
  useGetFilteredTasksQuery,
  useUpdateTaskMutation,
} from "../../apis/taskApi";
import type { TaskPriority, toDoTaskModel } from "../../Interfaces";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainLoader } from "../../Components/Layout/Common";
import TaskFilter from "./TaskFilter";
import MyTaskPagination from "./MyTaskPagination";
import { setTasks } from "../../Storage/Redux/tasksSlice";
import TaskItem from "./TaskItem";
import UserTasksStatistic, {
  type UserTasksStatisticRef,
} from "./UserTasksStatistic";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import { toastNotify } from "../../Helper";

// Komponenta koja prikazuje svakom korisniku individualne taskove
const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const tasksFromStore = useSelector(
    (state: RootState) => state.taskStore.tasks
  );
  const tasks: toDoTaskModel[] = Array.isArray(tasksFromStore)
    ? tasksFromStore
    : [];

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { t } = useTranslation();

  // Ref za statistiku
  const statisticsRef = useRef<UserTasksStatisticRef>(null);

  const [filters, setFilters] = useState<{
    search?: string;
    status?: StatusTaska;
    dueDateFrom?: string;
    dueDateTo?: string;
    category?: string;
    priority?: TaskPriority;
  }>({});

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 6;

  const {
    data: tasksResponse,
    isLoading,
    isError,
    refetch,
  } = useGetFilteredTasksQuery({
    search: filters.search,
    status: filters.status,
    dueDateFrom: filters.dueDateFrom,
    dueDateTo: filters.dueDateTo,
    priority: filters.priority,
    pageNumber,
    pageSize,
  });

  // Resetuje taskove i ucitava nove kada se korisnik promeni
  useEffect(() => {
    if (userData?.id) {
      dispatch(setTasks([]));
      setFilters({});
      setPageNumber(1);
      refetch();
      statisticsRef.current?.refetch(); // Refresh statistike
    }
  }, [userData?.id, dispatch, refetch]);

  useEffect(() => {
    if (tasksResponse?.data) {
      dispatch(setTasks(tasksResponse.data));
    }
  }, [tasksResponse, dispatch]);

  // Refetch kada aplikacija postane vidljiva
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refetch();
        statisticsRef.current?.refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPageNumber(1);
  }, []);

  const handleToggleComplete = useCallback(
    async (task: toDoTaskModel) => {
      try {
        const newStatus =
          task.status === StatusTaska.Completed
            ? StatusTaska.Pending
            : StatusTaska.Completed;

        // update u store-u
        dispatch(
          setTasks(
            tasks.map((t) =>
              t.id === task.id ? { ...t, status: newStatus } : t
            )
          )
        );

        await updateTask({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: newStatus,
          applicationUserId: task.applicationUserId,
        }).unwrap();

        // Refresh statistike nakon uspesnog update-a
        statisticsRef.current?.refetch();

        refetch();
      } catch (err) {
        console.error("Greška pri ažuriranju taska:", err);
        // vraca se na prethodno stanje u slucaju greske
        refetch();
      }
    },
    [updateTask, dispatch, tasks, refetch]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        // ukloni iz store-a
        dispatch(setTasks(tasks.filter((t) => t.id !== id)));
        await deleteTask(id).unwrap();
        toastNotify(t("toastNotify.taskDeleteSuccess"), "success");

        // Refresh statistike nakon brisanja
        statisticsRef.current?.refetch();

        refetch();
      } catch (err) {
        console.error("Greška pri brisanju taska:", err);
        refetch();
      }
    },
    [deleteTask, dispatch, tasks, refetch, t]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPageNumber(1);
  }, []);

  // da bi se filtrirani taskovi koji su stigli sa backa prikazali na frontu
  // useMemo pamti rezultat f-je dok se zavisnosti ne promene (ne filtrira se pri svakom renderu)
  const filteredTasks = useMemo(() => {
    if (!tasks || !userData?.id) return [];
    return tasks.filter((task) => {
      if (task.applicationUserId !== userData.id) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, userData?.id, filters]);

  const categories = useMemo(() => {
    const allCategories = tasks
      .map((task) => task.category)
      .filter((cat): cat is string => Boolean(cat));
    return Array.from(new Set(allCategories));
  }, [tasks]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.dueDateFrom ||
      filters.dueDateTo ||
      filters.category ||
      filters.priority
  );

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

      <UserTasksStatistic ref={statisticsRef} />

      <TaskFilter onFilterChange={handleFilterChange} categories={categories} />

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
      ) : filteredTasks.length > 0 ? (
        <>
          <div className="row g-4">
            {filteredTasks.map((task) => (
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
            totalRecords={tasksResponse?.pagination?.TotalRecords || 0}
            totalPages={tasksResponse?.pagination?.TotalPages || 1}
            pageSize={tasksResponse?.pagination?.PageSize || pageSize}
          />
        </>
      ) : hasActiveFilters ? (
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
