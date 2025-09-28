import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";
import { useRegisterUserMutation } from "../../apis/authApi";
import { inputHelper, toastNotify } from "../../Helper";
import type { apiResponse } from "../../Interfaces";
import { MainLoader } from "../../Components/Layout/Common";
import { SD_Roles } from "../../Utility/SD";

const userInputData = {
  userName: "",
  password: "",
  role: "",
  name: "",
  phoneNumber: "",
};

function Register() {
  const [registerUser] = useRegisterUserMutation();
  const [loading, setLoading] = useState(false);
  const [userInputs, setUserInputs] = useState(userInputData);
  const [showPassword, setShowPassword] = useState(false);
  const [imageToBeStore, setImageToBeStore] = useState<any>();
  const [imageToBeDisplayed, setImageToBeDisplayed] = useState<string>();

  const { t } = useTranslation();
  const validImgTypes = useMemo(() => ["jpeg", "jpg", "png"], []);
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
      if (typeof e === "string") {
        setUserInputs((prev) => ({
          ...prev,
          phoneNumber: e,
        }));
      } else {
        const tempData = inputHelper(e, userInputs);
        setUserInputs(tempData);
      }
    },
    [userInputs]
  );

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const tempData = inputHelper(e, userInputs);
      setUserInputs(tempData);
    },
    [userInputs]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      if (!imageToBeStore) {
        toastNotify(t("toastNotify.uploadImageError"), "error");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("UserName", userInputs.userName);
      formData.append("Password", userInputs.password);
      formData.append("Role", userInputs.role);
      formData.append("Name", userInputs.name);
      formData.append("PhoneNumber", userInputs.phoneNumber);
      if (imageToBeDisplayed) formData.append("File", imageToBeStore);

      let response: apiResponse = await registerUser(formData);

      if (response.data) {
        toastNotify(t("toastNotify.registrationSuccess"), "success");
        navigate("/login");
      } else if (response.error) {
        const errorMsg =
          response.error.data?.errorMessages?.[0] ||
          t("toastNotify.errorUniform");
        toastNotify(errorMsg, "error");
      }

      setLoading(false);
    },
    [userInputs, imageToBeStore, imageToBeDisplayed, registerUser, navigate, t]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const imgType = file.type.split("/")[1];
        if (file.size > 5000 * 1024) {
          setImageToBeStore(null);
          toastNotify(t("toastNotify.fileSizeError"), "error");
          return;
        } else if (!validImgTypes.includes(imgType)) {
          setImageToBeStore(null);
          toastNotify(t("toastNotify.fileTypeError"), "error");
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        setImageToBeStore(file);
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setImageToBeDisplayed(imageUrl);
        };
      }
    },
    [t, validImgTypes]
  );

  return (
    <div className="container py-5">
      {loading && <MainLoader />}
      <div className="col-md-6 offset-md-3 col-12 bg-light rounded-3 shadow-sm p-4">
        <h1 className="text-center mb-4 fw-bold" style={{ color: "#51285f" }}>
          {t("registerPage.title")}
        </h1>
        <form
          method="post"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <TextField
            label={t("registerPage.usernamePlaceholder")}
            variant="outlined"
            fullWidth
            name="userName"
            value={userInputs.userName}
            onChange={handleInputChange}
            required
            className="mb-3"
          />
          <TextField
            label={t("registerPage.namePlaceholder")}
            variant="outlined"
            fullWidth
            name="name"
            value={userInputs.name}
            onChange={handleInputChange}
            required
            className="mb-3"
          />
          <TextField
            label={t("registerPage.passwordPlaceholder")}
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            name="password"
            value={userInputs.password}
            onChange={handleInputChange}
            required
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
            className="mb-3"
          />
          <PhoneInput
            country="us"
            value={userInputs.phoneNumber}
            onChange={handleInputChange}
            inputStyle={{ width: "100%", borderRadius: "8px" }}
            buttonStyle={{ borderRadius: "8px 0 0 8px" }}
            containerClass="mb-3"
          />
          <TextField
            select
            label={t("registerPage.roleLabel")}
            variant="outlined"
            fullWidth
            name="role"
            value={userInputs.role}
            onChange={handleSelectChange}
            required
            SelectProps={{ native: true }}
            className="mb-3"
          >
            <option value="">{t("registerPage.roleLabel")}</option>
            <option value={SD_Roles.CUSTOMER}>Customer</option>
            <option value={SD_Roles.ADMIN}>Admin</option>
          </TextField>
          <input
            type="file"
            className="form-control mb-3"
            accept="image/*"
            name="image"
            onChange={handleFileChange}
          />
          {imageToBeDisplayed && (
            <div className="mb-3 text-center">
              <img
                src={imageToBeDisplayed}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                alt="Preview"
              />
            </div>
          )}
          <div className="d-flex justify-content-center gap-3">
            <button
              type="submit"
              className="btn text-white"
              style={{
                background: "#4da172",
              }}
              disabled={loading}
            >
              {t("registerPage.submitBtn")}
            </button>
            <button
              type="button"
              className="btn text-white"
              style={{
                background: "linear-gradient(to right, #6c757d, #495057)",
              }}
              disabled={loading}
              onClick={() => navigate("/")}
            >
              {t("registerPage.cancelBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
