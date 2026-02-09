import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import "./MojePorudzbine.css";

export default function MojePorudzbine() {
  const { isKupac, authToken, isLoading } = useContext(AppContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [payingId, setPayingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  // ✅ Fake PayPal modal state
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [paypalOrder, setPaypalOrder] = useState(null); // { porudzbinaId, naziv, cena }

  // ✅ tvoja backend ruta:
  const ENDPOINT_GET = "Porudzbina/MojePorudzbine";

  const load = useCallback(async () => {
    if (!authToken || !isKupac) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErr("");
      const r = await axiosInstance.get(ENDPOINT_GET);
      const list = Array.isArray(r.data) ? r.data : [];
      const filtered = list.filter((p) => {
        const a = p.arhivirana ?? p.Arhivirana ?? p.isArchived ?? p.IsArchived ?? false;
        return !Boolean(a);
      });

      setItems(filtered);
    } catch (e) {
      console.log("MOJE PORUDZBINE ERROR:", {
        url: e?.config?.url,
        status: e?.response?.status,
        data: e?.response?.data,
      });
      setErr("Ne mogu da učitam porudžbine.");
    } finally {
      setLoading(false);
    }
  }, [authToken, isKupac]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      await load();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const total = useMemo(() => {
    return items.reduce((sum, p) => {
      const cena =
        Number(p.cenaUTrenutkuKupovine ?? p.CenaUTrenutkuKupovine ?? 0) ||
        Number(p.umetnickoDelo?.cena ?? p.UmetnickoDelo?.Cena ?? 0) ||
        0;
      return sum + cena;
    }, 0);
  }, [items]);

  // ✅ Fake "PayPal confirm" -> tvoj backend samo markira kao Placena
  const confirmPaypal = async () => {
    if (!paypalOrder?.porudzbinaId) return;

    try {
      setPayingId(paypalOrder.porudzbinaId);
      setErr("");

      await axiosInstance.put(`Porudzbina/Plati/${paypalOrder.porudzbinaId}`);

      setPaypalOpen(false);
      setPaypalOrder(null);
      await load();
    } catch (e) {
      console.log("PAY ERROR:", {
        url: e?.config?.url,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      const msg = e?.response?.data?.poruka || e?.response?.data?.Poruka;
      setErr(msg || "Ne mogu da izvršim plaćanje.");
    } finally {
      setPayingId(null);
    }
  };

  const handleDelete = async (porudzbinaId) => {
    if (!porudzbinaId) return;

    const ok = window.confirm("Da li si siguran/na da želiš da odustaneš od porudžbine?");
    if (!ok) return;

    try {
      setDeletingId(porudzbinaId);
      setErr("");

      await axiosInstance.delete(`Porudzbina/BrisanjePorudzbine/${porudzbinaId}`);

      await load();
    } catch (e) {
      console.log("DELETE ORDER ERROR:", {
        url: e?.config?.url,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      const msg = e?.response?.data?.poruka || e?.response?.data?.Poruka;
      setErr(msg || "Ne mogu da obrišem porudžbinu.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchive = async (porudzbinaId) => {
    if (!porudzbinaId) return;

    try {
      setArchivingId(porudzbinaId);
      setErr("");

      await axiosInstance.put(`Porudzbina/Arhiviraj/${porudzbinaId}`);

      await load();
    } catch (e) {
      console.log("ARCHIVE ERROR:", {
        url: e?.config?.url,
        status: e?.response?.status,
        data: e?.response?.data,
      });

      const msg = e?.response?.data?.poruka || e?.response?.data?.Poruka;
      setErr(msg || "Ne mogu da arhiviram porudžbinu.");
    } finally {
      setArchivingId(null);
    }
  };

  const statusLabel = (s) => {
    // enum: NaCekanju=0, Odobrena=1, Odbijena=2, Placena=3, Otkazana=4
    const n = typeof s === "number" ? s : Number(s);
    if (n === 0) return { text: "Na čekanju", tone: "info" };
    if (n === 1) return { text: "Odobrena", tone: "ok" };
    if (n === 2) return { text: "Odbijena", tone: "danger" };
    if (n === 3) return { text: "Plaćena", tone: "ok" };
    if (n === 4) return { text: "Otkazana", tone: "muted" };
    return { text: "—", tone: "muted" };
  };

  // ESC zatvara modal (lep detalj)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setPaypalOpen(false);
        setPaypalOrder(null);
      }
    };
    if (paypalOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paypalOpen]);

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
            <Link className="af-btn af-btnGhost" to="/galerija">
              ← Nazad na galeriju
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="af-page">
      <div className="af-shell">
        <header className="af-top">
          <Link className="af-back" to="/galerija">
            ← Nazad
          </Link>
          <div className="af-titleWrap">
            <h1 className="af-title">Moje porudžbine</h1>
            <div className="af-sub">
              <span className="af-badge af-badge-info">{items.length} porudžbina</span>
              <span className="af-dot" />
              <span className="af-artist">
                Ukupno: <strong>{formatEur(total)}</strong>
              </span>
            </div>
          </div>
        </header>

        {err && <div className="af-inlineError">{err}</div>}

        {items.length ? (
          <div className="af-ordersGrid">
            {items.map((p) => {
              const porudzbinaId = p.porudzbinaId ?? p.PorudzbinaId;

              const deloId =
                p.UmetnickoDeloId ??
                p.umetnickoDeloId ??
                p.UmetnickoDelo?.UmetnickoDeloId ??
                p.umetnickoDelo?.umetnickoDeloId ??
                null;

              const naziv =
                p.umetnickoDelo?.naziv ??
                p.UmetnickoDelo?.Naziv ??
                p.umetnickoDelo?.Naziv ??
                "Umetničko delo";

              const cena =
                Number(p.cenaUTrenutkuKupovine ?? p.CenaUTrenutkuKupovine ?? 0) ||
                Number(p.umetnickoDelo?.cena ?? p.UmetnickoDelo?.Cena ?? 0) ||
                0;

              const st = p.status ?? p.Status;
              const badge = statusLabel(st);
              const statusNum = typeof st === "number" ? st : Number(st);

              const canPay = statusNum !== 3 && statusNum !== 4; // nije Placena i nije Otkazana
              const canCancel = statusNum !== 3 && statusNum !== 4; // odustani samo dok nije završena
              const canArchive = statusNum === 3; // arhiviranje samo kad je Placena

              return (
                <div className="af-orderCard" key={porudzbinaId ?? `${deloId}-${cena}`}>
                  <div className="af-orderTitle">{naziv}</div>

                  <div className="af-orderMeta">
                    <span>Status</span>
                    <strong className={`af-badge af-badge-${badge.tone}`}>{badge.text}</strong>
                  </div>

                  <div className="af-orderMeta">
                    <span>Cena</span>
                    <strong>{formatEur(cena)}</strong>
                  </div>

                  <div className="af-orderActions">
                    {deloId ? (
                      <Link className="af-btn af-btnGhost" to={`/delo/${deloId}`}>
                        Otvori delo
                      </Link>
                    ) : (
                      <button className="af-btn af-btnGhost" type="button" disabled>
                        Otvori delo
                      </button>
                    )}

                    <button
                      className="af-btn af-btnPrimary"
                      type="button"
                      disabled={!canPay || payingId === porudzbinaId}
                      title={!canPay ? "Porudžbina je već završena." : ""}
                      onClick={() => {
                        if (!porudzbinaId) return;
                        setErr("");
                        setPaypalOrder({ porudzbinaId, naziv, cena });
                        setPaypalOpen(true);
                      }}
                    >
                      {payingId === porudzbinaId ? "Plaćam…" : "Plati"}
                    </button>

                    {canArchive ? (
                      <button
                        className="af-btn af-btnGhost"
                        type="button"
                        onClick={() => handleArchive(porudzbinaId)}
                        disabled={archivingId === porudzbinaId}
                      >
                        {archivingId === porudzbinaId ? "Arhiviram…" : "Arhiviraj"}
                      </button>
                    ) : (
                      <button
                        className="af-btn af-btnGhost"
                        type="button"
                        onClick={() => handleDelete(porudzbinaId)}
                        disabled={!canCancel || deletingId === porudzbinaId}
                        title={!canCancel ? "Ne možeš da odustaneš od završene porudžbine." : ""}
                      >
                        {deletingId === porudzbinaId ? "Brišem…" : "Odustani"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="af-mutedLine">Nemaš porudžbine još.</div>
        )}
      </div>

      {/* ✅ Fake PayPal modal */}
      {paypalOpen && paypalOrder && (
        <div
          className="pp-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setPaypalOpen(false);
            setPaypalOrder(null);
          }}
        >
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-head">
              <div className="pp-logo">PayPal</div>
              <button
                className="pp-x"
                onClick={() => {
                  setPaypalOpen(false);
                  setPaypalOrder(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="pp-body">
              <div className="pp-row">
                <span>Porudžbina</span>
                <strong>{paypalOrder.naziv}</strong>
              </div>
              <div className="pp-row">
                <span>Iznos</span>
                <strong>{formatEur(paypalOrder.cena)}</strong>
              </div>

              <label className="pp-label">
                Email
                <input className="pp-input" placeholder="buyer@example.com" />
              </label>

              <label className="pp-label">
                Lozinka 
                <input className="pp-input" type="password" placeholder="••••••••" />
              </label>

              <div className="pp-actions">
                <button
                  className="af-btn af-btnGhost"
                  onClick={() => {
                    setPaypalOpen(false);
                    setPaypalOrder(null);
                  }}
                >
                  Otkaži
                </button>

                <button
                  className="af-btn af-btnPrimary"
                  onClick={confirmPaypal}
                  disabled={payingId === paypalOrder.porudzbinaId}
                >
                  {payingId === paypalOrder.porudzbinaId ? "Processing…" : "Potvrdite plaćanje"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
