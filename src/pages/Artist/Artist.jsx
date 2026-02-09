import React, { useEffect, useMemo, useState } from "react";
import "./Artist.css";
import CardArtist from "../../components/CardArtist/CardArtist";
import axiosInstance from "../../components/axios/axiosInstance";

export default function Umetnici() {
  const [umetniciRaw, setUmetniciRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ FILTER STATE
  const [q, setQ] = useState("");
  const [tech, setTech] = useState("ALL");
  const [stilFilter, setStilFilter] = useState("ALL");
  const [sort, setSort] = useState("AZ"); // AZ | ZA | MOST_WORKS

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get("Umetnik/SviUmetnici");
        const list = Array.isArray(res.data) ? res.data : [];

        if (!cancelled) setUmetniciRaw(list);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.Poruka ||
              e?.response?.data?.poruka ||
              "Greška pri učitavanju umetnika."
          );
          setUmetniciRaw([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // helperi za “različita imena polja”
  const pick = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };

  // mapiranje na props koje CardArtist očekuje (kao u tvom mocku)
  const umetnici = useMemo(() => {
    return umetniciRaw
      .map((u, idx) => {
        const korisnik = pick(u, "korisnik", "Korisnik") || {};

        const id =
          pick(u, "umetnikId", "UmetnikId", "id", "Id") ??
          pick(korisnik, "id", "Id", "korisnikId", "KorisnikId") ??
          idx;

        const ime =
          pick(korisnik, "imeIPrezime", "ImeIPrezime") ||
          `${pick(korisnik, "ime", "Ime") || ""} ${
            pick(korisnik, "prezime", "Prezime") || ""
          }`.trim() ||
          pick(korisnik, "userName", "UserName") ||
          pick(korisnik, "email", "Email") ||
          pick(u, "imeIPrezime", "ImeIPrezime") ||
          "Umetnik";

        // NOTE: ovde "stil" može biti stil ili tehnika (kao kod tebe)
        const stil =
          pick(u, "stil", "Stil") || pick(u, "tehnika", "Tehnika") || "—";

        const lokacija =
          pick(u, "lokacija", "Lokacija", "grad", "Grad") || "—";

        const avatarUrl =
          pick(
            u,
            "avatarUrl",
            "AvatarUrl",
            "slikaUrl",
            "SlikaUrl",
            "slika",
            "Slika"
          ) ||
          pick(
            korisnik,
            "avatarUrl",
            "AvatarUrl",
            "slikaUrl",
            "SlikaUrl",
            "slika",
            "Slika"
          ) ||
          "/images/art1.jpg"; // fallback

        // broj radova – ako backend vraća dela
        const dela = pick(u, "umetnickaDela", "UmetnickaDela", "dela", "Dela");
        const brojRadova = Array.isArray(dela)
          ? dela.length
          : Number(pick(u, "brojRadova", "BrojRadova")) || 0;

        // ✅ tehnika/stil za filtere (ako backend ima odvojena polja)
        const tehnikaValue = pick(u, "tehnika", "Tehnika") || "";
        const stilValue = pick(u, "stil", "Stil") || "";

        return {
          id: String(id),
          ime,
          stil, // prikaz na kartici
          lokacija,
          avatarUrl,
          brojRadova,

          // samo za filtere:
          _tehnika: String(tehnikaValue || "").trim(),
          _stil: String(stilValue || "").trim(),
        };
      })
      .filter((x) => !!x.id);
  }, [umetniciRaw]);

  // ✅ opcije za dropdown (unique)
  const tehnike = useMemo(() => {
    const set = new Set();
    umetnici.forEach((u) => {
      if (u._tehnika) set.add(u._tehnika);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sr"));
  }, [umetnici]);

  const stilovi = useMemo(() => {
    const set = new Set();
    umetnici.forEach((u) => {
      if (u._stil) set.add(u._stil);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "sr"));
  }, [umetnici]);

  // ✅ filtriranje + sortiranje
  const filtered = useMemo(() => {
    const query = String(q || "").trim().toLowerCase();

    const list = umetnici.filter((u) => {
      const okQ = !query || String(u.ime || "").toLowerCase().includes(query);
      const okTech = tech === "ALL" || u._tehnika === tech;
      const okStil = stilFilter === "ALL" || u._stil === stilFilter;
      return okQ && okTech && okStil;
    });

    list.sort((a, b) => {
      if (sort === "MOST_WORKS") return (b.brojRadova || 0) - (a.brojRadova || 0);

      const na = String(a.ime || "");
      const nb = String(b.ime || "");
      return sort === "ZA"
        ? nb.localeCompare(na, "sr")
        : na.localeCompare(nb, "sr");
    });

    return list;
  }, [umetnici, q, tech, stilFilter, sort]);

  const handleReset = () => {
    setQ("");
    setTech("ALL");
    setStilFilter("ALL");
    setSort("AZ");
  };

  return (
    <div className="artists-page">
      <header className="artists-hero">
        <div className="artists-badge">ARTIFY • Umetnici</div>
        <h1 className="artists-title">
          Upoznaj autore koji stoje iza svakog poteza
        </h1>
      </header>

      <section className="artists-section">
        {loading && <div className="artists-meta">Učitavanje...</div>}
        {!loading && error && <div className="artists-meta error">{error}</div>}

        {!loading && !error && (
          <>
            {/* ✅ FILTER BAR */}
            <div className="artists-filterBar">
              <div className="artists-filterRow">
                <div className="artists-filterField">
                  <label className="artists-filterLabel">Pretraga</label>
                  <input
                    className="artists-filterInput"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Ime i prezime…"
                  />
                </div>

                <div className="artists-filterField">
                  <label className="artists-filterLabel">Tehnika</label>
                  <select
                    className="artists-filterSelect"
                    value={tech}
                    onChange={(e) => setTech(e.target.value)}
                  >
                    <option value="ALL">Sve</option>
                    {tehnike.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="artists-filterField">
                  <label className="artists-filterLabel">Stil</label>
                  <select
                    className="artists-filterSelect"
                    value={stilFilter}
                    onChange={(e) => setStilFilter(e.target.value)}
                  >
                    <option value="ALL">Sve</option>
                    {stilovi.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="artists-filterField">
                  <label className="artists-filterLabel">Sort</label>
                  <select
                    className="artists-filterSelect"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="AZ">Ime A–Z</option>
                    <option value="ZA">Ime Z–A</option>
                    <option value="MOST_WORKS">Najviše radova</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="artists-filterReset"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>

              <div className="artists-filterMeta">
                Prikazano: <strong>{filtered.length}</strong> / {umetnici.length}
              </div>
            </div>

            <div className="artists-grid">
              {filtered.map((u) => (
                <CardArtist
                  key={u.id}
                  id={u.id}
                  ime={u.ime}
                  stil={u.stil}
                  lokacija={u.lokacija}
                  avatarUrl={u.avatarUrl}
                  brojRadova={u.brojRadova}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="artists-meta">
                Nema rezultata za izabrane filtere.
              </div>
            )}
          </>
        )}

        {!loading && !error && umetnici.length === 0 && (
          <div className="artists-meta">Trenutno nema umetnika za prikaz.</div>
        )}
      </section>
    </div>
  );
}
