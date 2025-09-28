import { useTranslation } from "react-i18next";
import Footer from "../Footer";
import type { userModel } from "../../../Interfaces";
import { useSelector } from "react-redux";
import type { RootState } from "../../../Storage/Redux/store";
import { NavLink } from "react-router-dom";

function HomePage() {
  const { t } = useTranslation();

  // Uzimam podatke o korisniku iz Redux store-a
  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );
  const isLoggedIn = !!userData?.id;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="hero-section d-flex align-items-center justify-content-center text-white"
        style={{
          background: "linear-gradient(to right, #51285f, #4da172)",
          minHeight: "50vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div className="hero-content">
          <h1 className="display-4 fw-bold mb-3">{t("homePage.title")}</h1>
          <p className="lead mb-4">{t("homePage.subtitle")}</p>
          {isLoggedIn && (
            <div className="mt-4">
              <h2 className="mb-3">{t("homePage.createTaskTitle")}</h2>
              <NavLink
                to="/tasks/create"
                className="btn btn-lg hover-scale"
                style={{
                  backgroundColor: "#51285f",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {t("homePage.createTaskButton")}
              </NavLink>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section
        className="features-section py-5"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">
            {t("homePage.featuresTitle")}
          </h2>
          <div className="row">
            {/* Feature 1 */}
            <div className="col-md-4 text-center mb-4">
              <i
                className="bi bi-check-circle-fill"
                style={{ fontSize: "3rem", color: "#4da172" }}
              ></i>
              <h3 className="mt-3 mb-3 fw-semibold">
                {t("homePage.feature1.title")}
              </h3>
              <p>{t("homePage.feature1.description")}</p>
            </div>
            {/* Feature 2 */}
            <div className="col-md-4 text-center mb-4">
              <i
                className="bi bi-person-circle"
                style={{ fontSize: "3rem", color: "#4da172" }}
              ></i>
              <h3 className="mt-3 mb-3 fw-semibold">
                {t("homePage.feature2.title")}
              </h3>
              <p>{t("homePage.feature2.description")}</p>
            </div>
            {/* Feature 3 */}
            <div className="col-md-4 text-center mb-4">
              <i
                className="bi bi-funnel-fill"
                style={{ fontSize: "3rem", color: "#4da172" }}
              ></i>
              <h3 className="mt-3 mb-3 fw-semibold">
                {t("homePage.feature3.title")}
              </h3>
              <p>{t("homePage.feature3.description")}</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default HomePage;
