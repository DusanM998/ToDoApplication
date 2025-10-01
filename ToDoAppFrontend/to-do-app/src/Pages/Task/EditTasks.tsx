import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTaskByIdQuery, useUpdateTaskMutation } from "../../apis/taskApi";
import { MainLoader } from "../../Components/Layout/Common";
import { toastNotify } from "../../Helper";
import { MenuItem, TextField } from "@mui/material";
import type { TaskPriority } from "../../Interfaces/TaskPriority";
import { TaskPriority as TaskPriorityConst } from "../../Interfaces/TaskPriority";

// Komponenta za edit taskova
const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Dohvatanje taska po ID-u
  const { data: task, isLoading } = useGetTaskByIdQuery(Number(id));
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Lokalni state za formu
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriorityConst.Normal);

  // Inicijalizacija forme kada task stigne
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setPriority(task.priority as TaskPriority);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      await updateTask({
        id: task.id,
        title,
        description,
        dueDate,
        priority,
        status: task.status,
        applicationUserId: task.applicationUserId,
      }).unwrap();

      toastNotify(t("toastNotify.taskUpdateSuccess"), "success");
      navigate("/tasks/myTasks"); // posle uspešne izmene vodi nazad na listu
    } catch (err) {
      console.error("Greška pri ažuriranju taska:", err);
      toastNotify(t("toastNotify.taskUpdateError"), "error");
    }
  };

  if (isLoading || !task) {
    return (
      <div className="flex justify-center items-center h-64">
        <MainLoader />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ marginTop: "50px" }}>
      <h2 className="fw-bold mb-4">{t("editTaskPage.title")}</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">{t("editTaskPage.titleLabel")}</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("editTaskPage.descriptionLabel")}</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("editTaskPage.dueDateLabel")}</label>
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <TextField
            select
            label={t("createTaskPage.priorityLabel")}
            name="priority"
            value={priority}
            onChange={(e) =>
              setPriority(parseInt(e.target.value, 10) as TaskPriority)
            }
            fullWidth
            className="mb-3"
          >
            <MenuItem value={TaskPriorityConst.Low}>{t("createTaskPage.low")}</MenuItem>
            <MenuItem value={TaskPriorityConst.Normal}>{t("createTaskPage.medium")}</MenuItem>
            <MenuItem value={TaskPriorityConst.High}>{t("createTaskPage.high")}</MenuItem>
          </TextField>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ backgroundColor: "#51285f", borderColor: "#51285f" }}
          disabled={isUpdating}
        >
          {isUpdating ? t("editTaskPage.saving") : t("editTaskPage.save")}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: "10px" }}
          onClick={() => navigate(-1)}
        >
          {t("editTaskPage.back")}
        </button>
      </form>
    </div>
  );
};

export default EditTask;
