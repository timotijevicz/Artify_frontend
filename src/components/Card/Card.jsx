import React, { useMemo, useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Card.css";
import axiosInstance from "../axios/axiosInstance";
import { AppContext } from "../../context/AppContext";

export default function Card({
  id,
  slikaUrl,
  naziv = "Nepoznato delo",
  cena = "N/A",
  valuta = "€",
  staraCena,
  tehnika = "Nepoznata tehnika",
  dimenzije,
  status = "Dostupno",
  umetnik = "Nepoznati umetnik",
  onFavoriteChange,
}) {
  const { isKupac, authToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [omiljeno, setOmiljeno] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const isClickable = Boolean(authToken);
  const detailsHref = id ? `/artwork/${id}` : "/galerija";

  useEffect(() => {
    let cancelled = false;

    const proveriFavorite = async () => {
      if (!isKupac || !authToken || !id) return;
      try {
        const res = await axiosInstance.get(
          `Favoriti/DaLiJeUFavoritima/${id}`
        );
        if (!cancelled) setOmiljeno(res.data === true);
      } catch {
        if (!cancelled) setOmiljeno(false);
      }
    };

    proveriFavorite();
    return () => {
      cancelled = true;
    };
  }, [id, isKupac, authToken]);

  const statusClass = useMemo(() => {
    if (status === "Dostupno") return "status-pill s-ok";
    if (status === "Rezervisano") return "status-pill s-hold";
    if (status === "Prodato") return "status-pill s-sold";
    return "status-pill";
  }, [status]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isKupac) return alert("Samo kupci mogu dodavati u favorite.");
    if (!authToken) return alert("Nisi prijavljen.");

    try {
      setFavLoading(true);

      if (omiljeno) {
        await axiosInstance.delete(`Favoriti/UkloniIzFavorita/${id}`);
        setOmiljeno(false);
        onFavoriteChange?.(id, false);
      } else {
        await axiosInstance.post(`Favoriti/DodajUFavorite/${id}`);
        setOmiljeno(true);
        onFavoriteChange?.(id, true);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri radu sa favoritima.");
      alert(msg);
    } finally {
      setFavLoading(false);
    }
  };

  const handleCardClick = () => {
    if (!isClickable) return;
    navigate(detailsHref);
  };

  return (
    <article
      className={`artify-card ${!isClickable ? "is-locked" : ""}`}
      onClick={handleCardClick}
      role={isClickable ? "button" : undefined}
    >
      <div className="artify-media">
        <img className="artify-img" src={slikaUrl} alt={naziv} />

        <div className="artify-topbar">
          <span className={statusClass}>{status}</span>

          <div className="artify-actions">
            <button
              type="button"
              className={`icon-btn ${omiljeno ? "is-liked" : ""}`}
              onClick={toggleFavorite}
              disabled={favLoading}
            >
              <i className={omiljeno ? "fas fa-heart" : "far fa-heart"} />
            </button>

            <Link
              to={detailsHref}
              className="icon-btn as-link"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>

        <div className="artify-bottombar">
          <span className="chip">{tehnika}</span>
          {dimenzije && (
            <span className="chip chip--muted">{dimenzije}</span>
          )}
        </div>
      </div>

      <div className="artify-body">
        <div className="artify-row">
          <div className="artify-artist" title={umetnik}>
            {umetnik}
          </div>
          <div className="artify-price">
            {staraCena && (
              <span className="old">
                {valuta}
                {staraCena}
              </span>
            )}
            <span className="now">
              {valuta}
              {cena}
            </span>
          </div>
        </div>

        <h3 className="artify-title">{naziv}</h3>
      </div>
    </article>
  );
}
