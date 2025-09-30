import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  Avatar,
  InputAdornment,
  IconButton,
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

// Komponenta gde korisnik moze da azurira svoje podatke
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
    <div className="min-vh-100 bg-light d-flex flex-column align-items-center py-4 px-3" style={{marginTop: "80px"}}>
      {loading && <MainLoader />}
      <div className="w-100" style={{ maxWidth: "900px" }}>
        <div className="card shadow mb-4 rounded-3 border-0">
          <div className="card-body p-4">
            <h2 className="text-center mb-4 fw-bold" style={{ color: "#51285f" }}>
              {t("userPage.update")}
            </h2>
            <div className="row g-4">
              <div className="col-md-4 d-flex flex-column align-items-center gap-3">
                {imagePreview ? (
                  <Avatar
                    src={imagePreview}
                    className="img-fluid rounded-circle border border-3 shadow-sm"
                    style={{ width: "150px", height: "150px", borderColor: "#4da172" }}
                  />
                ) : (
                  <Avatar
                    className="rounded-circle border border-3 shadow-sm"
                    style={{ width: "150px", height: "150px", fontSize: "3rem", backgroundColor: "#51285f", color: "#fff" }}
                  >
                    {form.name?.[0]?.toUpperCase() ?? ""}
                  </Avatar>
                )}
                <label htmlFor="file-input" className="w-100">
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="d-none"
                  />
                  <Button
                    variant="outlined"
                    component="span"
                    className="btn btn-outline-primary rounded-pill w-100"
                    style={{ borderColor: "#51285f", color: "#51285f" }}
                  >
                    {t("userPage.changeAvatar")}
                  </Button>
                </label>
              </div>
              <div className="col-md-8">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <TextField
                      label={t("registerPage.usernamePlaceholder")}
                      name="userName"
                      value={form.userName}
                      onChange={handleInput}
                      fullWidth
                      variant="outlined"
                      required
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
                      label={t("registerPage.namePlaceholder")}
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      fullWidth
                      variant="outlined"
                      required
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
                      label={t("registerPage.passwordPlaceholder")}
                      name="password"
                      value={form.password}
                      onChange={handleInput}
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      variant="outlined"
                      className="rounded"
                      helperText={
                        t("userPage.passwordHelper") ||
                        "Leave empty to keep current password"
                      }
                      InputProps={{
                        className: "bg-light",
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((s) => !s)}
                              edge="end"
                            >
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
                      FormHelperTextProps={{
                        style: { color: "#51285f" },
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <TextField
                      label={t("userPage.confirmPassword") || "Confirm Password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleInput}
                      type={showConfirmPassword ? "text" : "password"}
                      fullWidth
                      variant="outlined"
                      className="rounded"
                      helperText={
                        t("userPage.passwordHelper") ||
                        "Leave empty to keep current password"
                      }
                      InputProps={{
                        className: "bg-light",
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword((s) => !s)}
                              edge="end"
                            >
                              {showConfirmPassword ? (
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
                      FormHelperTextProps={{
                        style: { color: "#51285f" },
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <PhoneInput
                      value={form.phoneNumber}
                      onChange={handlePhoneChange}
                      inputClass="form-control bg-light rounded"
                      containerClass="w-100"
                      buttonStyle={{ borderColor: "#51285f", backgroundColor: "#f8f9fa" }}
                    />
                  </div>
                  <div className="d-flex gap-3 justify-content-end">
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      className="btn btn-outline-secondary rounded-pill py-2"
                      style={{ borderColor: "#51285f", color: "#51285f" }}
                    >
                      {t("userPage.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className="btn rounded-pill py-2"
                      style={{ backgroundColor: "#4da172", color: "#fff" }}
                    >
                      {t("userPage.update")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}