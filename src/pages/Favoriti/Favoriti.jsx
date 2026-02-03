import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Favoriti.css";
import Card from "../../components/Card/Card";
import { AppContext } from "../../context/AppContext";
import axiosInstance from "../../components/axios/axiosInstance"; // prilagodi putanju ako ti je drugačije

export default function Favoriti() {
  const { isKupac, authToken, userId } = useContext(AppContext) || {};

  const [favoriti, setFavoriti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavoriti = async () => {
    if (!authToken || !userId) return;

    setLoading(true);
    setError("");

    try {
      // Ako nemaš interceptor za token, moraš ga poslati ovde:
      // const res = await axiosInstance.get(`/Favoriti/PrikazOmiljenihDelaPoID/${userId}`, {
      //   headers: { Authorization: `Bearer ${authToken}` },
      // });

      const res = await axiosInstance.get(
        `/Favoriti/PrikazOmiljenihDelaPoID/${userId}`
      );

      setFavoriti(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 404) {
        // tvoj backend vraća 404 kad nema favorita -> tretiramo kao prazno
        setFavoriti([]);
      } else {
        setError(
          err.response?.data?.message ||
            (typeof err.response?.data === "string" ? err.response.data : "") ||
            "Greška pri učitavanju favorita."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, userId]);

  // Ako nije kupac ili nije ulogovan
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

  return (
    <div className="favorites-page">
      {/* HERO */}
      <header className="favorites-hero">
        <div className="favorites-badge">ARTIFY • Favoriti</div>

        <div className="favorites-hero-row">
          <div>
            <h1 className="favorites-title">Tvoja omiljena dela</h1>
            <p className="favorites-subtitle">
              Lista se učitava direktno sa servera po tvom nalogu.
            </p>
          </div>

          <div className="favorites-actions">
            <button type="button" className="favorites-btn" onClick={loadFavoriti}>
              Osveži
            </button>

            <Link to="/galerija" className="favorites-link">
              Nazad na galeriju
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="favorites-section">
        {loading && <div className="favorites-meta">Učitavanje...</div>}

        {!loading && error && (
          <div className="favorites-meta error">{error}</div>
        )}

        {!loading && !error && favoriti.length === 0 && (
          <div className="favorites-empty">
            <div className="favorites-empty-card">
              <div className="favorites-empty-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h2>Nemaš još favorita</h2>
              <p>Dodaj delo u favorite klikom na ❤️ u galeriji.</p>
              <Link to="/galerija" className="favorites-empty-cta">
                Otvori galeriju
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && favoriti.length > 0 && (
          <>
            <div className="favorites-meta">
              Prikazano: <b>{favoriti.length}</b>
            </div>

            <div className="favorites-grid">
              {favoriti.map((fav) => {
                // backend može vratiti:
                // - direktno umetničko delo
                // - ili favorite objekat sa umetnickoDelo poljem
                const delo = fav.umetnickoDelo ?? fav;

                return <Card key={delo.id || fav.id} {...delo} />;
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
