import React, { useMemo, useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Card.css";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";

export default function Card({
  id,
  slikaUrl,
  naziv = "Nepoznato delo",
  cena = "N/A",
  valuta = "€",
  staraCena,
  tehnika = "Nepoznata tehnika",
  status = "Dostupno",
  umetnik = "Nepoznati umetnik",
}) {
  const { isKupac } = useContext(AppContext) || {};

  const [omiljeno, setOmiljeno] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

 useEffect(() => {
  const proveriFavorite = async () => {
    if (!isKupac || !id) return;

    try {
      const res = await axiosInstance.get(
        `/Favoriti/DaLiJeUFavoritima/${id}`
      );
      setOmiljeno(res.data === true);
    } catch (err) {
      setOmiljeno(false);
    }
  };

  proveriFavorite();
}, [id, isKupac]);


  const statusClass = useMemo(() => {
    if (status === "Dostupno") return "status-pill s-ok";
    if (status === "Rezervisano") return "status-pill s-hold";
    if (status === "Prodato") return "status-pill s-sold";
    return "status-pill";
  }, [status]);

  const detailsHref = id ? `/artwork/${id}` : "/galerija";

 const toggleFavorite = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!isKupac) {
    alert("Samo kupci mogu dodavati u favorite.");
    return;
  }

  if (!id) return;

  try {
    setFavLoading(true);

    if (omiljeno) {
      await axiosInstance.delete(
        `/Favoriti/UkloniIzFavorita/${id}`
      );
      setOmiljeno(false);
    } else {
      await axiosInstance.post(
        `/Favoriti/DodajUFavorite/${id}`
      );
      setOmiljeno(true);
    }
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      (typeof err.response?.data === "string"
        ? err.response.data
        : "") ||
      "Greška pri radu sa favoritima.";
    alert(msg);
  } finally {
    setFavLoading(false);
  }
};


  return (
    <article className="artify-card">
      <div className="artify-media">
        <Link
          to={detailsHref}
          className="artify-media-link"
          aria-label={`Otvori: ${naziv}`}
        >
          <img className="artify-img" src={slikaUrl} alt={naziv} />
          <div className="artify-overlay" />
        </Link>

        <div className="artify-topbar">
          <span className={statusClass}>{status}</span>

          <div className="artify-actions">
            <button
              type="button"
              className={`icon-btn ${omiljeno ? "is-liked" : ""}`}
              onClick={toggleFavorite}
              disabled={favLoading}
              aria-label={omiljeno ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
              title={omiljeno ? "U omiljenim" : "Dodaj u omiljene"}
            >
              <i className={omiljeno ? "fas fa-heart" : "far fa-heart"} />
            </button>

            <Link
              to={detailsHref}
              className="icon-btn as-link"
              aria-label="Pogledaj detalje"
              title="Detalji"
            >
              <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>

        <div className="artify-bottombar">
          <span className="chip">{tehnika}</span>
        </div>
      </div>

      <div className="artify-body">
        <div className="artify-row">
          <div className="artify-artist" title={umetnik}>
            {umetnik}
          </div>

          <div className="artify-price">
            {staraCena ? (
              <span className="old">
                {valuta}
                {staraCena}
              </span>
            ) : null}
            <span className="now">
              {valuta}
              {cena}
            </span>
          </div>
        </div>

        <Link to={detailsHref} className="artify-title-link">
          <h3 className="artify-title" title={naziv}>
            {naziv}
          </h3>
        </Link>

        <div className="artify-hint">
          Klikni za detalje <span className="arrow">→</span>
        </div>
      </div>
    </article>
  );
}
