import { useState } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface NewChatFormProps {
  receiverEmail: string;
  setReceiverEmail: (email: string) => void;
  messageContent: string;
  setMessageContent: (content: string) => void;
  handleSendMessage: (content: string, receiver: string | string[], groupName?: string) => Promise<void>;
  userEmail: string;
}

const NewChatForm: React.FC<NewChatFormProps> = ({
  receiverEmail,
  setReceiverEmail,
  messageContent,
  setMessageContent,
  handleSendMessage,
  userEmail,
}) => {
  const { t } = useTranslation();
  const [chatType, setChatType] = useState<"individual" | "group">("individual");
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [tempMemberEmail, setTempMemberEmail] = useState("");

  // Handle confirming the email or group setup
  const handleConfirm = () => {
    if (chatType === "individual" && !receiverEmail.includes("@")) {
      alert(t("chat.validationError"));
      return;
    }
    if (chatType === "group" && (!groupName.trim() || groupMembers.length === 0)) {
      alert(t("chat.groupValidationError"));
      return;
    }
    setIsEmailConfirmed(true);
  };

  // Add a member to the group
  const handleAddMember = () => {
    if (!tempMemberEmail.includes("@") || tempMemberEmail === userEmail) {
      alert(t("chat.invalidMemberEmail"));
      return;
    }
    if (!groupMembers.includes(tempMemberEmail)) {
      setGroupMembers([...groupMembers, tempMemberEmail]);
      setTempMemberEmail("");
    }
  };

  // Remove a member from the group
  const handleRemoveMember = (email: string) => {
    setGroupMembers(groupMembers.filter((member) => member !== email));
  };

  // Handle sending the message
  const handleSend = async () => {
    if (!messageContent.trim()) return;

    try {
      if (chatType === "individual") {
        await handleSendMessage(messageContent, receiverEmail);
      } else {
        await handleSendMessage(messageContent, groupMembers, groupName);
      }
      setMessageContent("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(t("chat.sendError"));
    }
  };

  return (
    <div className="d-flex flex-column h-100">
      {!isEmailConfirmed && (
        <div className="p-3 border-bottom bg-white" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          {/* Chat Type Toggle */}
          <Form.Group controlId="chatType" className="mb-3">
            <Form.Label className="fw-semibold" style={{ color: "#51285f" }}>
              {t("chat.chatType")}
            </Form.Label>
            <div className="d-flex gap-2">
              <Button
                variant={chatType === "individual" ? "primary" : "outline-primary"}
                onClick={() => setChatType("individual")}
                style={{
                  backgroundColor: chatType === "individual" ? "#51285f" : "transparent",
                  borderColor: "#51285f",
                  color: chatType === "individual" ? "#fff" : "#51285f",
                  borderRadius: "25px",
                  padding: "0.5rem 1rem",
                  transition: "all 0.3s ease",
                }}
              >
                {t("chat.individualChat")}
              </Button>
              <Button
                variant={chatType === "group" ? "primary" : "outline-primary"}
                onClick={() => setChatType("group")}
                style={{
                  backgroundColor: chatType === "group" ? "#51285f" : "transparent",
                  borderColor: "#51285f",
                  color: chatType === "group" ? "#fff" : "#51285f",
                  borderRadius: "25px",
                  padding: "0.5rem 1rem",
                  transition: "all 0.3s ease",
                }}
              >
                {t("chat.groupChat")}
              </Button>
            </div>
          </Form.Group>

          {chatType === "individual" ? (
            <Form.Group controlId="receiverEmail">
              <Form.Label className="fw-semibold" style={{ color: "#51285f" }}>
                {t("chat.receiverEmail")}
              </Form.Label>
              <div className="input-group">
                <Form.Control
                  type="email"
                  placeholder={t("chat.receiverPlaceholder")}
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  style={{
                    borderRadius: "25px 0 0 25px",
                    borderColor: "#51285f",
                    padding: "0.6rem 1rem",
                    backgroundColor: "#f8f9fa",
                    transition: "border-color 0.3s ease",
                  }}
                />
                <Button
                  onClick={handleConfirm}
                  style={{
                    backgroundColor: "#51285f",
                    borderColor: "#51285f",
                    borderRadius: "0 25px 25px 0",
                    padding: "0.5rem 1rem",
                    transition: "background-color 0.3s ease",
                  }}
                  className="hover-bg-dark-purple"
                  disabled={!receiverEmail.includes("@")}
                >
                  {t("chat.confirm")}
                </Button>
              </div>
            </Form.Group>
          ) : (
            <>
              <Form.Group controlId="groupName" className="mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#51285f" }}>
                  {t("chat.groupName")}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("chat.groupNamePlaceholder")}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{
                    borderRadius: "25px",
                    borderColor: "#51285f",
                    padding: "0.6rem 1rem",
                    backgroundColor: "#f8f9fa",
                    transition: "border-color 0.3s ease",
                  }}
                />
              </Form.Group>
              <Form.Group controlId="groupMembers">
                <Form.Label className="fw-semibold" style={{ color: "#51285f" }}>
                  {t("chat.groupMembers")}
                </Form.Label>
                <div className="input-group mb-2">
                  <Form.Control
                    type="email"
                    placeholder={t("chat.addMemberPlaceholder")}
                    value={tempMemberEmail}
                    onChange={(e) => setTempMemberEmail(e.target.value)}
                    style={{
                      borderRadius: "25px 0 0 25px",
                      borderColor: "#51285f",
                      padding: "0.6rem 1rem",
                      backgroundColor: "#f8f9fa",
                      transition: "border-color 0.3s ease",
                    }}
                  />
                  <Button
                    onClick={handleAddMember}
                    style={{
                      backgroundColor: "#51285f",
                      borderColor: "#51285f",
                      borderRadius: "0 25px 25px 0",
                      padding: "0.5rem 1rem",
                      transition: "background-color 0.3s ease",
                    }}
                    className="hover-bg-dark-purple"
                    disabled={!tempMemberEmail.includes("@") || tempMemberEmail === userEmail}
                  >
                    {t("chat.addMember")}
                  </Button>
                </div>
                {groupMembers.length > 0 && (
                  <ListGroup className="mb-3" style={{ maxHeight: "150px", overflowY: "auto", borderRadius: "10px" }}>
                    {groupMembers.map((member) => (
                      <ListGroup.Item
                        key={member}
                        className="d-flex justify-content-between align-items-center"
                        style={{ borderColor: "#51285f", backgroundColor: "#f8f9fa" }}
                      >
                        {member}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                          style={{
                            backgroundColor: "#dc3545",
                            borderColor: "#dc3545",
                            borderRadius: "15px",
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form.Group>
              <Button
                onClick={handleConfirm}
                style={{
                  backgroundColor: "#51285f",
                  borderColor: "#51285f",
                  borderRadius: "25px",
                  padding: "0.5rem 1rem",
                  transition: "background-color 0.3s ease",
                }}
                className="hover-bg-dark-purple w-100"
                disabled={!groupName.trim() || groupMembers.length === 0}
              >
                {t("chat.createGroup")}
              </Button>
            </>
          )}
        </div>
      )}

      {isEmailConfirmed && (
        <>
          <div
            className="flex-grow-1 p-3 chat-messages"
            style={{
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div className="bg-white p-3 rounded mb-2 shadow-sm" style={{ borderRadius: "15px" }}>
              <small className="text-muted d-block mb-1">{t("chat.systemUser")}</small>
              <div>
                {chatType === "individual"
                  ? t("chat.welcomeMessage", { email: receiverEmail })
                  : t("chat.groupWelcomeMessage", { groupName })}
              </div>
              <small className="text-muted d-block mt-1">
                {new Date().toLocaleTimeString()}
              </small>
            </div>
          </div>

          <div
            className="p-3 border-top bg-white"
            style={{ boxShadow: "0 -2px 4px rgba(0,0,0,0.05)" }}
          >
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder={t("chat.typeMessage")}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{
                  borderRadius: "25px 0 0 25px",
                  paddingLeft: "15px",
                  borderColor: "#51285f",
                  backgroundColor: "#f8f9fa",
                  transition: "border-color 0.3s ease",
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!messageContent.trim()}
                style={{
                  backgroundColor: "#51285f",
                  borderColor: "#51285f",
                  borderRadius: "0 25px 25px 0",
                  padding: "0.5rem 1rem",
                  transition: "all 0.3s ease",
                  opacity: !messageContent.trim() ? 0.6 : 1,
                  cursor: !messageContent.trim() ? "not-allowed" : "pointer",
                }}
                className="hover-bg-dark-purple"
              >
                <i className="bi bi-send"></i> {t("chat.send")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewChatForm;