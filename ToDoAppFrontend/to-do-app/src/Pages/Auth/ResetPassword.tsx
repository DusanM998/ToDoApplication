import React, { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useConfirmResetPasswordMutation } from "../../apis/authApi";
import { toastNotify } from "../../Helper";

function ResetPassword() {
  const query = new URLSearchParams(useLocation().search);
  const emailFromQuery = query.get("email") || "";
  const tokenFromQuery = query.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [confirmResetPassword, { isLoading }] = useConfirmResetPasswordMutation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email and token presence
    if (!emailFromQuery || !tokenFromQuery) {
      setError(t("loginPage.resetPasswordInvalidLink"));
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError(t("loginPage.resetPasswordMismatch"));
      return;
    }

    const response: any = await confirmResetPassword({
      email: emailFromQuery,
      token: tokenFromQuery,
      newPassword,
    });

    if (response.data) {
      toastNotify(t("loginPage.resetPasswordSuccess"), "success");
      navigate("/login");
    } else {
      toastNotify(t("loginPage.resetPasswordError"), "error");
      setError(response.error?.data?.message || t("loginPage.resetPasswordError"));
    }
  };

  const toggleShowPassword = useCallback(() => 
    setShowPassword((prev) => !prev)
  , []);
  
  const toggleShowConfirmPassword = useCallback(() => 
    setShowConfirmPassword((prev) => !prev)
  , []);

  return (
    <div className="container text-center" style={{marginTop: "80px"}}>
      <h1 className="mt-5">{t("loginPage.resetPasswordTitle")}</h1>
      <form method="post" onSubmit={handleSubmit}>
        <div className="mt-5">
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <TextField
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder={t("loginPage.resetPasswordNewPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <TextField
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              placeholder={t("loginPage.resetPasswordConfirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        {error && <p className="text-danger mt-2">{error}</p>}
        <div className="mt-2">
          <button
            type="submit"
            className="btn btn-outlined rounded-pill text-white mx-2"
            style={{ width: "200px", backgroundColor: "#4da172" }}
            disabled={isLoading}
          >
            {t("loginPage.resetPasswordSubmitBtn")}
          </button>
          <button
            type="button"
            className="btn btn-outlined rounded-pill text-white mx-2"
            style={{ width: "200px", backgroundColor: "#999393" }}
            disabled={isLoading}
            onClick={() => navigate("/login")}
          >
            {t("loginPage.backToLogin")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;