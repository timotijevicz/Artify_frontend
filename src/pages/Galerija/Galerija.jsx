import React, { useMemo, useState, useEffect, useContext } from "react";
import "./Galerija.css";
import Card from "../../components/Card/Card";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import { STATUS } from "../../utils/umetnickoDeloStatus";

export default function Galerija() {
  const { authToken, isUmetnik } = useContext(AppContext);

  const [mode, setMode] = useState("all"); // "all" | "mine"
  const [dela, setDela] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const toArtistName = (u) => {
      if (!u) return "Nepoznati umetnik";
      if (typeof u === "string") return u;

      const korisnik = u.korisnik ?? u.Korisnik;

      const ime =
        korisnik?.imeIPrezime ??
        korisnik?.ImeIPrezime ??
        korisnik?.userName ??
        korisnik?.UserName ??
        korisnik?.email ??
        korisnik?.Email;

      if (ime) return String(ime);

      const spec = u.specijalizacija ?? u.Specijalizacija;
      if (spec) return String(spec);

      const id = u.umetnikId ?? u.UmetnikId;
      return id ? `Umetnik #${id}` : "Nepoznati umetnik";
    };

    const toStatusText = (raw) => {
      const n = typeof raw === "string" ? Number(raw) : raw;

      if (n === STATUS.Dostupno) return "Dostupno";
      if (n === STATUS.Prodato) return "Prodato";
      if (n === STATUS.Uklonjeno) return "Uklonjeno";

      if (typeof raw === "string") return raw;
      return "Dostupno";
    };

    const toImageUrl = (raw) => {
      if (!raw) return "/images/placeholder-art.jpg";
      if (typeof raw !== "string") return "/images/placeholder-art.jpg";

      if (raw.startsWith("http") || raw.startsWith("data:image")) return raw;

      return `data:image/jpeg;base64,${raw}`;
    };

    const load = async () => {
      try {
        setLoading(true);

        const endpoint =
          mode === "mine" ? "UmetnickoDelo/MojaDela" : "UmetnickoDelo/SvaDela";

        const res = await axiosInstance.get(endpoint);

        const mapped = (res.data || [])
          .map((d) => {
            const id = d.UmetnickoDeloId ?? d.umetnickoDeloId ?? d.id ?? d.Id;

            const naziv = d.Naziv ?? d.naziv ?? "Nepoznato delo";
            const cena = d.Cena ?? d.cena ?? "N/A";
            const staraCena = d.StaraCena ?? d.staraCena;
            const tehnika = d.Tehnika ?? d.tehnika ?? "Nepoznata tehnika";
            const dimenzije = d.Dimenzije ?? d.dimenzije;

            const statusRaw = d.Status ?? d.status;
            const status = toStatusText(statusRaw);

            const umetnik = toArtistName(d.Umetnik ?? d.umetnik);
            const slikaUrl = toImageUrl(d.Slika ?? d.slika ?? d.slikaUrl);

            return {
              id,
              slikaUrl,
              naziv,
              umetnik,
              cena,
              staraCena,
              tehnika,
              dimenzije,
              status,
              _statusRaw: statusRaw, // za filter
            };
          })
          // ✅ prikazuj samo Dostupno (sakrij Prodato i Uklonjeno)
          .filter((x) => Number(x._statusRaw) === STATUS.Dostupno);

        if (!cancelled) setDela(mapped);
      } catch (e) {
        console.error("Galerija load error:", e);
        if (!cancelled) setDela([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (mode === "mine" && (!authToken || !isUmetnik)) {
      setDela([]);
      setLoading(false);
      return;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [mode, authToken, isUmetnik]);

  const [showFilters, setShowFilters] = useState(false);
  const [fUmetnik, setFUmetnik] = useState("");
  const [fTehnika, setFTehnika] = useState("");
  const [fStatus, setFStatus] = useState("");

  const options = useMemo(() => {
    const uniq = (arr) =>
      [...new Set(arr)]
        .filter((v) => v !== null && v !== undefined && v !== "")
        .map((v) => String(v))
        .sort((a, b) => a.localeCompare(b));

    return {
      umetnici: uniq(dela.map((d) => d.umetnik)),
      tehnike: uniq(dela.map((d) => d.tehnika)),
      // ovde će praktično biti samo "Dostupno", ali ostavljamo radi UI-a
      statusi: uniq(dela.map((d) => d.status)),
    };
  }, [dela]);

  const filtered = useMemo(() => {
    return dela.filter((d) => {
      if (fUmetnik && String(d.umetnik) !== String(fUmetnik)) return false;
      if (fTehnika && String(d.tehnika) !== String(fTehnika)) return false;
      if (fStatus && String(d.status) !== String(fStatus)) return false;
      return true;
    });
  }, [dela, fUmetnik, fTehnika, fStatus]);

  const handleReset = () => {
    setFUmetnik("");
    setFTehnika("");
    setFStatus("");
  };

  useEffect(() => {
    if (mode === "mine" && !isUmetnik) setMode("all");
  }, [mode, isUmetnik]);

  return (
    <div className="gallery-page">
      <header className="gallery-hero">
        <div className="gallery-badge">ARTIFY • Galerija</div>
        <h1 className="gallery-title">Umetnička dela bez buke i žurbe</h1>
        <p className="gallery-subtitle">
          Originali, savremeni radovi i bezvremenska dela — istraži galeriju u sopstvenom ritmu.
        </p>
      </header>

      <div className="filters-row">
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setShowFilters((p) => !p)}
        >
          {showFilters ? "Zatvori filtere" : "Filtriraj"}
        </button>

        <div className="filters-meta">
          Prikazano: <b>{filtered.length}</b>
        </div>
      </div>

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

      <section className="gallery-section">
        {loading ? (
          <div style={{ padding: 16 }}>Učitavanje...</div>
        ) : (
          <div className="gallery-grid">
            {filtered.map((delo) => (
              <Card key={delo.id} {...delo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
