// components/chat/ChatHeader.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import type { ConversationPartner, Group } from "../../Interfaces";

interface ChatHeaderProps {
  selectedUserId: string | null;
  selectedPartner: ConversationPartner | undefined;
  onlineUsers: Set<string>;
  selectedGroup: Group | undefined;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedUserId,
  selectedPartner,
  onlineUsers,
  selectedGroup,
}) => {
  const { t } = useTranslation();
  const isGroupChat = selectedUserId?.startsWith("group-");

  if (!selectedUserId) return null;

  return (
    <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        {isGroupChat ? (
          <div className="position-relative me-3">
            <i
              className="bi bi-people-fill fs-1"
              style={{ color: "#6b3a7a" }}
            ></i>
          </div>
        ) : selectedPartner?.profileImageUrl ? (
          <div className="position-relative me-3">
            <img
              src={selectedPartner.profileImageUrl}
              alt="User"
              className="rounded-circle"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                border: "2px solid #6b3a7a",
              }}
            />
            {onlineUsers.has(selectedPartner.userId) && (
              <span
                className="position-absolute bottom-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle"
                style={{ width: "12px", height: "12px" }}
              ></span>
            )}
          </div>
        ) : (
          <div className="position-relative me-3">
            <i
              className="bi bi-person-circle fs-1"
              style={{ color: "#6b3a7a" }}
            ></i>
          </div>
        )}
        <div>
          <div className="fw-semibold">
            {isGroupChat
              ? selectedGroup?.name || "Unknown Group"
              : selectedPartner?.email || t("chat.unknownUser")}
          </div>
          <div
            className={`small ${
              isGroupChat
                ? "text-muted"
                : onlineUsers.has(selectedPartner?.userId || "")
                ? "text-success"
                : "text-muted"
            }`}
          >
            {isGroupChat
              ? "Group Chat"
              : onlineUsers.has(selectedPartner?.userId || "")
              ? t("chat.online") || "Online"
              : t("chat.offline") || "Offline"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
