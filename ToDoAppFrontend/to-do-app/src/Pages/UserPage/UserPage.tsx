import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { inputHelper } from "../../Helper";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Avatar,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";
import {
  useGetUserByUserIdQuery,
  useGetCurrentUserQuery,
  useVerifyPasswordMutation,
} from "../../apis/authApi";
import type { userModel } from "../../Interfaces";
import type { RootState } from "../../Storage/Redux/store";
import { MainLoader } from "../../Components/Layout/Common";
import { UserTasksStatistic } from "../Task";

const userDetailsData = {
  userName: "",
  name: "",
  password: "",
  phoneNumber: "",
  role: "",
};

function UserPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [userDetailsInput, setUserDetailsInput] = useState(userDetailsData);
  const [showPassword, setShowPassword] = useState(false);
  const [imageToBeDisplayed, setImageToBeDisplayed] = useState<string>();
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isUpdateNavigation, setIsUpdateNavigation] = useState(false);
  const [showDialogPassword, setShowDialogPassword] = useState(false);

  const { id: paramId } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const {
    data: currentData,
    isLoading: isLoadingCurrent,
    isError: isErrorCurrent,
  } = useGetCurrentUserQuery(undefined, { skip: Boolean(paramId) });

  const {
    data: otherData,
    isLoading: isLoadingOther,
    isError: isErrorOther,
  } = useGetUserByUserIdQuery(paramId ?? "", { skip: !paramId });

  const [verifyPassword] = useVerifyPasswordMutation();

  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  const fetched = paramId ? otherData : currentData;
  const isLoadingFetched = paramId ? isLoadingOther : isLoadingCurrent;
  const isErrorFetched = paramId ? isErrorOther : isErrorCurrent;

  useEffect(() => {
    if (fetched && fetched.result) {
      const tempData = {
        userName: fetched.result.userName,
        name: fetched.result.name,
        password: "",
        phoneNumber: fetched.result.phoneNumber,
        role: fetched.result.role,
      };
      setUserDetailsInput(tempData);
      setImageToBeDisplayed(fetched.result.image);
    }
  }, [fetched]);

  useEffect(() => {
    if (isLoadingFetched) setLoading(true);
    else setLoading(false);
  }, [isLoadingFetched]);

  useEffect(() => {
    if (isErrorFetched) {
      console.error("Error fetching user data");
    }
  }, [isErrorFetched]);

  const handleUserInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const tempData = inputHelper(e, userDetailsInput);
    setUserDetailsInput(tempData);
  };

  const toggleShowPassword = () => {
    if (!isPasswordVerified) {
      setIsUpdateNavigation(false);
      setPasswordDialogOpen(true);
    } else {
      setShowPassword(!showPassword);
    }
  };

  const toggleShowDialogPassword = () => {
    setShowDialogPassword(!showDialogPassword);
  };

  const handleUpdateClick = () => {
    if (!isPasswordVerified) {
      setPasswordDialogOpen(true);
      setIsUpdateNavigation(true);
    } else {
      navigate("/userDetails/userDetailsUpdate/" + userData.id);
    }
  };

  const handlePasswordVerification = async () => {
    try {
      const targetId = fetched?.result?.id ?? paramId ?? userData?.id ?? "";
      if (!targetId) {
        alert("Nevalidan korisnik za verifikaciju.");
        return;
      }

      let response = await verifyPassword({
        Id: targetId,
        password: passwordInput,
      }).unwrap();

      if (response.isSuccess) {
        setIsPasswordVerified(true);
        setPasswordDialogOpen(false);
        setPasswordInput("");
        if (isUpdateNavigation) {
          navigate("/userDetails/userDetailsUpdate/" + userData.id);
        } else {
          setUserDetailsInput((prev) => ({ ...prev, password: passwordInput }));
          setShowPassword(true);
        }
      } else {
        alert("Neispravna lozinka!");
      }
    } catch (error) {
      alert("Greška pri autentifikaciji.");
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column align-items-center py-4 px-3" style={{marginTop:"80px"}}>
      {loading && <MainLoader />}
      <div className="w-100" style={{ maxWidth: "900px" }}>
        <div className="card shadow mb-4 rounded-3 border-0">
          <div className="card-body p-4">
            <h2 className="text-center mb-4 fw-bold" style={{ color: "#51285f" }}>
              {t("userPage.title")}
            </h2>
            <div className="row g-4">
              <div className="col-md-4 d-flex justify-content-center align-items-center">
                {imageToBeDisplayed ? (
                  <Avatar
                    src={imageToBeDisplayed}
                    className="img-fluid rounded-circle border border-3 shadow-sm"
                    style={{ width: "150px", height: "150px", borderColor: "#4da172" }}
                  />
                ) : (
                  <Avatar
                    className="rounded-circle border border-3 shadow-sm"
                    style={{ width: "150px", height: "150px", fontSize: "3rem", backgroundColor: "#51285f", color: "#fff" }}
                  >
                    {userDetailsInput.name?.[0]}
                  </Avatar>
                )}
              </div>
              <div className="col-md-8">
                <div className="mb-3">
                  <TextField
                    label={t("userPage.username")}
                    value={userDetailsInput.userName}
                    disabled
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    InputProps={{
                      className: "bg-light",
                    }}
                    InputLabelProps={{
                      style: { color: "#51285f" },
                    }}
                  />
                </div>
                <div className="mb-3">
                  <TextField
                    label={t("userPage.name")}
                    value={userDetailsInput.name}
                    disabled
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    InputProps={{
                      className: "bg-light",
                    }}
                    InputLabelProps={{
                      style: { color: "#51285f" },
                    }}
                  />
                </div>
                <div className="mb-3">
                  <TextField
                    label={t("userPage.password")}
                    type={showPassword ? "text" : "password"}
                    value={userDetailsInput.password}
                    disabled={!isPasswordVerified}
                    onChange={handleUserInput}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    InputProps={{
                      className: "bg-light",
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={toggleShowPassword} edge="end">
                            {showPassword ? (
                              <i className="bi bi-eye-slash" style={{ color: "#51285f" }}></i>
                            ) : (
                              <i className="bi bi-eye" style={{ color: "#51285f" }}></i>
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      style: { color: "#51285f" },
                    }}
                  />
                </div>
                <div className="mb-3">
                  <PhoneInput
                    value={userDetailsInput.phoneNumber}
                    disabled
                    inputClass="form-control bg-light rounded"
                    containerClass="w-100"
                    buttonStyle={{ borderColor: "#51285f", backgroundColor: "#f8f9fa" }}
                  />
                </div>
                <div className="d-flex gap-3">
                  <Button
                    fullWidth
                    variant="contained"
                    className="btn rounded-pill py-2"
                    style={{ backgroundColor: "#4da172", color: "#fff" }}
                    onClick={handleUpdateClick}
                  >
                    {t("userPage.update")}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    className="btn rounded-pill py-2"
                    style={{ borderColor: "#51285f", color: "#51285f" }}
                    onClick={() => navigate("/")}
                  >
                    {t("userPage.cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserTasksStatistic />
      </div>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          className: "rounded-3 p-4",
          style: { minWidth: "300px", maxWidth: "400px" },
        }}
      >
        <DialogTitle className="text-center fw-bold" style={{ color: "#51285f" }}>
          {t("userPage.verifyIdentity")}
        </DialogTitle>
        <DialogContent>
          <p className="mb-3" style={{ color: "#51285f" }}>{t("userPage.verifyInstruction")}</p>
          <TextField
            type={showDialogPassword ? "text" : "password"}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
            placeholder={t("userPage.enterPassword")}
            variant="outlined"
            className="rounded"
            InputProps={{
              className: "bg-light",
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowDialogPassword} edge="end">
                    {showDialogPassword ? (
                      <i className="bi bi-eye-slash" style={{ color: "#51285f" }}></i>
                    ) : (
                      <i className="bi bi-eye" style={{ color: "#51285f" }}></i>
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#51285f" },
            }}
          />
        </DialogContent>
        <DialogActions className="justify-content-center pb-3">
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            variant="outlined"
            className="btn rounded-pill"
            style={{ borderColor: "#51285f", color: "#51285f" }}
          >
            {t("userPage.cancel")}
          </Button>
          <Button
            onClick={handlePasswordVerification}
            variant="contained"
            className="btn rounded-pill"
            style={{ backgroundColor: "#4da172", color: "#fff" }}
          >
            {t("userPage.verifyBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserPage;