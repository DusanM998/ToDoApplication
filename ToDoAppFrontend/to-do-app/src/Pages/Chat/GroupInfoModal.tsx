import React from "react";
import { Modal, Button, ListGroup, Badge, Alert } from "react-bootstrap";
import type { Group, userModel } from "../../Interfaces";
import { useTranslation } from "react-i18next";
import { LogOut, Trash } from "lucide-react";

interface GroupInfoModalProps {
  group: Group | null;
  onClose: () => void;
  currentUser: userModel;
  onRemoveMember: (memberId: string) => Promise<void>;
  onLeaveGroup: () => Promise<void>;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  group,
  onClose,
  currentUser,
  onRemoveMember,
  onLeaveGroup,
}) => {
  const { t } = useTranslation();

  if (!group) return null;

  const currentUserIdStr = String(currentUser.id).trim();

  const isCurrentUserAdmin = group.members?.some(
    (m) => String(m.id).trim() === currentUserIdStr && m.isAdmin
  );

  const currentUserMember = group.members?.find(
    (m) => String(m.id).trim() === currentUserIdStr
  );

  const handleRemoveMember = async (memberId: string) => {
    if (
      confirm(
        t("groupInfo.confirmRemove") ||
          "Da li sigurno želiš da ukloniš ovog člana iz grupe?"
      )
    ) {
      await onRemoveMember(memberId);
    }
  };

  const handleLeaveGroup = async () => {
    if (
      confirm(
        t("groupInfo.confirmLeave") || "Da li sigurno želiš da napustiš grupu?"
      )
    ) {
      await onLeaveGroup();
      onClose();
    }
  };

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
          {t("groupInfo.members")} ({group.members?.length || 0})
        </h6>

        {group.members && group.members.length > 0 ? (
          <ListGroup variant="flush">
            {group.members.map((member) => {
              const isSelf = member.id === currentUser.id;
              const canRemove =
                isCurrentUserAdmin && !isSelf && !member.isAdmin;

              return (
                <ListGroup.Item
                  key={member.id}
                  className="d-flex justify-content-between align-items-center py-3 border-bottom position-relative"
                  style={{
                    borderLeft: "4px solid #6b3a7a",
                    backgroundColor: "#fdfbff",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f5eff8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fdfbff")
                  }
                >
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{member.name}</div>
                    <small className="text-muted">{member.email}</small>
                    {isSelf && (
                      <Badge bg="secondary" className="ms-2" pill>
                        {t("groupInfo.you")}
                      </Badge>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {member.isAdmin && (
                      <Badge
                        bg="primary"
                        pill
                        style={{
                          backgroundColor: "#6b3a7a",
                          fontSize: "0.75rem",
                        }}
                      >
                        {t("groupInfo.admin")}
                      </Badge>
                    )}

                    {canRemove && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        title={t("groupInfo.removeMember")}
                        style={{ borderColor: "#dc3545", color: "#dc3545" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#dc3545";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#dc3545";
                        }}
                      >
                        <Trash size={14} />
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        ) : (
          <Alert
            variant="light"
            className="text-center py-3 fst-italic text-muted"
          >
            {t("groupInfo.noMembers", {
              defaultValue: "Nema članova u grupi.",
            })}
          </Alert>
        )}

        {/* Dugme za napustanje grupe (samo ako korisnik nije admin ili ako hoce da izadje) */}
        {!isCurrentUserAdmin && currentUserMember && (
          <div className="mt-4 text-center">
            <Button
              variant="outline-danger"
              onClick={handleLeaveGroup}
              style={{
                borderColor: "#dc3545",
                color: "#dc3545",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#dc3545";
              }}
            >
              <LogOut className="me-2" size={16} />
              {t("groupInfo.leaveGroup", { defaultValue: "Napusti grupu" })}
            </Button>
          </div>
        )}
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
