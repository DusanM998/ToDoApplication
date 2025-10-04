import React, { useState } from "react";
import { StatusTaska } from "../../Interfaces/StatusTaska";
import { useTranslation } from "react-i18next";
import type { userModel } from "../../Interfaces";

interface UserCardProps {
  user: userModel & { role?: string; tasks?: any[] };
}

// Komponenta predstavlja karticu za korisnika kojeg admin vidi samo
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="rounded-circle me-3"
              style={{ width: "64px", height: "64px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#51285f",
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {user.name?.[0] || "?"}
            </div>
          )}
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
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>
                {t("myTasksPage.summary.total")} ({user.tasks.length})
              </span>
              <i
                className={`bi ${
                  isOpen ? "bi-chevron-up" : "bi-chevron-down"
                } text-white`}
              ></i>
            </button>

            {isOpen && (
              <ul className="list-group list-group-flush mt-2">
                {user.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{task.title}</span>
                    <span
                      className={`badge rounded-pill ${
                        task.status === StatusTaska.Completed
                          ? "badge-completed"
                          : task.status === StatusTaska.Overdue
                          ? "badge-overdue"
                          : "badge-pending"
                      }`}
                    >
                      {task.status === StatusTaska.Pending
                        ? t("myTasksPage.summary.pending")
                        : task.status === StatusTaska.Completed
                        ? t("myTasksPage.summary.completed")
                        : t("myTasksPage.summary.notCompleted")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
