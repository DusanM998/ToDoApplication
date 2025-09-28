import { useCallback, useState } from "react";
import { useLoginUserMutation } from "../../apis/authApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { apiResponse, userModel } from "../../Interfaces";
import { jwtDecode } from "jwt-decode";
import { setLoggedInUser } from "../../Storage/Redux/userAuthSlice";
import { inputHelper, toastNotify } from "../../Helper";
import { MainLoader } from "../../Components/Layout/Common";
import TextField from "@mui/material/TextField/TextField";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import IconButton from "@mui/material/IconButton/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loginUser] = useLoginUserMutation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState({
    userName: "",
    password: "",
  });

  const { t } = useTranslation();

  // Funkcija za upravljanje unosom u input polja
  const handleUserInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const tempData = inputHelper(e, userInput);
      setUserInput(tempData);
    },
    [userInput]
  );

  // Funkcija za submit forme za prijavu korisnika
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const response: apiResponse = await loginUser({
        userName: userInput.userName,
        password: userInput.password,
      });

      if (response.data) {
        // Dobijeni token se dešifruje
        const { token } = response.data.result;
        const { name, id, email, role }: userModel = jwtDecode(token);

        // Čuvam token u localStorage
        localStorage.setItem("token", token);

        // Redux state - postavljanje ulogovanog korisnika globalno
        dispatch(setLoggedInUser({ name, id, email, role }));

        // Notifikacija o uspešnom logovanju
        toastNotify(t("toastNotify.loginSuccess"), "success");

        // Preusmeravam korisnika na početnu stranicu
        navigate("/");
      } else if (response.error) {
        const errMsg =
          response.error.data?.errorMessages?.[0] ||
          t("toastNotify.errorUniform");
        toastNotify(errMsg, "error");
        setError(errMsg);
      }

      setLoading(false);
    },
    [dispatch, loginUser, navigate, t, userInput]
  );

  // Funkcija za prikazivanje/skrivanje lozinke
  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="container py-5">
      {loading && <MainLoader />}
      <div className="col-md-6 offset-md-3 col-12 bg-light rounded-3 shadow-sm p-4">
        <h1 className="text-center mb-4 fw-bold" style={{ color: "#51285f" }}>
          {t("loginPage.title")}
        </h1>
        <form method="post" onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            label={t("loginPage.usernamePlaceholder")}
            variant="outlined"
            fullWidth
            name="userName"
            value={userInput.userName}
            onChange={handleUserInput}
            required
            className="mb-3"
          />
          {/* Password */}
          <TextField
            type={showPassword ? "text" : "password"}
            label={t("loginPage.passwordPlaceholder")}
            variant="outlined"
            fullWidth
            name="password"
            value={userInput.password}
            onChange={handleUserInput}
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
          {/* Forgot password link */}
          <div className="mb-3 text-end">
            <a
              href="/auth/forgot-password"
              className="text-success"
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              {t("loginPage.forgotPassword")}
            </a>
          </div>
          {/* Error message */}
          {error && <p className="text-danger text-center">{error}</p>}
          {/* Buttons */}
          <div className="d-flex justify-content-center gap-3">
            <button
              type="submit"
              className="btn text-white"
              style={{
                background: "#4da172",
              }}
              disabled={loading}
            >
              {t("loginPage.submitBtn")}
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
              {t("loginPage.cancelBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
