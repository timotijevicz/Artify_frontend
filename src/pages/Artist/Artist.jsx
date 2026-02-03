import React, { useMemo } from "react";
import "./Artist.css";
import CardArtist from "../../components/CardArtist/CardArtist";

export default function Umetnici() {
  // Mock podaci — kasnije zameni API pozivom
  const umetnici = useMemo(
    () => [
      {
        id: "mila-petrovic",
        ime: "Mila Petrović",
        stil: "Apstraktno • Akril",
        lokacija: "Beograd",
        avatarUrl: "/images/art1.jpg",
        brojRadova: 18,
      },
      {
        id: "nikola-jovanovic",
        ime: "Nikola Jovanović",
        stil: "Fotografija • Urbano",
        lokacija: "Novi Sad",
        avatarUrl: "/images/art2.jpg",
        brojRadova: 12,
      },
      {
        id: "ana-markovic",
        ime: "Ana Marković",
        stil: "Ulje • Minimalizam",
        lokacija: "Niš",
        avatarUrl: "/images/art3.jpg",
        brojRadova: 9,
      },
      {
        id: "luka-ilic",
        ime: "Luka Ilić",
        stil: "Crtež • Tuš",
        lokacija: "Kragujevac",
        avatarUrl: "/images/art4.jpg",
        brojRadova: 14,
      },
    ],
    []
  );

  return (
    <div className="artists-page">
      <header className="artists-hero">
        <div className="artists-badge">ARTIFY • Umetnici</div>
        <h1 className="artists-title">Upoznaj autore koji stoje iza svakog poteza</h1>
        <p className="artists-subtitle">
          Istraži stilove, portfolio i priče — pronađi umetnike čiji radovi “legnu” na tvoj ukus.
        </p>
      </header>

      <section className="artists-section">
        <div className="artists-grid">
          {umetnici.map((u) => (
            <CardArtist key={u.id} {...u} />
          ))}
        </div>
      </section>
    </div>
  );
}
