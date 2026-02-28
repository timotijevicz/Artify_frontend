import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import "./CardArtist.css";

export default function CardArtist({
  id,
  ime = "Nepoznati umetnik",
  stil = "Savremena umetnost",
  lokacija = "Srbija",
  avatarUrl = "/images/art1.jpg",
  brojRadova = 0,
}) {
  const { authToken } = useContext(AppContext);

  // Ako nije ulogovan -> šalji na login (umesto profila umetnika)
  const profileHref = authToken
    ? (id ? `/umetnici/${id}` : "/umetnici")
    : "/login";

  return (
    <article className="artist-card">
      <Link
        to={profileHref}
        className="artist-card-link"
        aria-label={authToken ? `Profil: ${ime}` : "Prijavi se da vidiš profil"}
        title={authToken ? "" : "Prijavi se da vidiš profil"}
      >
        {/* <div className="artist-media">
          <img src={avatarUrl} alt={ime} className="artist-img" />
          <div className="artist-overlay" />
          {!authToken && <div className="artist-lock">🔒 Prijavi se</div>}
        </div> */}

        <div className="artist-body">
          <div className="artist-top">
            <h3 className="artist-name" title={ime}>
              {ime}
            </h3>
            <span className="artist-pill">{brojRadova} radova</span>
          </div>

          <div className="artist-meta">
            <span className="artist-style">{stil}</span>
            <span className="dot">•</span>
            <span className="artist-loc">{lokacija}</span>
          </div>

          
          {!authToken && (
            <div className="artist-hint">Prijavi se da vidiš profil umetnika</div>
          )}
        </div>
      </Link>
    </article>
  );
}
