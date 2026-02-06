import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Ikonica({ tip }) {
  // Minimalne inline ikonice (bez biblioteka)
  if (tip === "muzej") {
    return (
      <svg className="feat-ic" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3 2 8v2h20V8L12 3Zm-7 7h2v9H5v-9Zm4 0h2v9H9v-9Zm4 0h2v9h-2v-9Zm4 0h2v9h-2v-9ZM3 21v-2h18v2H3Z"
        />
      </svg>
    );
  }
  if (tip === "cetkica") {
    return (
      <svg className="feat-ic" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 16c-1.66 0-3 1.34-3 3 0 1.1-.9 2-2 2v2c2.21 0 4-1.79 4-4 0-.55.45-1 1-1 .83 0 1.5.67 1.5 1.5V22H11v-2.5C11 17.01 9.49 16 7 16Zm14.71-9.29-4.42-4.42a.996.996 0 0 0-1.41 0L9 9.17 14.83 15l6.88-6.88c.39-.39.39-1.02 0-1.41Z"
        />
      </svg>
    );
  }
  // "globus"
  return (
    <svg className="feat-ic" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm7.93 9h-3.17c-.14-2.24-.74-4.32-1.72-5.93A8.01 8.01 0 0 1 19.93 11ZM12 4c.98 1.29 1.67 3.7 1.82 7H10.18C10.33 7.7 11.02 5.29 12 4ZM4.07 13h3.17c.14 2.24.74 4.32 1.72 5.93A8.01 8.01 0 0 1 4.07 13ZM7.24 11H4.07A8.01 8.01 0 0 1 8.96 5.07C7.98 6.68 7.38 8.76 7.24 11Zm2.94 2h3.64c-.15 3.3-.84 5.71-1.82 7-.98-1.29-1.67-3.7-1.82-7Zm5.86 5.93c.98-1.61 1.58-3.69 1.72-5.93h3.17a8.01 8.01 0 0 1-4.89 5.93Z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="home-badge">
            ARTIFY • Početna
          </div>
          <h1 className="hero-title">
            Platforma za <span>umetnike</span> i <span>kolekcionare</span>
          </h1>

          <p className="hero-text">
            Artify omogućava umetnicima da prodaju svoja dela direktno, a kupcima
            da pronađu autentičnu umetnost bez posrednika.
          </p>

          <div className="hero-actions">
            <Link to="/galerija" className="no-underline">
              <button className="btn primary">Pregledaj dela</button>
            </Link>

            <Link to="/registracija-umetnik" className="no-underline">
              <button className="btn ghost">Postani umetnik</button>
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-frame">
            <img src="/images/home.jpg" alt="Umetnik" className="hero-img" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2 className="section-title">Artify, ali kao u galeriji</h2>
        <p className="section-subtitle">
          Manje buke, više umetnosti.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <Ikonica tip="muzej" />
            <h3>Kurirana atmosfera</h3>
            <p>
              Kao miran hod kroz izložbu: kategorije postoje da usmere pogled, ali
              izbor ostaje tvoj — otkrij ono što te “pogodi”.
            </p>
            <Link to="/galerija" className="feature-link">
              Uđi u galeriju <span className="arrow">→</span>
            </Link>
          </div>

          <div className="feature-card">
            <Ikonica tip="cetkica" />
            <h3>Umetnik u prvom planu</h3>
            <p>
              Iza svakog rada stoji ruka, priča i proces. Artify daje prostoru
              portfoliju — da se stil prepozna pre cene.
            </p>
            <Link to="/registracija-umetnik" className="feature-link">
              Postavi svoj rad <span className="arrow">→</span>
            </Link>
          </div>

          <div className="feature-card">
            <Ikonica tip="globus" />
            <h3>Umetnost bez žurbe</h3>
            <p>
              Siguran tok kupovine, jasni koraci, bez “trikova”. Samo ti, delo i
              osećaj da je izbor pravi.
            </p>
            <Link to="/registracija" className="feature-link">
              Sačuvaj omiljene <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="art-facts">
        <div className="facts-head">
          <h2 className="section-title">Zanimljivosti iz istorije umetnosti</h2>
          <p className="section-subtitle">
            Kratke priče iza čuvenih dela — inspiracija za novi pogled na umetnost.
          </p>
        </div>

        <div className="facts-grid">
          <article className="fact-card">
            <div className="fact-top">
              <span className="fact-pill">1889 • Van Gog</span>
              <h3 className="fact-title">Zvezdana noć</h3>
            </div>
            <p className="fact-text">
              Naslikana je dok je Van Gog bio u sanatorijumu u Sen-Remiju. Vrtložni
              potezi i preuveličano noćno nebo postali su simbol njegovog emotivnog
              izraza — ne “realističnog” pejzaža, već osećaja.
            </p>
          </article>

          <article className="fact-card">
            <div className="fact-top">
              <span className="fact-pill">1911 • Louvre</span>
              <h3 className="fact-title">Mona Liza</h3>
            </div>
            <p className="fact-text">
              Slika je ukradena iz Luvra 1911. godine i nestala na dve godine.
              Upravo ta krađa je dodatno “zapalila” svetsku slavu dela — ljudi su
              masovno dolazili da vide prazno mesto na zidu.
            </p>
          </article>

          <article className="fact-card">
            <div className="fact-top">
              <span className="fact-pill">1893 • Edvard Munk</span>
              <h3 className="fact-title">Krik</h3>
            </div>
            <p className="fact-text">
              Munk je zapisao da je inspiracija došla iz trenutka “napada
              anksioznosti” dok je posmatrao krvavo crveno nebo. “Krik” zapravo
              prikazuje osećaj koji “prolazi kroz prirodu”, ne samo kroz osobu.
            </p>
          </article>

          <article className="fact-card">
            <div className="fact-top">
              <span className="fact-pill">1907 • Picasso</span>
              <h3 className="fact-title">Avinjonske devojke</h3>
            </div>
            <p className="fact-text">
              Delo je promenilo tok moderne umetnosti: oštri oblici i uticaji
              afričkih maski bili su šok za publiku tog vremena i otvorili vrata
              kubizmu i novom jeziku forme.
            </p>
          </article>
        </div>

        <div className="facts-actions">
          <Link to="/about" className="no-underline">
            <button className="btn ghost">Saznaj više o Artify-ju</button>
          </Link>
        </div>
      </section>

    </div>
  );
}
