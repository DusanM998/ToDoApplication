import React, { useState } from "react";
import { TextField, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { toastNotify } from "../../Helper";
import { useCreateTaskMutation } from "../../apis/taskApi";
import type toDoTaskModel from "../../Interfaces/toDoTaskModel";
import { useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import { useTranslation } from "react-i18next";
import type { TaskPriority } from "../../Interfaces/TaskPriority";

function CreateTask() {
  const navigate = useNavigate();
  const [createTask] = useCreateTaskMutation();

  const userData = useSelector((state: RootState) => state.userAuthStore);
  const isLoggedIn = !!userData?.id;

  const { t } = useTranslation();

  const [taskInputs, setTaskInputs] = useState<Partial<toDoTaskModel>>({
    title: "",
    description: "",
    dueDate: undefined,
    category: "",
    priority: 2, // default Normal
  });

  if (!isLoggedIn) {
    toastNotify(t("createTaskPage.mustLogin"), "error");
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskInputs.title) {
      toastNotify(t("createTaskPage.titleRequired"), "error");
      return;
    }

    try {
      await createTask(taskInputs).unwrap();
      toastNotify(t("createTaskPage.success"), "success");
      navigate("/tasks/myTasks");
    } catch (err) {
      toastNotify(t("createTaskPage.error"), "error");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="container py-5" style={{ marginTop: "80px" }}>
        <h1 className="mb-4">{t("createTaskPage.title")}</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label={t("createTaskPage.titleLabel")}
            name="title"
            value={taskInputs.title || ""}
            onChange={(e) =>
              setTaskInputs((prev) => ({ ...prev, title: e.target.value }))
            }
            fullWidth
            required
            className="mb-3"
          />

          <TextField
            label={t("createTaskPage.descriptionLabel")}
            name="description"
            value={taskInputs.description || ""}
            onChange={(e) =>
              setTaskInputs((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            fullWidth
            multiline
            className="mb-3"
          />

          <DatePicker
            label={t("createTaskPage.dueDateLabel")}
            value={taskInputs.dueDate ? new Date(taskInputs.dueDate) : null}
            onChange={(newDate) =>
              setTaskInputs((prev) => ({
                ...prev,
                dueDate: newDate ? newDate.toISOString() : undefined,
              }))
            }
            slotProps={{ textField: { fullWidth: true, className: "mb-3" } }}
          />

          <TextField
            label={t("createTaskPage.categoryLabel")}
            name="category"
            value={taskInputs.category || ""}
            onChange={(e) =>
              setTaskInputs((prev) => ({ ...prev, category: e.target.value }))
            }
            fullWidth
            className="mb-3"
          />

          <TextField
            select
            label={t("createTaskPage.priorityLabel")}
            name="priority"
            value={taskInputs.priority || 2}
            onChange={(e) =>
              setTaskInputs((prev) => ({
                ...prev,
                priority: parseInt(e.target.value, 10) as TaskPriority,
              }))
            }
            fullWidth
            className="mb-3"
          >
            <MenuItem value={1}>{t("createTaskPage.low")}</MenuItem>
            <MenuItem value={2}>{t("createTaskPage.medium")}</MenuItem>
            <MenuItem value={3}>{t("createTaskPage.high")}</MenuItem>
          </TextField>

          <div className="d-flex gap-3 mt-3">
            <button className="btn btn-success" type="submit">
              {t("createTaskPage.saveBtn")}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/")}
            >
              {t("createTaskPage.cancelBtn")}
            </button>
          </div>
        </form>
      </div>
    </LocalizationProvider>
  );
}

export default CreateTask;
