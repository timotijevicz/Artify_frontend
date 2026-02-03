import React from "react";
import { Link } from "react-router-dom";
import "./CardArtist.css";

export default function CardArtist({
  id,
  ime = "Nepoznati umetnik",
  stil = "Savremena umetnost",
  lokacija = "Srbija",
  avatarUrl = "/images/art1.jpg",
  brojRadova = 0,
}) {
  // Ruta profila (prilagodi ako ti je drugačije)
  const profileHref = id ? `/umetnici/${id}` : "/umetnici";

  return (
    <article className="artist-card">
      <Link to={profileHref} className="artist-card-link" aria-label={`Profil: ${ime}`}>
        <div className="artist-media">
          <img src={avatarUrl} alt={ime} className="artist-img" />
          <div className="artist-overlay" />
        </div>

        <div className="artist-body">
          <div className="artist-top">
            <h3 className="artist-name" title={ime}>{ime}</h3>
            <span className="artist-pill">{brojRadova} radova</span>
          </div>

          <div className="artist-meta">
            <span className="artist-style">{stil}</span>
            <span className="dot">•</span>
            <span className="artist-loc">{lokacija}</span>
          </div>

          <div className="artist-cta">
            Pogledaj profil <span className="arrow">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
