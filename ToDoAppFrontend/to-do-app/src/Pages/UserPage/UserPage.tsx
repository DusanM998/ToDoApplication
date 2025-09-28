import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { inputHelper } from "../../Helper";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";
import {
  useGetUserByUserIdQuery,
  useGetCurrentUserQuery,
  useVerifyPasswordMutation,
} from "../../apis/authApi";
import type { userModel } from "../../Interfaces";
import type { RootState } from "../../Storage/Redux/store";
import { MainLoader } from "../../Components/Layout/Common";

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

  // route param
  const { id: paramId } = useParams<{ id: string }>();

  // hooks: get current user (skip if paramId present), and get by id (skip if no paramId)
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
  const { t } = useTranslation();

  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  // decide which fetched data to use
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

  // simple loading / error handling
  useEffect(() => {
    if (isLoadingFetched) setLoading(true);
    else setLoading(false);
  }, [isLoadingFetched]);

  useEffect(() => {
    if (isErrorFetched) {
      // optional: redirect or show toast
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
      // navigate to update for current user (use store id)
      navigate("/userDetails/userDetailsUpdate/" + userData.id);
    }
  };

  const handlePasswordVerification = async () => {
    try {
      // determine id to send to verifyPassword: prefer fetched result id, fallback to paramId or store id
      const targetId =
        fetched?.result?.id ?? paramId ?? userData?.id ?? "";

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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
      sx={{ backgroundColor: "#f9f9f9" }}
    >
      {loading && <MainLoader />}
      <Card
        sx={{
          width: 650,
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          p: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#305985" }}
          >
            {t("userPage.title")}
          </Typography>

          <Box display="flex" alignItems="center" gap={4} mt={2}>
            <Box flex="1" display="flex" justifyContent="center">
              {imageToBeDisplayed ? (
                <Avatar
                  src={imageToBeDisplayed}
                  sx={{ width: 150, height: 150, border: "3px solid #ddd" }}
                />
              ) : (
                <Avatar sx={{ width: 150, height: 150, fontSize: "2rem" }}>
                  {userDetailsInput.name?.[0]}
                </Avatar>
              )}
            </Box>

            <Box flex="2">
              <TextField
                label={t("userPage.username")}
                value={userDetailsInput.userName}
                disabled
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("userPage.name")}
                value={userDetailsInput.name}
                disabled
                fullWidth
                margin="normal"
              />
              <TextField
                label={t("userPage.password")}
                type={showPassword ? "text" : "password"}
                value={userDetailsInput.password}
                disabled={!isPasswordVerified}
                onChange={handleUserInput}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box mt={2}>
                <PhoneInput
                  value={userDetailsInput.phoneNumber}
                  disabled
                  inputStyle={{ width: "100%" }}
                />
              </Box>

              <Box mt={3} display="flex" gap={2}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#4da172",
                    color: "white",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#3d8c5b" },
                  }}
                  onClick={handleUpdateClick}
                >
                  {t("userPage.update")}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: "#999393",
                    color: "#555",
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "#777",
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  onClick={() => navigate("/")}
                >
                  {t("userPage.cancel")}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "15px",
            padding: "20px",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          {t("userPage.verifyIdentity")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: "#555" }}>
            {t("userPage.verifyInstruction")}
          </Typography>
          <TextField
            type={showDialogPassword ? "text" : "password"}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            fullWidth
            placeholder={t("userPage.enterPassword")}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowDialogPassword} edge="end">
                    {showDialogPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: "#999393", color: "#555" }}
          >
            {t("userPage.cancel")}
          </Button>
          <Button
            onClick={handlePasswordVerification}
            variant="contained"
            sx={{
              backgroundColor: "#4da172",
              color: "white",
              "&:hover": { backgroundColor: "#3d8c5b" },
            }}
          >
            {t("userPage.verifyBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserPage;
