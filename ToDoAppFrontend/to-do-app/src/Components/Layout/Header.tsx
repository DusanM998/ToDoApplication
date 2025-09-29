import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import logo2 from "../../assets/Images/icon.png";
import rsFlag from "../../assets/Images/Flag_of_Serbia.svg.png";
import usFlag from "../../assets/Images/Flag_of_the_United_States.png";
import { useTranslation } from "react-i18next";
import type { userModel } from "../../Interfaces";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../Storage/Redux/store";
import {
  emptyUserState,
  setLoggedInUser,
} from "../../Storage/Redux/userAuthSlice";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLLIElement>(null);
  const languageRef = useRef<HTMLLIElement>(null);
  const adminMenuRef = useRef<HTMLLIElement>(null);

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Čitam podatke o korisniku iz Redux store-a
  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  const isLoggedIn = !!userData?.id; // ili userData?.token
  const isAdmin = userData?.role === "admin"; // Provera da li je korisnik admin

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    dispatch(setLoggedInUser({ ...emptyUserState }));
    navigate("/");
  }, [dispatch, navigate]);

  const changeLanguage = useCallback(
    (lng: "sr" | "en") => {
      i18n.changeLanguage(lng);
      setLanguageOpen(false);
    },
    [i18n]
  );

  return (
    <div>
      <nav
        className={`navbar navbar-expand-lg fixed-top ${
          isScrolled ? "bg-body-tertiary shadow-sm" : "bg-transparent"
        }`}
        style={{
          transition: "background-color 0.3s ease",
          ...(isScrolled
            ? { backgroundColor: "#f8f9fa" }
            : { background: "linear-gradient(to right, #51285f, #4da172)" }),
        }}
      >
        <div className="container-fluid">
          <NavLink className="nav-link" aria-current="page" to="/">
            <img
              src={logo2}
              style={{ height: "40px" }}
              className="m-1"
              alt="Logo"
            />
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 w-100">
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to="/"
                  style={{ color: isScrolled ? "#000" : "#fff" }}
                >
                  {t("header.home")}
                </NavLink>
              </li>
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/tasks/myTasks"
                      style={{ color: isScrolled ? "#000" : "#fff" }}
                    >
                      {t("header.myTasks")}
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <li className="nav-item dropdown" ref={adminMenuRef}>
                      <a
                        className="nav-link"
                        href="#"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAdminMenuOpen((prev) => !prev);
                        }}
                        style={{ color: isScrolled ? "#000" : "#fff" }}
                      >
                        {t("header.adminPanel")}
                        <i
                          className={`bi ms-2 ${
                            adminMenuOpen ? "bi-chevron-up" : "bi-chevron-down"
                          }`}
                          style={{ transition: "transform 0.3s" }}
                        ></i>
                      </a>
                      <ul
                        className={`dropdown-menu custom-dropdown ${
                          adminMenuOpen ? "show" : ""
                        }`}
                        style={{
                          minWidth: "180px",
                        }}
                      >
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/admin/viewAllTasks"
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            {t("header.viewAllTasks")}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/admin/viewAllUsers"
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            {t("header.viewUsers")}
                          </NavLink>
                        </li>
                      </ul>
                    </li>
                  )}
                </>
              )}
              {/* Language Dropdown */}
              <li className="nav-item dropdown" ref={languageRef}>
                <a
                  className="nav-link language-toggle"
                  href="#"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLanguageOpen((prev: boolean) => !prev);
                  }}
                  style={{ color: isScrolled ? "#000" : "#fff" }}
                >
                  {t("header.language")}
                  <i
                    className={`bi ms-2 ${
                      languageOpen ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                    style={{ transition: "transform 0.3s" }}
                  ></i>
                </a>
                <ul
                  className={`dropdown-menu custom-dropdown ${
                    languageOpen ? "show" : ""
                  }`}
                >
                  <li
                    className="dropdown-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => changeLanguage("sr")}
                  >
                    <img
                      src={rsFlag}
                      alt="Serbian Flag"
                      style={{ height: "20px", marginRight: "8px" }}
                    />
                    {t("header.serbian")}
                  </li>
                  <li
                    className="dropdown-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => changeLanguage("en")}
                  >
                    <img
                      src={usFlag}
                      alt="US Flag"
                      style={{ height: "20px", marginRight: "8px" }}
                    />
                    {t("header.english")}
                  </li>
                </ul>
              </li>

              {/* User Menu */}
              <div
                className="d-flex align-items-center"
                style={{ marginLeft: "auto" }}
              >
                {isLoggedIn && (
                  <span
                    className="me-2"
                    style={{
                      color: isScrolled ? "#000" : "#fff",
                      fontWeight: 500,
                    }}
                  >
                    {t("header.welcome")}, {userData.name}
                  </span>
                )}
                <li className="nav-item dropdown" ref={userMenuRef}>
                  <a
                    className="nav-link"
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setUserMenuOpen((prev) => !prev);
                    }}
                    style={{ color: isScrolled ? "#000" : "#fff" }}
                  >
                    <i
                      className="bi bi-person-circle"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </a>
                  <ul
                    className={`dropdown-menu dropdown-menu-end custom-dropdown ${
                      userMenuOpen ? "show" : ""
                    }`}
                    style={{
                      minWidth: "170px",
                      right: "0",
                      left: "auto",
                      transform: "translateX(-10px)",
                    }}
                  >
                    {isLoggedIn ? (
                      <>
                        <li>
                          <NavLink
                            className="dropdown-item d-flex align-items-center"
                            to={`/userPage/${userData.id}`}
                            onClick={() => {
                              setUserMenuOpen(false);
                            }}
                          >
                            <i className="bi bi-person me-2"></i>
                            {t("header.profile")}
                          </NavLink>
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center text-danger"
                            onClick={() => {
                              handleLogout();
                              setUserMenuOpen(false);
                            }}
                          >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            {t("header.logout")}
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {t("header.login")}
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/register"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {t("registerPage.title")}
                          </NavLink>
                        </li>
                      </>
                    )}
                  </ul>
                </li>
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
