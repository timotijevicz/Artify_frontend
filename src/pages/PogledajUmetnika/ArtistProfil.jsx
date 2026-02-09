import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import "./ArtistProfil.css";

export default function ArtistProfile() {
  const { id } = useParams(); // ruta npr: /umetnici/:id

  const [umetnik, setUmetnik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // helper (različita imena polja)
  const pick = useCallback((obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  }, []);

  const formatName = useCallback(
    (u) => {
      const k = pick(u, "korisnik", "Korisnik") || {};
      const full =
        pick(k, "imeIPrezime", "ImeIPrezime") ||
        pick(u, "imeIPrezime", "ImeIPrezime");

      if (full) return String(full).trim();

      const ime = pick(k, "ime", "Ime") || pick(u, "ime", "Ime") || "";
      const prezime = pick(k, "prezime", "Prezime") || pick(u, "prezime", "Prezime") || "";
      const both = `${ime} ${prezime}`.trim();
      if (both) return both;

      return (
        pick(k, "userName", "UserName") ||
        pick(k, "email", "Email") ||
        pick(u, "email", "Email") ||
        "Umetnik"
      );
    },
    [pick]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get(`Umetnik/VracaUmetnikaPoID/${id}`);
        if (cancelled) return;

        setUmetnik(res.data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.Poruka ||
              e?.response?.data?.poruka ||
              "Greška pri učitavanju profila umetnika."
          );
          setUmetnik(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const view = useMemo(() => {
    if (!umetnik) return null;

    const k = pick(umetnik, "korisnik", "Korisnik") || {};
    const name = formatName(umetnik);

    const bio = pick(umetnik, "biografija", "Biografija") || "Biografija nije uneta.";
    const city = pick(umetnik, "lokacija", "Lokacija", "grad", "Grad") || "—";
    const style = pick(umetnik, "stil", "Stil") || pick(umetnik, "tehnika", "Tehnika") || "—";

    const avatar =
      pick(umetnik, "avatarUrl", "AvatarUrl", "slikaUrl", "SlikaUrl", "slika", "Slika") ||
      pick(k, "avatarUrl", "AvatarUrl", "slikaUrl", "SlikaUrl", "slika", "Slika") ||
      null;

    const dela =
      pick(umetnik, "umetnickaDela", "UmetnickaDela", "dela", "Dela") || [];

    const works = Array.isArray(dela) ? dela : [];

    return { name, bio, city, style, avatar, works };
  }, [umetnik, pick, formatName]);

  if (loading) {
    return (
      <section className="ap-page">
        <div className="ap-shell">
          <div className="ap-skel ap-skelHero" />
          <div className="ap-skel ap-skelGrid" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="ap-page">
        <div className="ap-shell">
          <div className="ap-error">
            <div className="ap-errorTitle">Ups.</div>
            <div className="ap-errorText">{error}</div>
            <Link className="ap-btn ap-btnGhost" to="/umetnici">
              ← Nazad na umetnike
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!view) return null;

  return (
    <section className="ap-page">
      <div className="ap-shell">
        <header className="ap-top">
          <Link className="ap-back" to="/umetnici">
            ← Nazad
          </Link>

          <div className="ap-badge">ARTIFY • Profil umetnika</div>
        </header>

        <div className="ap-hero">
          <div className="ap-heroLeft">
            <div className="ap-avatar">
              {view.avatar ? (
                <img src={view.avatar} alt={view.name} />
              ) : (
                <div className="ap-avatarFallback">🎨</div>
              )}
            </div>

            <div className="ap-main">
              <h1 className="ap-name">{view.name}</h1>

              <div className="ap-meta">
                <span className="ap-pill">{view.style}</span>
                <span className="ap-dot" />
                <span className="ap-location">{view.city}</span>
              </div>

              <div className="ap-actions">
                <Link className="ap-btn ap-btnPrimary" to="/galerija">
                  Otvori galeriju
                </Link>
                <a className="ap-btn ap-btnGhost" href="#radovi">
                  Pogledaj radove
                </a>
              </div>
            </div>
          </div>

          <aside className="ap-heroRight">
            <div className="ap-box">
              <div className="ap-boxLabel">Biografija</div>
              <div className="ap-bio">{view.bio}</div>
            </div>

            <div className="ap-stats">
              <div className="ap-stat">
                <div className="ap-statLabel">Radova</div>
                <div className="ap-statVal">{view.works.length}</div>
              </div>
              <div className="ap-stat">
                <div className="ap-statLabel">Lokacija</div>
                <div className="ap-statVal ap-statSmall">{view.city}</div>
              </div>
            </div>
          </aside>
        </div>

        <section id="radovi" className="ap-section">
          <div className="ap-sectionHead">
            <h2 className="ap-sectionTitle">Radovi</h2>
            <div className="ap-sectionHint">
              {view.works.length ? "Izbor umetničkih dela ovog autora." : "Umetnik još nema radove za prikaz."}
            </div>
          </div>

          {view.works.length ? (
            <div className="ap-grid">
              {view.works.map((d, i) => {
                const did = d?.umetnickoDeloId ?? d?.UmetnickoDeloId ?? d?.id ?? d?.Id ?? i;
                const naziv = d?.naziv ?? d?.Naziv ?? "Umetničko delo";
                const slika = d?.slikaUrl ?? d?.SlikaUrl ?? d?.slika ?? d?.Slika ?? null;
                const cena = d?.cena ?? d?.Cena ?? null;

                return (
                  <Link key={did} to={`/artwork/${did}`} className="ap-work">
                    <div className="ap-workMedia">
                      {slika ? <img src={slika} alt={naziv} /> : <div className="ap-workFallback">🖼️</div>}
                    </div>
                    <div className="ap-workBody">
                      <div className="ap-workTitle">{naziv}</div>
                      <div className="ap-workRow">
                        <span className="ap-muted">{cena ? `${cena} €` : "Cena na upit"}</span>
                        <span className="ap-chip">Detalji →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="ap-empty">
              <div className="ap-emptyCard">
                <h3>Nema radova</h3>
                <p>Čim umetnik doda radove, pojaviće se ovde.</p>
                <Link className="ap-btn ap-btnGhost" to="/galerija">
                  Vrati se na galeriju
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
