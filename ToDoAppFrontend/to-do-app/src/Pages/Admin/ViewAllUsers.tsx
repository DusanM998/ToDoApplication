import React, { useState } from "react";
import { useGetAllUsersQuery } from "../../apis/authApi";
import type { userModel } from "../../Interfaces";
import "./viewAllUsers.css";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import { useTranslation } from "react-i18next";

const ViewAllUsers: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetAllUsersQuery(undefined);
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (userId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const statusTextMap: Record<StatusTaska, string> = {
    [StatusTaska.Pending]: t("myTasksPage.summary.completed"),
    [StatusTaska.Completed]: t("myTasksPage.summary.completed"),
    [StatusTaska.Overdue]: t("myTasksPage.summary.notCompleted"),
  };

  if (isLoading)
    return <p className="text-center text-muted">{t("myTasksPage.loading")}</p>;
  if (isError)
    return <p className="text-center text-danger">{t("myTasksPage.error")}</p>;

  return (
    <div className="container py-4" style={{ marginTop: "50px" }}>
      <h2 className="display-6 fw-bold mb-4 text-primary-custom">
        {t("header.viewUsers")}
      </h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {data?.result.map(
          (user: userModel & { role?: string; tasks?: any[] }) => (
            <div key={user.id} className="col">
              <div
                className={`card shadow-sm ${
                  user.tasks && user.tasks.length > 0
                    ? user.tasks.some(
                        (task) => task.status === StatusTaska.Completed
                      )
                      ? "border-completed"
                      : user.tasks.some(
                          (task) => task.status === StatusTaska.Overdue
                        )
                      ? "border-overdue"
                      : "border-pending"
                    : ""
                }`}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="rounded-circle me-3"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h5 className="card-title mb-1">{user.name}</h5>
                      <p className="card-text text-muted small">{user.email}</p>
                    </div>
                  </div>
                  <p className="card-text small">
                    {t("userPage.phone")}: {user.phoneNumber || "N/A"}
                  </p>
                  <p className="card-text small fw-medium">
                    {t("userPage.role")}: {user.role || "N/A"}
                  </p>
                  {user.tasks && user.tasks.length > 0 && (
                    <div className="mt-3">
                      <button
                        className="btn btn-primary-custom w-100 d-flex justify-content-between align-items-center text-white"
                        onClick={() => toggleDropdown(user.id)}
                      >
                        <span>
                          {t("myTasksPage.title")} ({user.tasks.length})
                        </span>
                        <i
                          className={`bi ${
                            openDropdowns[user.id]
                              ? "bi-chevron-up"
                              : "bi-chevron-down"
                          } text-white`}
                        ></i>
                      </button>
                      {openDropdowns[user.id] && (
                        <ul className="list-group list-group-flush mt-2">
                          {user.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <span>{task.title}</span>
                              <span
                                className={`badge ${
                                  task.status === StatusTaska.Completed
                                    ? "badge-completed"
                                    : task.status === StatusTaska.Overdue
                                    ? "badge-overdue"
                                    : "badge-pending"
                                } rounded-pill`}
                              >
                                {statusTextMap[task.status]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ViewAllUsers;
