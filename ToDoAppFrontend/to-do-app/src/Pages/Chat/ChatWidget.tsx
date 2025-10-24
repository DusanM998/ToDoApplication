import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import { Modal, Button, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./ChatWidget.css";
import NewChatForm from "./NewChatForm";
import ChatList from "./ChatList";
import { useSendMessageMutation } from "../../apis/messageApi";

const ChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const userData = useSelector((state: RootState) => state.userAuthStore);
  const [showModal, setShowModal] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [activeTab, setActiveTab] = useState<"newChat" | "chatList">("newChat");
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  if (!userData?.id) {
    return null;
  }

  const handleSendMessage = async (content: string, receiverEmail: string) => {
    if (!receiverEmail || !content) {
      alert(t("chat.validationError"));
      return;
    }

    try {
      const response = await sendMessage({ receiverEmail, content }).unwrap();
      if (response.data?.isSuccess) {
        setMessageContent("");
        alert(t("chat.sentSuccess"));
      } else {
        alert(response.data?.errorMessage?.join(", ") || t("chat.sendError"));
      }
    } catch (error) {
      alert(t("chat.sendError"));
    }
  };

  return (
    <>
      <button
        className="btn position-fixed bottom-0 end-0 m-3 m-md-4 shadow-lg chat-icon"
        style={{
          backgroundColor: "#51285f",
          borderColor: "#51285f",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          border: "none",
          transition: "transform 0.3s ease",
        }}
        onClick={() => setShowModal(true)}
        title={t("chat.title")}
      >
        <i className="bi bi-chat-dots-fill fs-4 text-white"></i>
      </button>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setReceiverEmail("");
          setMessageContent("");
        }}
        centered
        dialogClassName="chat-modal"
        size="lg"
        backdrop="static"
        keyboard={false}
        animation={false}
      >
        <Modal.Header
          closeButton
          className="bg-light border-bottom"
          style={{ padding: "1rem 1.5rem", borderColor: "#51285f" }}
        >
          <Modal.Title className="fw-bold" style={{ color: "#51285f" }}>
            {t("chat.title")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          <Nav
            variant="tabs"
            defaultActiveKey="newChat"
            onSelect={(selectedKey) =>
              setActiveTab(selectedKey as "newChat" | "chatList")
            }
            className="bg-white border-bottom"
            style={{ padding: "0.5rem 1rem", borderColor: "#51285f" }}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="newChat"
                style={{ color: "#51285f" }}
                active={activeTab === "newChat"}
                className="hover-bg-light-purple"
              >
                <i className="bi bi-plus-circle me-1"></i>
                {t("chat.newChat")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="chatList"
                style={{ color: "#51285f" }}
                active={activeTab === "chatList"}
                className="hover-bg-light-purple"
              >
                <i className="bi bi-chat-square-text me-1"></i>
                {t("chat.myChats")}
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === "newChat" ? (
            <NewChatForm
              receiverEmail={receiverEmail}
              setReceiverEmail={setReceiverEmail}
              messageContent={messageContent}
              setMessageContent={setMessageContent}
              handleSendMessage={handleSendMessage}
              userEmail={userData.email}
            />
          ) : (
            <ChatList currentUserId={userData.id} />
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderColor: "#51285f" }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setReceiverEmail("");
              setMessageContent("");
            }}
            style={{
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              borderRadius: "25px",
            }}
          >
            {t("chat.close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ChatWidget;