import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";
import {
  useGetUserByUserIdQuery,
  useGetCurrentUserQuery,
  useUpdateUserDetailsMutation,
} from "../../apis/authApi";
import { inputHelper, toastNotify } from "../../Helper";
import { MainLoader } from "../../Components/Layout/Common";
import type { userModel } from "../../Interfaces";
import type { RootState } from "../../Storage/Redux/store";
import { useSelector } from "react-redux";

type FormState = {
  id?: string;
  userName: string;
  name: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber: string;
};

export default function UserDetailsUpdate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormState>({
    userName: "",
    name: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const userData: userModel = useSelector((s: RootState) => s.userAuthStore);

  const { data: currentData, isLoading: loadingCurrent } =
    useGetCurrentUserQuery(undefined, { skip: Boolean(paramId) });
  const { data: otherData, isLoading: loadingOther } = useGetUserByUserIdQuery(
    paramId ?? "",
    { skip: !paramId }
  );

  const fetched = paramId ? otherData : currentData;
  const isLoadingFetched = loadingCurrent || loadingOther;

  const [updateUser, updateResult] = useUpdateUserDetailsMutation();

  const validImgTypes = useMemo(() => ["jpeg", "jpg", "png"], []);

  useEffect(() => {
    if (fetched?.result) {
      setForm({
        id: fetched.result.id,
        userName: fetched.result.userName ?? "",
        name: fetched.result.name ?? "",
        password: "",
        confirmPassword: "",
        phoneNumber: fetched.result.phoneNumber ?? "",
      });
      setImagePreview(fetched.result.image);
    }
  }, [fetched]);

  useEffect(() => {
    setLoading(isLoadingFetched || updateResult.isLoading);
  }, [isLoadingFetched, updateResult.isLoading]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = inputHelper(e, form as any) as Partial<FormState>;
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, phoneNumber: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgType = file.type.split("/")[1]?.toLowerCase() ?? "";
    if (!validImgTypes.includes(imgType)) {
      toastNotify(t("toastNotify.fileTypeError"), "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastNotify(t("toastNotify.fileSizeError"), "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!form.userName.trim())
      return (
        t("registerPage.usernamePlaceholder") +
        " " +
        t("toastNotify.errorUniform")
      );
    if (!form.name.trim())
      return (
        t("registerPage.namePlaceholder") + " " + t("toastNotify.errorUniform")
      );
    if (form.password && form.password !== form.confirmPassword)
      return t("userPage.passwordMismatch") || "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      toastNotify(err, "error");
      return;
    }

    const targetId = paramId ?? fetched?.result?.id ?? userData?.id;
    if (!targetId) {
      toastNotify("Invalid user id.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("Id", targetId);
    formData.append("UserName", form.userName);
    if (form.password) formData.append("Password", form.password);
    formData.append("Name", form.name);
    formData.append("PhoneNumber", form.phoneNumber ?? "");
    if (imageFile) formData.append("File", imageFile);

    try {
      setLoading(true);
      const res: any = await updateUser({
        data: formData,
        id: targetId,
      }).unwrap();
      if (res?.isSuccess) {
        toastNotify(
          t("userPage.updateSuccess") || "User updated successfully.",
          "success"
        );
        navigate(`/userPage/${targetId}`);
      } else {
        const msg = res?.errorMessages?.[0] ?? t("toastNotify.errorUniform");
        toastNotify(msg, "error");
      }
    } catch (error: any) {
      const message =
        error?.data?.errorMessages?.[0] ||
        error?.message ||
        t("toastNotify.errorUniform");
      toastNotify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const targetId = paramId ?? fetched?.result?.id ?? userData?.id;
    if (targetId) navigate(`/userPage/${targetId}`);
    else navigate("/");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="85vh"
      sx={{
        background: "linear-gradient(180deg,#f5f7fa 0%, #f8f9fb 100%)",
        p: 3,
      }}
    >
      {loading && <MainLoader />}
      <Card
        sx={{
          width: 760,
          borderRadius: 3,
          p: 1,
          boxShadow: "0 10px 30px rgba(13,38,59,0.08)",
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, color: "#2f5168", mb: 2 }}
          >
            {t("userPage.update")}
          </Typography>

          <Box display="flex" gap={4} alignItems="flex-start">
            <Box
              sx={{
                width: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={imagePreview}
                sx={{
                  width: 150,
                  height: 150,
                  border: "3px solid #eef2f5",
                  boxShadow: "0 6px 18px rgba(47,81,104,0.06)",
                }}
              >
                {form.name?.[0]?.toUpperCase() ?? ""}
              </Avatar>
              <label htmlFor="file-input" style={{ width: "100%" }}>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  {t("userPage.changeAvatar")}
                </Button>
              </label>
            </Box>

            <Box sx={{ flex: 1 }}>
              <form onSubmit={handleSubmit}>
                <TextField
                  label={t("registerPage.usernamePlaceholder")}
                  name="userName"
                  value={form.userName}
                  onChange={handleInput}
                  fullWidth
                  margin="normal"
                  required
                />

                <TextField
                  label={t("registerPage.namePlaceholder")}
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  fullWidth
                  margin="normal"
                  required
                />

                <TextField
                  label={t("registerPage.passwordPlaceholder")}
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  helperText={
                    t("userPage.passwordHelper") ||
                    "Leave empty to keep current password"
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label={t("userPage.confirmPassword") || "Confirm Password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInput}
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  helperText={
                    t("userPage.passwordHelper") ||
                    "Leave empty to keep current password"
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((s) => !s)}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box mt={1}>
                  <PhoneInput
                    value={form.phoneNumber}
                    onChange={handlePhoneChange}
                    inputStyle={{ width: "100%", borderRadius: 8 }}
                  />
                </Box>

                <Box display="flex" gap={2} mt={4} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ borderRadius: 2 }}
                  >
                    {t("userPage.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      background: "linear-gradient(90deg,#51285f,#4da172)",
                    }}
                  >
                    {t("userPage.update")}
                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}