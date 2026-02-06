import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../context/AppContext";

export default function Navbar() {
  const location = useLocation();

  const { authToken, isKupac, isUmetnik, isAdmin, logout } =
    useContext(AppContext) || {};

  const isLoggedIn = !!authToken;

  const [click, setClick] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleClick = () => setClick((prev) => !prev);
  const closeMobileMenu = () => setClick(false);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  // Kad promeniš rutu -> zatvori menije (da ne ostane otvoreno)
  useEffect(() => {
    setClick(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    setClick(false);
    logout?.();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/home" className="navbar-logo" onClick={closeMobileMenu}>
          Artify <i className="fas fa-thin fa-palette"></i>
        </Link>

        {/* Mobile menu icon */}
        <button className="menu-icon" onClick={handleClick} aria-label="Meni">
          <i className={click ? "fas fa-light fa-times" : "fas fa-light fa-bars"} />
        </button>

        {/* Links */}
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link
              to="/home"
              className={`nav-links ${isActive("/home") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              Početna
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/galerija"
              className={`nav-links ${isActive("/galerija") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              Galerija
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/umetnici"
              className={`nav-links ${isActive("/umetnici") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              Umetnici
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/about"
              className={`nav-links ${isActive("/about") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              O nama
            </Link>
          </li>

          {isKupac && (
            <li className="nav-item">
              <Link
                to="/porudzbine"
                className={`nav-links ${isActive("/porudzbine") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                Moje porudžbine
              </Link>
            </li>
          )}

          {isUmetnik && (
            <li className="nav-item">
              <Link
                to="/umetnik/moji-radovi"
                className={`nav-links ${isActive("/umetnik/moji-radovi") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                Moji radovi
              </Link>
            </li>
          )}

          {isAdmin && (
            <li className="nav-item">
              <Link
                to="/admin"
                className={`nav-links ${isActive("/admin") ? "active" : ""}`}
                onClick={closeMobileMenu}
              >
                Admin panel
              </Link>
            </li>
          )}

          {/* Auth buttons u mobile meniju */}
          {!isLoggedIn && (
            <li className="nav-item nav-auth-mobile">
              <Link to="/login" className="nav-auth-link" onClick={closeMobileMenu}>
                Prijava
              </Link>
              <Link
                to="/registracija"
                className="nav-auth-link nav-auth-link-accent"
                onClick={closeMobileMenu}
              >
                Registracija
              </Link>
            </li>
          )}
        </ul>

        {/* Auth section desktop */}
        <div className="auth-section">
           {isLoggedIn && (
            <Link
              to="/favoriti"
              className={`favorites-btn ${isActive("/favoriti") ? "active" : ""}`}
              aria-label="Favoriti"
            >
              <i className="fas fa-heart"></i>

              {/* badge – kasnije možeš vezati za state */}
              <span className="favorites-badge">3</span>
            </Link>
          )}
          {isLoggedIn ? (
            <div className="profile-section">
              <button
                className="profile-btn"
                onClick={toggleProfileMenu}
                aria-expanded={profileMenuOpen ? "true" : "false"}
                aria-label="Otvori profil meni"
              >
                <i className="fas fa-user" />
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link to="/profil" onClick={() => setProfileMenuOpen(false)}>
                    Moj profil
                  </Link>
                  <button onClick={handleLogout}>Odjava</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Prijava
              </Link>
              <Link to="/registracija" className="btn-register">
                Registracija
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
