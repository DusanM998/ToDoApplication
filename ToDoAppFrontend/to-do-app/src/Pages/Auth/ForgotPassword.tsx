import { useState } from "react";
import { useResetPasswordRequestMutation } from "../../apis/authApi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toastNotify } from "../../Helper";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetPasswordRequest, { isLoading }] =
    useResetPasswordRequestMutation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response: any = await resetPasswordRequest({ email });
    if (response.data) {
      toastNotify(t("loginPage.forgotPasswordSuccess"), "success");
      // Optionally navigate to login after success
      navigate("/login");
    } else {
      toastNotify(t("loginPage.forgotPasswordError"), "error");
    }
  };

  return (
    <div className="container text-center" style={{ marginTop: "100px" }}>
      <h1 className="mt-5">{t("loginPage.forgotPasswordTitle")}</h1>
      <form method="post" onSubmit={handleSubmit}>
        <div className="mt-5">
          <div className="col-sm-6 offset-sm-3 col-xs-12 mt-4">
            <input
              type="email"
              className="form-control"
              placeholder={t("loginPage.forgotPasswordEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="email"
            />
          </div>
        </div>
        <div className="mt-2">
          <button
            type="submit"
            className="btn btn-outlined rounded-pill text-white mx-2"
            style={{ width: "200px", backgroundColor: "#4da172" }}
            disabled={isLoading}
          >
            {t("loginPage.forgotPasswordSubmitBtn")}
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

export default ForgotPassword;
