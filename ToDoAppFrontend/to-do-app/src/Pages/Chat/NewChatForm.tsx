import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const NewChatForm: React.FC<{
  receiverEmail: string;
  setReceiverEmail: (email: string) => void;
  messageContent: string;
  setMessageContent: (content: string) => void;
  handleSendMessage: (content: string, receiverEmail: string) => Promise<void>;
  userEmail: string;
}> = ({
  receiverEmail,
  setReceiverEmail,
  messageContent,
  setMessageContent,
  handleSendMessage,
  userEmail,
}) => {
  const { t } = useTranslation();
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);

  const handleConfirmEmail = () => {
    if (!receiverEmail) {
      alert(t("chat.validationError"));
      return;
    }
    setIsEmailConfirmed(true);
  };

  return (
    <div className="d-flex flex-column h-100">
      {!isEmailConfirmed && (
        <div
          className="p-3 border-bottom bg-white"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        >
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
                }}
              />
              <Button
                onClick={handleConfirmEmail}
                style={{
                  backgroundColor: "#51285f",
                  borderColor: "#51285f",
                  borderRadius: "0 25px 25px 0",
                  padding: "0.5rem 1rem",
                  transition: "background-color 0.3s ease",
                }}
                className="hover-bg-dark-purple"
              >
                {t("chat.send")}
              </Button>
            </div>
          </Form.Group>
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
            <div className="bg-white p-3 rounded mb-2 shadow-sm">
              <small className="text-muted d-block mb-1">{t("chat.systemUser")}</small>
              <div>{t("chat.welcomeMessage")}</div>
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
              <input
                type="text"
                className="form-control"
                placeholder={t("chat.typeMessage")}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                style={{
                  borderRadius: "25px 0 0 25px",
                  paddingLeft: "15px",
                  borderColor: "#51285f",
                  backgroundColor: "#f8f9fa",
                }}
              />
              <Button
                onClick={() => handleSendMessage(messageContent, receiverEmail)}
                style={{
                  backgroundColor: "#51285f",
                  borderColor: "#51285f",
                  borderRadius: "0 25px 25px 0",
                  padding: "0.5rem 1rem",
                  transition: "background-color 0.3s ease",
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