import React from "react";
import { Modal, Button, ListGroup, Badge } from "react-bootstrap";
import type { Group } from "../../Interfaces";
import { useTranslation } from "react-i18next";

interface GroupInfoModalProps {
  group: Group | null;
  onClose: () => void;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({ group, onClose }) => {
  const { t } = useTranslation();

  if (!group) return null;

  return (
    <Modal show={!!group} onHide={onClose} centered backdrop="static">
      <Modal.Header
        closeButton
        className="border-bottom"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Modal.Title style={{ color: "#6b3a7a", fontWeight: 600 }}>
          {group.name} — {t("groupInfo.title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <h6 className="mb-3" style={{ color: "#6b3a7a", fontWeight: 500 }}>
          {t("groupInfo.members")}
        </h6>
        <ListGroup variant="flush">
          {group.members?.map((member) => (
            <ListGroup.Item
              key={member.id}
              className="d-flex justify-content-between align-items-center py-3 border-bottom position-relative"
              style={{
                borderLeft: "4px solid #6b3a7a",
                backgroundColor: "#fdfbff",
                transition: "background-color 0.2s ease",
              }}
              // Hover efekat kroz Bootstrap + JS (inline)
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5eff8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fdfbff";
              }}
            >
              <div>
                <div className="fw-semibold">{member.name}</div>
                <small className="text-muted">{member.email}</small>
              </div>
              {member.isAdmin && (
                <Badge
                  bg="primary"
                  pill
                  style={{
                    backgroundColor: "#6b3a7a",
                    fontSize: "0.75rem",
                    padding: "0.35em 0.65em",
                  }}
                >
                  {t("groupInfo.admin")}
                </Badge>
              )}
            </ListGroup.Item>
          ))}
          {(!group.members || group.members.length === 0) && (
            <ListGroup.Item className="text-muted text-center py-3 fst-italic">
              {t("groupInfo.noMembers", {
                defaultValue: "Nema članova u grupi.",
              })}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer
        className="border-top"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Button
          variant="primary"
          onClick={onClose}
          className="px-4"
          style={{
            backgroundColor: "#6b3a7a",
            borderColor: "#6b3a7a",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5a2f6a";
            e.currentTarget.style.borderColor = "#5a2f6a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6b3a7a";
            e.currentTarget.style.borderColor = "#6b3a7a";
          }}
        >
          {t("groupInfo.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupInfoModal;
