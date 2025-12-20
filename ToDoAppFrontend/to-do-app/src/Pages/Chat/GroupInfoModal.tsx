import React from "react";
import {
  Modal,
  Button,
  ListGroup,
  Badge,
  Alert as BootstrapAlert,
} from "react-bootstrap";
import type { Group, userModel } from "../../Interfaces";
import { Trans, useTranslation } from "react-i18next";
import { LogOut, Trash, AlertCircle, UserX } from "lucide-react";

interface GroupInfoModalProps {
  group: Group | null;
  onClose: () => void;
  currentUser: userModel;
  onRemoveMember: (memberId: string) => Promise<void>;
  onLeaveGroup: () => Promise<void>;
  onDeleteGroup: () => Promise<void>;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  group,
  onClose,
  currentUser,
  onRemoveMember,
  onLeaveGroup,
  onDeleteGroup,
}) => {
  const { t } = useTranslation();

  // Stanja za modal alerte
  const [showRemoveAlert, setShowRemoveAlert] = React.useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = React.useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  if (!group) return null;

  console.log("Grupa", group);

  const currentUserIdStr = String(currentUser.id).trim();

  const isCurrentUserAdmin = group.members?.some(
    (m) => String(m.userId).trim() === currentUserIdStr && m.isAdmin
  );

  const currentUserMember = group.members?.find(
    (m) => String(m.userId).trim() === currentUserIdStr
  );

  // Funkcije za uklanjanje
  const openRemoveAlert = (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName });
    setShowRemoveAlert(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToRemove) {
      await onRemoveMember(memberToRemove.id);
      setShowRemoveAlert(false);
      setMemberToRemove(null);
    }
  };

  // Funkcije za napustanje grupe
  const openLeaveAlert = () => setShowLeaveAlert(true);
  const confirmLeaveGroup = async () => {
    await onLeaveGroup();
    setShowLeaveAlert(false);
    onClose();
  };

  // Brisanje grupe
  const confirmDeleteGroup = async () => {
    await onDeleteGroup();
    setShowDeleteAlert(false);
    onClose();
  };

  return (
    <>
      {/* Glavni modal - Informacije o grupi */}
      <Modal
        show={!!group}
        onHide={onClose}
        centered
        backdrop="static"
        size="lg"
      >
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
                const isSelf =
                  String(member.userId).trim() === currentUserIdStr;
                const canRemove =
                  isCurrentUserAdmin && !isSelf && !member.isAdmin;

                return (
                  <ListGroup.Item
                    key={member.userId}
                    className="d-flex justify-content-between align-items-center py-3 border-bottom position-relative"
                    style={{
                      borderLeft: "4px solid #6b3a7a",
                      backgroundColor: "#fdfbff",
                      transition: "all 0.2s ease",
                      borderRadius: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5eff8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fdfbff")
                    }
                  >
                    <div className="flex-grow-1">
                      <div className="fw-semibold d-flex align-items-center gap-2">
                        {member.name}
                        {isSelf && (
                          <Badge bg="secondary" pill className="fs-6">
                            {t("groupInfo.you")}
                          </Badge>
                        )}
                      </div>
                      <small className="text-muted">{member.email}</small>
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
                          onClick={() =>
                            openRemoveAlert(member.userId, member.name)
                          }
                          title={t("groupInfo.removeMember")}
                          className="border-danger"
                        >
                          <Trash size={16} />
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          ) : (
            <BootstrapAlert
              variant="light"
              className="text-center py-4 fst-italic text-muted"
            >
              {t("groupInfo.noMembers")}
            </BootstrapAlert>
          )}

          {/* Dugme za napustanje grupe */}
          {!isCurrentUserAdmin && currentUserMember && (
            <div className="mt-5 text-center">
              <Button
                variant="outline-danger"
                size="lg"
                onClick={openLeaveAlert}
                className="px-5 border-danger"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="me-2" size={18} />
                {t("groupInfo.leaveGroup")}
              </Button>
            </div>
          )}

          {isCurrentUserAdmin && (
            <div className="mt-4 text-center">
              <Button
                variant="danger"
                size="lg"
                onClick={() => setShowDeleteAlert(true)}
                className="px-5"
                style={{ fontWeight: 500 }}
              >
                <Trash className="me-2" size={18} />
                {t("groupInfo.deleteGroup", { defaultValue: "Delete Group" })}
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
            className="px-5"
            style={{
              backgroundColor: "#6b3a7a",
              borderColor: "#6b3a7a",
              fontWeight: 500,
            }}
          >
            {t("groupInfo.close")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal za potvrdu uklanjanja člana */}
      <Modal
        show={showRemoveAlert}
        onHide={() => setShowRemoveAlert(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center gap-2">
            <AlertCircle size={26} />
            {t("groupInfo.confirmRemoveTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3 text-center">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle p-4">
              <UserX size={56} className="text-danger" />
            </div>
          </div>
          <p className="text-muted fs-5 text-center">
            <Trans
              i18nKey="groupInfo.confirmRemoveBody"
              values={{
                name: memberToRemove?.name || "",
                groupName: group.name,
              }}
              components={{ strong: <strong /> }}
            />
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowRemoveAlert(false)}
          >
            {t("common.cancel", { defaultValue: "Otkaži" })}
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={confirmRemoveMember}
            className="px-4"
          >
            <Trash className="me-2" size={18} />
            {t("groupInfo.removeMember")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal za potvrdu napuštanja grupe */}
      <Modal
        show={showLeaveAlert}
        onHide={() => setShowLeaveAlert(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-warning d-flex align-items-center gap-2">
            <AlertCircle size={26} />
            {t("groupInfo.confirmLeaveTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3 text-center">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-15 rounded-circle p-4">
              <LogOut size={56} className="text-warning" />
            </div>
          </div>
          <p className="text-muted fs-5 text-center">
            <Trans
              i18nKey="groupInfo.confirmLeaveBody"
              values={{ groupName: group.name }}
              components={{ strong: <strong /> }}
            />
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowLeaveAlert(false)}
          >
            {t("common.cancel", { defaultValue: "Otkaži" })}
          </Button>
          <Button
            variant="outline-danger"
            size="lg"
            onClick={confirmLeaveGroup}
            className="px-4 border-danger"
          >
            <LogOut className="me-2" size={18} />
            {t("groupInfo.leaveGroup")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteAlert}
        onHide={() => setShowDeleteAlert(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger d-flex align-items-center gap-2">
            <AlertCircle size={26} />
            {t("groupInfo.confirmDeleteTitle", {
              defaultValue: "Delete group?",
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3 text-center">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle p-4">
              <Trash size={56} className="text-danger" />
            </div>
          </div>
          <p className="text-muted fs-5 text-center">
            <Trans
              i18nKey="groupInfo.confirmDeleteBody"
              values={{ groupName: group.name }}
              components={{ strong: <strong /> }}
              defaults="Are you sure you want to permanently delete <strong>{{groupName}}</strong>? This cannot be undone."
            />
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowDeleteAlert(false)}
          >
            {t("common.cancel", { defaultValue: "Otkaži" })}
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={confirmDeleteGroup}
            className="px-4"
          >
            <Trash className="me-2" size={18} />
            {t("groupInfo.deleteGroup", { defaultValue: "Delete Group" })}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GroupInfoModal;
