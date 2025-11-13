// components/chat/MessageInput.tsx
import React from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  selectedImages: { file: File; preview: string }[];
  onSend: () => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  isSending: boolean;
  selectedUserId: string | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  selectedImages,
  onSend,
  onImageSelect,
  removeImage,
  isSending,
  selectedUserId,
}) => {
  const { t } = useTranslation();

  if (!selectedUserId) return null;

  return (
    <div className="p-3 border-top bg-white">
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
              onSend();
            }
          }}
          disabled={isSending}
          style={{ borderRadius: "20px 0 0 20px" }}
        />

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
            onChange={onImageSelect}
          />
        </label>

        <Button
          onClick={onSend}
          disabled={
            isSending || (!newMessage.trim() && selectedImages.length === 0)
          }
          style={{
            borderRadius: "0 20px 20px 0",
            backgroundColor: "#6b3a7a",
            border: "none",
            opacity:
              isSending || (!newMessage.trim() && selectedImages.length === 0)
                ? 0.6
                : 1,
          }}
        >
          <i className="bi bi-send"></i>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
