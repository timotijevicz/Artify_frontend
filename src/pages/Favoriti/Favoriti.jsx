import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Favoriti.css";
import Card from "../../components/Card/Card";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../components/axios/axiosInstance";

export default function Favoriti() {
  const { isKupac, authToken, userId, isLoading } = useContext(AppContext);

  const [favoriti, setFavoriti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapToCardProps = (fav) => {
    const delo = fav.umetnickoDelo ?? fav.UmetnickoDelo ?? fav;

    return {
      id:
        delo.id ??
        delo.Id ??
        fav.umetnickoDeloId ??
        fav.UmetnickoDeloId ??
        fav.umetnickoDeloID ??
        fav.UmetnickoDeloID,

      slikaUrl: delo.slikaUrl ?? delo.SlikaUrl ?? delo.slika ?? "",
      naziv: delo.naziv ?? delo.Naziv ?? "",
      cena: delo.cena ?? delo.Cena ?? null,
      staraCena: delo.staraCena ?? delo.StaraCena ?? null,
      tehnika: delo.tehnika ?? delo.Tehnika ?? "",
      status: delo.status ?? delo.Status ?? "",
      umetnik: delo.umetnik ?? delo.Umetnik ?? "",
      valuta: "€",
    };
  };

  const normalizeError = (err) => {
    if (!err) return "Greška pri učitavanju favorita.";
    if (typeof err === "string") return err;
    if (err.title) return err.title;
    if (err.message) return err.message;
    return "Greška pri učitavanju favorita.";
  };

  const loadFavoriti = useCallback(async () => {
    if (!authToken || !userId) {
      setFavoriti([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.get(
        `Favoriti/PrikazOmiljenihDelaPoID/${userId}`
      );

      const raw = Array.isArray(res.data) ? res.data : [];
      setFavoriti(raw.map(mapToCardProps).filter((x) => !!x.id));
    } catch (err) {
      setError(normalizeError(err?.response?.data));
      setFavoriti([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, userId]);

  useEffect(() => {
    loadFavoriti();
  }, [loadFavoriti]);

  // ======================
  // GUARDOVI
  // ======================
  if (isLoading || loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-meta">Učitavanje...</div>
      </div>
    );
  }

  if (!authToken || !isKupac) {
    return (
      <div className="favorites-page">
        <header className="favorites-hero">
          <div className="favorites-badge">ARTIFY • Favoriti</div>
          <h1 className="favorites-title">Favoriti</h1>
          <p className="favorites-subtitle">
            Prijavi se kao <b>kupac</b> da bi koristio favorite.
          </p>
          <Link to="/login" className="favorites-empty-cta">
            Prijava
          </Link>
        </header>
      </div>
    );
  }

  const handleFavoriteChange = (artworkId, liked) => {
    if (!liked) {
      setFavoriti((prev) => prev.filter((x) => x.id !== artworkId));
    }
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="favorites-page">
      <header className="favorites-hero">
        <div className="favorites-badge">ARTIFY • Favoriti</div>
        <div className="favorites-hero-row">
          <div>
            <h1 className="favorites-title">Tvoja omiljena dela</h1>
            <br />
            <p>Ovo je tvoja lična kolekcija inspiracije — mesto gde umetnost ostaje blizu.</p>
            <p>Nova dela čekaju da postanu deo tvoje kolekcije.</p>
          </div>
          <div className="favorites-actions">
            <button
              type="button"
              className="favorites-btn"
              onClick={loadFavoriti}
            >
              Osveži
            </button>
            <Link to="/galerija" className="favorites-link">
              Nazad na galeriju
            </Link>
          </div>
        </div>
      </header>

      <section className="favorites-section">
        {error && <div className="favorites-meta error">{error}</div>}

        {!error && favoriti.length === 0 && (
          <div className="favorites-empty">
            <div className="favorites-empty-card">
              <h2>Nemaš još favorita</h2>
              <Link to="/galerija" className="favorites-empty-cta">
                Otvori galeriju
              </Link>
            </div>
          </div>
        )}

        {!error && favoriti.length > 0 && (
          <div className="favorites-grid">
            {favoriti.map((delo) => (
              <Card
                key={delo.id}
                {...delo}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
