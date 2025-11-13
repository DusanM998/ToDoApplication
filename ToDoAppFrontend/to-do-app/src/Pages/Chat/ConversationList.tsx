// components/chat/ConversationList.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import type { ConversationPartner, Group } from "../../Interfaces";

interface ConversationListProps {
  conversationPartners: ConversationPartner[];
  onlineUsers: Set<string>;
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
  myGroups: Group[] | undefined;
  isGroupsLoading: boolean;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversationPartners,
  onlineUsers,
  selectedUserId,
  onSelect,
  myGroups,
  isGroupsLoading,
  isLoading,
}) => {
  const { t } = useTranslation();

  const formatMessageTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedPartners = [...conversationPartners].sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
  );

  return (
    <div
      className="border-end bg-white conversation-list"
      style={{
        height: "100%", 
        maxHeight: "100%",
      }}
    >
      {/* Users */}
      {isLoading ? (
        <div className="p-3 text-center">{t("chat.loading")}</div>
      ) : sortedPartners.length === 0 ? (
        <div className="p-3 text-center">{t("chat.noConversations")}</div>
      ) : (
        sortedPartners.map((partner) => (
          <div
            key={partner.userId}
            className={`p-3 border-bottom d-flex align-items-center ${
              selectedUserId === partner.userId ? "bg-light" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(partner.userId)}
          >
            {partner.profileImageUrl ? (
              <img
                src={partner.profileImageUrl}
                alt="User"
                className="rounded-circle me-3"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
            ) : (
              <div className="position-relative me-3">
                <i
                  className="bi bi-person-circle fs-3"
                  style={{ color: "#6b3a7a" }}
                ></i>
                {onlineUsers.has(partner.userId) && (
                  <span
                    className="position-absolute bottom-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle"
                    style={{ width: "10px", height: "10px" }}
                  ></span>
                )}
              </div>
            )}
            <div className="flex-grow-1">
              <div className="fw-semibold">
                {partner.email}
                {onlineUsers.has(partner.userId) && (
                  <span className="badge bg-success ms-2">Online</span>
                )}
                {partner.hasUnread && (
                  <span className="badge bg-danger ms-2">New</span>
                )}
              </div>
              <small className="text-muted d-block text-truncate">
                {partner.lastMessage}
              </small>
              <small className="text-muted d-block">
                {formatMessageTime(partner.lastMessageTime)}
              </small>
            </div>
          </div>
        ))
      )}

      {/* Groups */}
      <div className="mt-3 border-top">
        <h6 className="p-3 mb-0 fw-bold" style={{ backgroundColor: "#f0f0f0" }}>
          {t("chat.groups") || "Groups"}
        </h6>
        {isGroupsLoading ? (
          <div className="p-3 text-center">
            {t("chat.loadingGroups") || "Loading..."}
          </div>
        ) : myGroups && myGroups.length > 0 ? (
          myGroups.map((group) => (
            <div
              key={group.id}
              className={`p-3 border-bottom d-flex align-items-center ${
                selectedUserId === `group-${group.id}` ? "bg-light" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(`group-${group.id}`)}
            >
              <div className="me-3">
                <i
                  className="bi bi-people-fill fs-4"
                  style={{ color: "#6b3a7a" }}
                ></i>
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold">{group.name}</div>
                <small className="text-muted d-block text-truncate">
                  {group.messages?.length
                    ? group.messages[group.messages.length - 1].content
                    : t("chat.noMessages") || "No messages yet"}
                </small>
                <small className="text-muted d-block">
                  {group.messages?.length
                    ? formatMessageTime(
                        group.messages[group.messages.length - 1].sentAt
                      )
                    : ""}
                </small>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-center">
            {t("chat.noGroups") || "No groups found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
