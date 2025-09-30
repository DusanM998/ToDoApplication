import { useTranslation } from "react-i18next";
import {
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../../apis/taskApi";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { MainLoader } from "../../Components/Layout/Common";
import type { toDoTaskModel } from "../../Interfaces";
import TasksTable from "../Task/TaskTable";
import { MyTaskPagination } from "../Task";

// Komponenta gde admin moze samo da vrsi pregled svih taskova za sve korisnike
const ViewAllTasks: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 6; // Match MyTasks
  const { data: tasks, isLoading, isError, refetch } = useGetAllTasksQuery();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [paginatedTasks, setPaginatedTasks] = useState<toDoTaskModel[]>([]);

  // useEffect za paginaciju na klijentskoj strani
  useEffect(() => {
    if (tasks) {
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setPaginatedTasks(tasks.slice(startIndex, endIndex));
    }
  }, [tasks, pageNumber, pageSize]);

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

  const handleToggleComplete = useCallback(
    async (task: toDoTaskModel) => {
      try {
        const newStatus =
          task.status === StatusTaska.Completed
            ? StatusTaska.Pending
            : StatusTaska.Completed;
        await updateTask({ id: task.id, status: newStatus }).unwrap();
      } catch (error) {
        console.error("Greška pri ažuriranju taska:", error);
      }
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteTask(id).unwrap();
      } catch (error) {
        console.error("Greška pri brisanju taska:", error);
      }
    },
    [deleteTask]
  );

  console.log(tasks);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <MainLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger m-5" role="alert">
        {t("common.error")}
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ marginTop: "50px" }}>
      <h2 className="mb-4 text-center fw-bold" style={{ color: "#51285f" }}>
        {t("adminTasksPage.title")}
      </h2>
      {tasks && tasks.length > 0 ? (
        <>
          <TasksTable
            tasks={paginatedTasks}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            navigate={navigate}
          />
          <MyTaskPagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            totalRecords={tasks.length}
            totalPages={Math.ceil(tasks.length / pageSize)}
            pageSize={pageSize}
          />
        </>
      ) : (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <p className="text-secondary fw-medium">
            {t("adminTasksPage.noTasks")}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewAllTasks;
