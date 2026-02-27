import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

function ProfileDropdown({ profileMenuOpen, setProfileMenuOpen, handleLogout }) {
  const { isAdmin, isUmetnik } = useContext(AppContext);

  const profilePath = isAdmin
    ? "/admin/profil"
    : isUmetnik
    ? "/umetnik/profil"
    : "/kupac/profil";

  return (
    <>
      {profileMenuOpen && (
        <div className="profile-dropdown">
          <Link to={profilePath} onClick={() => setProfileMenuOpen(false)}>
            Moj profil
          </Link>

          <button onClick={handleLogout}>Odjava</button>
        </div>
      )}
    </>
  );
}

export default ProfileDropdown;