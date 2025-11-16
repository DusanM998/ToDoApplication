import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form } from "react-bootstrap";
import * as signalR from "@microsoft/signalr";
import {
  useGetConversationQuery,
  useGetAllConversationsQuery,
  useMarkAsReadMutation,
  useSendMessageMutation,
} from "../../apis/messageApi";
import type { ConversationPartner, Group, Message } from "../../Interfaces";
import { useGetMyGroupsQuery } from "../../apis/groupApi";
import GroupInfoModal from "./GroupInfoModal";

interface ChatListProps {
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ currentUserId }) => {
  const { t } = useTranslation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [conversationPartners, setConversationPartners] = useState<
    ConversationPartner[]
  >([]);

  const [selectedGroupInfo, setSelectedGroupInfo] = useState<Group | null>(
    null
  );

  const [selectedImages, setSelectedImages] = useState<
    { file: File; preview: string }[]
  >([]);

  const hubConnection = useRef<signalR.HubConnection | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data: conversations,
    isLoading,
    refetch: refetchConversations,
  } = useGetAllConversationsQuery();
  const {
    data: conversation,
    isLoading: isConversationLoading,
    refetch,
  } = useGetConversationQuery(selectedUserId || "", { skip: !selectedUserId });

  const { data: myGroups, isLoading: isGroupsLoading } = useGetMyGroupsQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // SignalR Connection
  useEffect(() => {
    const token = localStorage.getItem("token");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7070/hubs/message", {
        accessTokenFactory: () => token || "",
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hubConnection.current = connection;

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err) => console.error("SignalR connection error:", err));

    return () => {
      connection.stop();
    };
  }, []);

  // Update conversation partners when conversations data changes
  useEffect(() => {
    if (conversations?.result) {
      setConversationPartners([
        ...(conversations.result as ConversationPartner[]),
      ]);
    }
  }, [conversations]);

  // Register SignalR listeners
  useEffect(() => {
    const connection = hubConnection.current;
    if (!connection) return;

    const handleReceiveMessage = (msg: any) => {
      const newMsg: Message = {
        id: msg.Id || msg.id || Date.now(),
        senderId: msg.SenderId || msg.senderId,
        receiverId: msg.ReceiverId || msg.receiverId,
        content: msg.Content || msg.content,
        sendAt: msg.SendAt || msg.sendAt || new Date().toISOString(),
        isRead: msg.IsRead || msg.isRead || false,
        sender: {
          id: msg.SenderId || msg.senderId,
          email: msg.SenderEmail || "",
          name: msg.SenderName || "",
        },
        receiver: {
          id: msg.ReceiverId || msg.receiverId,
          email: msg.ReceiverEmail || "",
          name: msg.ReceiverName || "",
        },
      };

      setRealTimeMessages((prev) => {
        // Ako je od trenutnog korisnika, zameni temp poruku (privremeni ID < 0)
        if (newMsg.senderId === currentUserId) {
          const tempIndex = prev.findIndex(
            (m) =>
              m.senderId === currentUserId &&
              m.receiverId === newMsg.receiverId &&
              m.content === newMsg.content &&
              m.id < 0
          );
          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = newMsg;
            return updated;
          }
        }

        // Ako poruka vec postoji (da izbegne duplikate)
        const exists = prev.some(
          (m) =>
            m.id === newMsg.id ||
            (m.senderId === newMsg.senderId &&
              m.receiverId === newMsg.receiverId &&
              m.content === newMsg.content &&
              Math.abs(
                new Date(m.sendAt).getTime() - new Date(newMsg.sendAt).getTime()
              ) < 5000)
        );
        if (exists) return prev;

        return [...prev, newMsg];
      });

      // Update conversationPartners with the new message
      setConversationPartners((prev) => {
        const partnerId =
          newMsg.senderId === currentUserId
            ? newMsg.receiverId
            : newMsg.senderId;
        const updatedPartners = prev.map((partner) => {
          if (partner.userId === partnerId) {
            return {
              ...partner,
              lastMessage: newMsg.content,
              lastMessageTime: newMsg.sendAt,
              hasUnread: newMsg.receiverId === currentUserId && !newMsg.isRead,
            };
          }
          return partner;
        });

        // If partner doesn't exist (new conversation), add it
        if (!updatedPartners.some((p) => p.userId === partnerId)) {
          updatedPartners.push({
            userId: partnerId,
            email:
              newMsg.senderId === currentUserId
                ? newMsg.receiver.email
                : newMsg.sender.email,
            profileImageUrl: "", // You may need to fetch this separately
            lastMessage: newMsg.content,
            lastMessageTime: newMsg.sendAt,
            hasUnread: newMsg.receiverId === currentUserId && !newMsg.isRead,
          });
        }

        return updatedPartners.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );
      });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    connection.on("UsersOnline", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    connection.on("UserOnline", (userId: string) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    connection.on("UserOffline", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    connection.on("MessageRead", (data: { MessageId: number }) => {
      setRealTimeMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.MessageId ? { ...msg, isRead: true } : msg
        )
      );
      // Update hasUnread for the conversation partner
      setConversationPartners((prev) =>
        prev.map((partner) => {
          if (
            selectedUserId === partner.userId &&
            realTimeMessages.some(
              (msg) =>
                msg.id === data.MessageId && msg.receiverId === currentUserId
            )
          ) {
            return { ...partner, hasUnread: false };
          }
          return partner;
        })
      );
    });

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("UsersOnline");
      connection.off("UserOnline");
      connection.off("UserOffline");
      connection.off("MessageRead");
    };
  }, [currentUserId, selectedUserId, realTimeMessages]);

  // Automatski oznacava kao procitanu
  useEffect(() => {
    if (selectedUserId && conversation?.result && hubConnection.current) {
      const unreadMessages = (conversation.result as Message[]).filter(
        (msg) => !msg.isRead && msg.receiverId === currentUserId
      );

      unreadMessages.forEach(async (msg) => {
        try {
          await markAsRead(msg.id);
          await hubConnection.current?.invoke(
            "NotifyMessageRead",
            msg.id,
            msg.senderId,
            msg.receiverId
          );
        } catch (err) {
          console.error("Error marking message as read:", err);
        }
      });
    }
  }, [conversation, selectedUserId, markAsRead, currentUserId]);

  // Kombinuje REST + Real Time poruke
  const displayedMessages: Message[] = useMemo(() => {
    const restMessages = (conversation?.result as Message[]) || [];
    const relevantRealTime = realTimeMessages.filter(
      (m) =>
        (m.senderId === selectedUserId && m.receiverId === currentUserId) ||
        (m.senderId === currentUserId && m.receiverId === selectedUserId)
    );

    const all = [...restMessages];
    relevantRealTime.forEach((rtMsg) => {
      const existsInRest = restMessages.some(
        (restMsg) =>
          restMsg.id === rtMsg.id ||
          (restMsg.senderId === rtMsg.senderId &&
            restMsg.receiverId === rtMsg.receiverId &&
            restMsg.content === rtMsg.content &&
            Math.abs(
              new Date(restMsg.sendAt).getTime() -
                new Date(rtMsg.sendAt).getTime()
            ) < 5000)
      );

      if (!existsInRest) {
        all.push(rtMsg);
      }
    });

    const unique = Array.from(new Map(all.map((m) => [m.id, m])).values()).sort(
      (a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime()
    );

    return unique;
  }, [conversation, realTimeMessages, selectedUserId, currentUserId]);

  // Da mi odmah skroluje na dno chata
  useEffect(() => {
    if (messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [displayedMessages.length]);

  // Reset messages on conversation change
  useEffect(() => {
    if (selectedUserId) {
      setRealTimeMessages([]);
      refetch();
    }
  }, [selectedUserId, refetch]);

  // Send message
  const handleSendMessage = async () => {
    if (
      !selectedUserId ||
      (!newMessage.trim() && selectedImages.length === 0) ||
      !hubConnection.current
    )
      return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const tempMsg: Message = {
        id: -Date.now(),
        senderId: currentUserId,
        receiverId: selectedUserId,
        content: messageContent,
        sendAt: new Date().toISOString(),
        isRead: false,
        sender: { id: currentUserId, email: "", name: "" },
        receiver: { id: selectedUserId, email: "", name: "" },
        imageUrls: selectedImages.map((img) => img.preview),
      };

      setRealTimeMessages((prev) => [...prev, tempMsg]);

      // Update conversationPartners with the new sent message
      setConversationPartners((prev) => {
        const updatedPartners = prev.map((partner) => {
          if (partner.userId === selectedUserId) {
            return {
              ...partner,
              lastMessage: messageContent || "[Image]",
              lastMessageTime: tempMsg.sendAt,
              hasUnread: false,
            };
          }
          return partner;
        });

        // If partner doesn't exist, add it
        if (!updatedPartners.some((p) => p.userId === selectedUserId)) {
          updatedPartners.push({
            userId: selectedUserId,
            email: tempMsg.receiver.email,
            profileImageUrl: "",
            lastMessage: messageContent || "[Image]",
            lastMessageTime: tempMsg.sendAt,
            hasUnread: false,
          });
        }

        return updatedPartners.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );
      });

      // Posalji kroz SignalR (samo tekst poruke)
      await hubConnection.current.invoke(
        "SendMessage",
        currentUserId,
        selectedUserId,
        messageContent
      );

      // Posalji na backend (REST API) sa FormData
      await sendMessage({
        receiverId: selectedUserId,
        content: messageContent,
        images: selectedImages.map((img) => img.file), // samo fajlovi
      }).unwrap();

      // Ocisti slike nakon uspesnog slanja
      setSelectedImages([]);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(t("chat.sendError"));
      setNewMessage(messageContent);
    }
  };

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
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

  const sortedConversationPartners = useMemo(() => {
    return conversationPartners.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );
  }, [conversationPartners]);

  const selectedPartner = conversationPartners.find(
    (p) => p.userId === selectedUserId
  );

  const isGroupChat = selectedUserId?.startsWith("group-");
  const selectedGroup = isGroupChat
    ? myGroups?.data?.result.find((g) => "group-" + g.id === selectedUserId)
    : null;

  return (
    <div className="d-flex h-100" style={{ height: "100vh" }}>
      {/* Conversation List */}
      <div
        className="border-end bg-white"
        style={{ width: "350px", overflowY: "auto" }}
      >
        {isLoading ? (
          <div className="p-3 text-center">{t("chat.loading")}</div>
        ) : sortedConversationPartners.length === 0 ? (
          <div className="p-3 text-center">{t("chat.noConversations")}</div>
        ) : (
          sortedConversationPartners.map((partner) => (
            <div
              key={partner.userId}
              className={`p-3 border-bottom d-flex align-items-center ${
                selectedUserId === partner.userId ? "bg-light" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedUserId(partner.userId)}
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
        {/* Groups Section */}
        <div className="mt-3 border-top">
          <h6
            className="p-3 mb-0 fw-bold"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            {t("chat.groups") || "Groups"}
          </h6>
          {isGroupsLoading ? (
            <div className="p-3 text-center">
              {t("chat.loadingGroups") || "Loading..."}
            </div>
          ) : myGroups?.data?.result && myGroups.data.result.length > 0 ? (
            myGroups.data.result.map((group) => (
              <div
                key={group.id}
                className={`p-3 border-bottom d-flex align-items-center ${
                  selectedUserId === "group-" + group.id ? "bg-light" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedUserId("group-" + group.id)}
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
                      ? new Date(
                          group.messages[group.messages.length - 1].sendAt
                        ).toLocaleString("sr-RS", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
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

      {/* Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {selectedUserId && (
          <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {selectedUserId.startsWith("group-") ? (
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
                  {selectedUserId.startsWith("group-")
                    ? myGroups?.data?.result.find(
                        (g) => "group-" + g.id === selectedUserId
                      )?.name || "Unknown Group"
                    : selectedPartner?.email || t("chat.unknownUser")}
                </div>
                <div
                  className={`small ${
                    selectedUserId.startsWith("group-")
                      ? "text-muted"
                      : onlineUsers.has(selectedPartner?.userId || "")
                      ? "text-success"
                      : "text-muted"
                  }`}
                >
                  {selectedUserId.startsWith("group-")
                    ? "Group Chat"
                    : onlineUsers.has(selectedPartner?.userId || "")
                    ? t("chat.online") || "Online"
                    : t("chat.offline") || "Offline"}
                </div>
              </div>
            </div>
          </div>
        )}
        <GroupInfoModal
          group={selectedGroupInfo}
          onClose={() => setSelectedGroupInfo(null)}
        />

        <div
          ref={messagesContainerRef}
          className="flex-grow-1 p-3"
          style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
        >
          <div
            ref={messagesContainerRef}
            className="flex-grow-1 p-3"
            style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
          >
            {isConversationLoading && !isGroupChat ? (
              <div className="p-3 text-center">{t("chat.loading")}</div>
            ) : !selectedUserId ? (
              <div className="text-center">{t("chat.selectChat")}</div>
            ) : isGroupChat ? (
              selectedGroup?.messages?.length ? (
                selectedGroup.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded mb-2 ${
                      msg.senderId === currentUserId
                        ? "ms-auto text-white"
                        : "bg-white"
                    }`}
                    style={{
                      maxWidth: "70%",
                      backgroundColor:
                        msg.senderId === currentUserId ? "#6b3a7a" : "#ffffff",
                    }}
                  >
                    <div>{msg.content}</div>
                    <div className="d-flex align-items-center justify-content-end mt-1 gap-1">
                      <small
                        className={
                          msg.senderId === currentUserId
                            ? "text-light"
                            : "text-muted"
                        }
                      >
                        {formatMessageTime(msg.sendAt)}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">
                  {t("chat.noMessages") || "No messages yet"}
                </div>
              )
            ) : displayedMessages.length === 0 ? (
              <div className="text-center">{t("chat.noMessages")}</div>
            ) : (
              displayedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded mb-2 ${
                    msg.senderId === currentUserId
                      ? "ms-auto text-white"
                      : "bg-white"
                  }`}
                  style={{
                    maxWidth: "70%",
                    backgroundColor:
                      msg.senderId === currentUserId ? "#6b3a7a" : "#ffffff",
                  }}
                >
                  {msg.imageUrls && (
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

                  {msg.content && <div>{msg.content}</div>}
                  <div className="d-flex align-items-center justify-content-end mt-1 gap-1">
                    <small
                      className={
                        msg.senderId === currentUserId
                          ? "text-light"
                          : "text-muted"
                      }
                    >
                      {formatMessageTime(msg.sendAt)}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedUserId && (
          <div className="p-3 border-top bg-white">
            {/* Prikaz minijatura izabranih slika */}
            {selectedImages.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2 p-2 bg-light rounded">
                {selectedImages.map((img, index) => (
                  <div
                    key={index}
                    className="position-relative"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <img
                      src={img.preview}
                      alt="preview"
                      className="rounded"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      className="btn-close position-absolute top-0 end-0 bg-danger text-white rounded-circle"
                      style={{
                        fontSize: "10px",
                        width: "16px",
                        height: "16px",
                      }}
                      onClick={() => removeImage(index)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="input-group">
              <Form.Control
                type="text"
                placeholder={t("chat.typeMessage")}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isSending}
                style={{ borderRadius: "20px 0 0 0" }}
              />

              {/* Dugme za izbor slike */}
              <label
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                style={{
                  borderRadius: "0",
                  borderLeft: "none",
                  borderRight: "none",
                }}
              >
                <i className="bi bi-image"></i>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageSelect}
                />
              </label>

              <Button
                onClick={handleSendMessage}
                disabled={
                  isSending ||
                  (!newMessage.trim() && selectedImages.length === 0)
                }
                style={{
                  borderRadius: "0 20px 20px 0",
                  backgroundColor: "#6b3a7a",
                  border: "none",
                  opacity:
                    isSending ||
                    (!newMessage.trim() && selectedImages.length === 0)
                      ? 0.6
                      : 1,
                }}
              >
                <i className="bi bi-send"></i>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
