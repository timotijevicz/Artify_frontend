import React, { useMemo, useState } from "react";
import "./Galerija.css";
import Card from "../../components/Card/Card";

export default function Galerija() {
  // Mock podaci (kasnije API)
  const dela = useMemo(
    () => [
      {
        id: 101,
        slikaUrl: "/images/art1.jpg",
        naziv: "Zvezdana noć",
        umetnik: "Vinsent van Gog",
        cena: 82000000,
        staraCena: 85000000,
        tehnika: "Ulje na platnu",
        dimenzije: "73.7 × 92.1 cm",
        status: "Dostupno",
      },
      {
        id: 102,
        slikaUrl: "/images/art2.jpg",
        naziv: "Krik",
        umetnik: "Edvard Munk",
        cena: 119900000,
        tehnika: "Tempera",
        dimenzije: "91 × 73.5 cm",
        status: "Rezervisano",
      },
      {
        id: 103,
        slikaUrl: "/images/art3.jpg",
        naziv: "Mona Liza",
        umetnik: "Leonardo da Vinči",
        cena: "N/A",
        tehnika: "Ulje na drvetu",
        dimenzije: "77 × 53 cm",
        status: "Prodato",
      },
      {
        id: 104,
        slikaUrl: "/images/art4.jpg",
        naziv: "Noćni cvet",
        umetnik: "Mila Petrović",
        cena: 240,
        tehnika: "Akril",
        dimenzije: "60 × 80 cm",
        status: "Dostupno",
      },
    ],
    []
  );

  // toggle prikaza filtera
  const [showFilters, setShowFilters] = useState(false);

  // filter state
  const [fUmetnik, setFUmetnik] = useState("");
  const [fTehnika, setFTehnika] = useState("");
  const [fStatus, setFStatus] = useState("");

  // opcije za select (za sad iz dela; kasnije iz baze endpointa)
  const options = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));
    return {
      umetnici: uniq(dela.map((d) => d.umetnik).filter(Boolean)),
      tehnike: uniq(dela.map((d) => d.tehnika).filter(Boolean)),
      statusi: uniq(dela.map((d) => d.status).filter(Boolean)),
    };
  }, [dela]);

  // filtrirana dela
  const filtered = useMemo(() => {
    return dela.filter((d) => {
      if (fUmetnik && d.umetnik !== fUmetnik) return false;
      if (fTehnika && d.tehnika !== fTehnika) return false;
      if (fStatus && d.status !== fStatus) return false;
      return true;
    });
  }, [dela, fUmetnik, fTehnika, fStatus]);

  const handleReset = () => {
    setFUmetnik("");
    setFTehnika("");
    setFStatus("");
  };

  return (
    <div className="gallery-page">
      {/* HERO */}
      <header className="gallery-hero">
        <div className="gallery-badge">ARTIFY • Galerija</div>

        <h1 className="gallery-title">Umetnička dela bez buke i žurbe</h1>

        <p className="gallery-subtitle">
          Originali, savremeni radovi i bezvremenska dela — istraži galeriju u
          sopstvenom ritmu.
        </p>
      </header>

      {/* TOGGLE BUTTON */}
      <div className="filters-row">
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Zatvori filtere" : "Filtriraj"}
        </button>

        <div className="filters-meta">
          Prikazano: <b>{filtered.length}</b>
        </div>
      </div>

      {/* FILTER CARD */}
      {showFilters && (
        <section className="gallery-filters">
          <select value={fUmetnik} onChange={(e) => setFUmetnik(e.target.value)}>
            <option value="">Svi umetnici</option>
            {options.umetnici.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select value={fTehnika} onChange={(e) => setFTehnika(e.target.value)}>
            <option value="">Sve tehnike</option>
            {options.tehnike.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">Svi statusi</option>
            {options.statusi.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </section>
      )}

      {/* GRID */}
      <section className="gallery-section">
        <div className="gallery-grid">
          {filtered.map((delo) => (
            <Card key={delo.id} {...delo} />
          ))}
        </div>
      </section>
    </div>
  );
}
