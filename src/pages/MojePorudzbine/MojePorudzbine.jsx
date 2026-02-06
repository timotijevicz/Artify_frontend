import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import "./MojePorudzbine.css";

export default function MojePorudzbine() {
  const { isKupac, authToken, isLoading } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ promeni ovde ako ti je druga ruta:
  const ENDPOINT_GET = "Porudzbine/Moje"; // npr. "Porudzbine/PrikaziMoje" ili slično

  const total = useMemo(() => {
    return items.reduce((sum, x) => sum + Number(x.ukupno ?? x.Ukupno ?? x.cena ?? x.Cena ?? 0), 0);
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!authToken || !isKupac) { setLoading(false); return; }

      try {
        setLoading(true);
        setErr("");

        const r = await axiosInstance.get(ENDPOINT_GET);
        const list = Array.isArray(r.data) ? r.data : (r.data?.stavke || r.data?.Stavke || []);
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setErr("Ne mogu da učitam porudžbine.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [authToken, isKupac]);

  if (isLoading || loading) {
    return (
      <section className="af-page">
        <div className="af-shell">
          <div className="af-skeleton af-skelCard" />
          <div className="af-skeleton af-skelCard" />
        </div>
      </section>
    );
  }

  if (!authToken || !isKupac) {
    return (
      <section className="af-page">
        <div className="af-shell">
          <div className="af-error">
            <div className="af-errorTitle">Pristup ograničen</div>
            <div className="af-errorText">Prijavi se kao Kupac da vidiš porudžbine.</div>
            <Link className="af-btn af-btnGhost" to="/galerija">← Nazad na galeriju</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="af-page">
      <div className="af-shell">
        <header className="af-top">
          <Link className="af-back" to="/galerija">← Nazad</Link>
          <div className="af-titleWrap">
            <h1 className="af-title">Moje porudžbine</h1>
            <div className="af-sub">
              <span className="af-badge af-badge-info">{items.length} stavki</span>
              <span className="af-dot" />
              <span className="af-artist">Ukupno: <strong>{formatEur(total)}</strong></span>
            </div>
          </div>
        </header>

        {err && <div className="af-inlineError">{err}</div>}

        {items.length ? (
          <div className="af-ordersGrid">
            {items.map((x, idx) => {
              const id = x.umetnickoDeloId ?? x.UmetnickoDeloId ?? idx;
              const naziv = x.naziv ?? x.Naziv ?? "Umetničko delo";
              const cena = Number(x.cena ?? x.Cena ?? x.ukupno ?? x.Ukupno ?? 0);
              const kolicina = x.kolicina ?? x.Kolicina ?? 1;

              return (
                <div className="af-orderCard" key={id}>
                  <div className="af-orderTitle">{naziv}</div>
                  <div className="af-orderMeta">
                    <span>Količina</span><strong>{kolicina}</strong>
                  </div>
                  <div className="af-orderMeta">
                    <span>Cena</span><strong>{formatEur(cena)}</strong>
                  </div>

                  <Link className="af-btn af-btnGhost" to={`/delo/${id}`}>
                    Otvori delo
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="af-mutedLine">Nemaš porudžbine još.</div>
        )}
      </div>
    </section>
  );
}

function formatEur(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
