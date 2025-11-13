// components/chat/MessageList.tsx
import React, { useEffect, useRef } from "react";
import type { Message, GroupMessage, Group } from "../../Interfaces";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroupChat: boolean;
  selectedGroup: Group | null;
  isConversationLoading: boolean;
  selectedUserId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroupChat,
  selectedGroup,
  isConversationLoading,
  selectedUserId,
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const getImageUrls = (imageUrls: string | string[] | undefined): string[] => {
    if (!imageUrls) return [];
    if (Array.isArray(imageUrls)) {
      return imageUrls.filter((url) => url && url.trim() !== "");
    }
    return imageUrls
      .split(";")
      .map((url) => url.trim())
      .filter((url) => url !== "");
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  if (!selectedUserId) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
        Select a chat to start messaging
      </div>
    );
  }

  if (isConversationLoading && !isGroupChat) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        Loading messages...
      </div>
    );
  }

  const displayMessages = isGroupChat
    ? (selectedGroup?.messages as GroupMessage[] | undefined) || []
    : messages;

  if (displayMessages.length === 0) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
        No messages yet
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-grow-1 p-3"
      style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
    >
      {displayMessages.map((msg) => {
        // Ujednačeno vreme: koristi `sentAt` za oba tipa
        const time = "sentAt" in msg ? msg.sentAt : (msg as Message).sendAt;

        return (
          <div
            key={msg.id}
            className={`p-3 rounded mb-2 ${
              msg.senderId === currentUserId ? "ms-auto text-white" : "bg-white"
            }`}
            style={{
              maxWidth: "70%",
              backgroundColor:
                msg.senderId === currentUserId ? "#6b3a7a" : "#ffffff",
            }}
          >
            {/* Slike */}
            {"imageUrls" in msg && msg.imageUrls && (
              <div className="mt-2">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns:
                      getImageUrls(msg.imageUrls).length === 1
                        ? "1fr"
                        : getImageUrls(msg.imageUrls).length === 2
                        ? "1fr 1fr"
                        : "repeat(auto-fit, minmax(80px, 1fr))",
                    maxHeight: "300px",
                    overflow: "hidden",
                  }}
                >
                  {getImageUrls(msg.imageUrls).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`attachment-${index}`}
                      className="rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        width: "100%",
                        height:
                          getImageUrls(msg.imageUrls).length === 1
                            ? "180px"
                            : getImageUrls(msg.imageUrls).length === 2
                            ? "140px"
                            : "100px",
                      }}
                      onClick={() => window.open(url, "_blank")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tekst */}
            {msg.content && <div>{msg.content}</div>}

            {/* Vreme */}
            <div className="d-flex align-items-center justify-content-end mt-1 gap-1">
              <small
                className={
                  msg.senderId === currentUserId ? "text-light" : "text-muted"
                }
              >
                {formatMessageTime(time)}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
