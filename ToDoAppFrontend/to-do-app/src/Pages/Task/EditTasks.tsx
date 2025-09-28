import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTasksQuery, useUpdateTaskMutation } from "../../apis/taskApi";
import type { toDoTaskModel } from "../../Interfaces";
import { MainLoader } from "../../Components/Layout/Common";
import { toastNotify } from "../../Helper";

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: tasks, isLoading } = useGetTasksQuery();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const [task, setTask] = useState<toDoTaskModel | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Pronađi task na osnovu id
  useEffect(() => {
    if (tasks && id) {
      const foundTask = tasks.find((t) => t.id === Number(id));
      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description || "");
        setDueDate(foundTask.dueDate || "");
      }
    }
  }, [tasks, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      await updateTask({
        id: task.id,
        title,
        description,
        dueDate,
        isCompleted: task.isCompleted,
        applicationUserId: task.applicationUserId,
      }).unwrap();

      navigate("/tasks/myTasks"); // posle uspesne izmene vodi nazad na listu
      toastNotify(t("toastNotify.taskUpdateSuccess"), "success");
    } catch (err) {
      console.error("Greška pri ažuriranju taska:", err);
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
          <label className="form-label">
            {t("editTaskPage.descriptionLabel")}
          </label>
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
            value={dueDate ? dueDate.split("T")[0] : ""}
            onChange={(e) => setDueDate(e.target.value)}
          />
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
          onClick={() => navigate("/tasks/myTasks")}
        >
          {t("editTaskPage.back")}
        </button>
      </form>
    </div>
  );
};

export default EditTask;
