// ArtworkDetails.jsx
import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import "./ArtworkDetails.css";

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Izvor istine za ulogu/token (kao u Favoriti)
  const { isKupac, authToken, userId, isLoading } = useContext(AppContext);

  const [delo, setDelo] = useState(null);
  const [umetnik, setUmetnik] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [buying, setBuying] = useState(false);

  // aukcija state
  const [ponude, setPonude] = useState([]);
  const [ponudaIznos, setPonudaIznos] = useState("");
  const [ponudeLoading, setPonudeLoading] = useState(false);
  const [ponudaSending, setPonudaSending] = useState(false);
  const [ponudaErr, setPonudaErr] = useState("");
  const [pollingActive, setPollingActive] = useState(false);

  const apiOrigin = useMemo(() => {
    const base = axiosInstance?.defaults?.baseURL;
    try {
      return new URL(base).origin;
    } catch {
      return "";
    }
  }, []);

  const normalizeImageUrl = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;

    if (/^(https?:|data:|blob:)/i.test(s)) return s;

    const clean = s.replace(/\\/g, "/").replace(/^\/+/, "");
    return apiOrigin ? `${apiOrigin}/${clean}` : null;
  };

  const extractArtistName = (a) => {
    if (!a) return "Nepoznati umetnik";
    const k = a.korisnik || a.Korisnik;

    const fullFromImePrezime =
      k?.imeIPrezime || k?.ImeIPrezime || a?.imeIPrezime || a?.ImeIPrezime;
    if (fullFromImePrezime && String(fullFromImePrezime).trim())
      return String(fullFromImePrezime).trim();

    const ime = k?.ime || k?.Ime || a?.ime || a?.Ime || "";
    const prezime = k?.prezime || k?.Prezime || a?.prezime || a?.Prezime || "";
    const full = `${ime} ${prezime}`.trim();
    if (full) return full;

    return (
      k?.userName ||
      k?.UserName ||
      k?.email ||
      k?.Email ||
      a?.email ||
      a?.Email ||
      "Nepoznati umetnik"
    );
  };

  const formatEur = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const isAukcija = (delo?.naAukciji ?? delo?.NaAukciji) === true;

  const statusLabel = (d) => {
    if (!d) return { text: "—", tone: "muted" };

    const onAuction = d.naAukciji ?? d.NaAukciji;
    if (onAuction) return { text: "Na aukciji", tone: "info" };

    const isSold = d.isSold ?? d.IsSold ?? d.prodato ?? d.Prodato;
    const isReserved = d.isReserved ?? d.IsReserved ?? d.rezervisano ?? d.Rezervisano;
    const isAvailable = d.isAvailable ?? d.IsAvailable ?? d.dostupno ?? d.Dostupno;

    if (isSold) return { text: "Prodato", tone: "danger" };
    if (isReserved) return { text: "Rezervisano", tone: "warn" };
    if (isAvailable) return { text: "Dostupno", tone: "ok" };

    return { text: "—", tone: "muted" };
  };

  const topBid = useMemo(() => {
    if (!ponude?.length) return null;
    const sorted = [...ponude].sort(
      (a, b) => Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0)
    );
    const first = sorted[0];
    const val = Number(first?.iznos ?? first?.Iznos ?? 0);
    return Number.isFinite(val) && val > 0 ? val : null;
  }, [ponude]);

  // ===== API calls =====
  const loadPonude = useCallback(async (umetnickoDeloId) => {
    try {
      const p = await axiosInstance.get(`Aukcija/Ponude/${umetnickoDeloId}`);
      const list = Array.isArray(p.data) ? p.data : [];
      list.sort((a, b) => Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0));
      setPonude(list);
    } catch {
      // ignore (ne spamuj)
    }
  }, []);

  const loadDeloLight = useCallback(async (artworkId) => {
    try {
      const res = await axiosInstance.get(`UmetnickoDelo/DeloPoID/${artworkId}`);
      const data = res.data;
      setDelo((prev) => ({ ...prev, ...data }));
    } catch {
      // ignore
    }
  }, []);

  const handleBuy = async () => {
    if (!authToken || !isKupac) return;
    try {
      setBuying(true);

      await axiosInstance.post("Porudzbine/DodajStavku", {
        umetnickoDeloId: delo.umetnickoDeloId,
        kolicina: 1,
      });

      alert("Delo je dodato u tvoje porudžbine ✅");
      // navigate("/moje-porudzbine");
    } catch (e) {
      const status = e?.response?.status;
      alert(status === 403 ? "Samo Kupac može da kupi delo." : "Greška: nije moguće dodati u porudžbine.");
    } finally {
      setBuying(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!authToken || !isKupac) return;

    setPonudaErr("");

    const n = Number(String(ponudaIznos).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setPonudaErr("Unesi validan iznos.");
      return;
    }

    const current = Number(delo?.trenutnaCenaAukcije ?? delo?.TrenutnaCenaAukcije ?? 0);
    const mustBeat = Math.max(current, topBid ?? 0);

    if (n <= mustBeat) {
      setPonudaErr(`Ponuda mora biti veća od ${mustBeat}.`);
      return;
    }

    try {
      setPonudaSending(true);

      const res = await axiosInstance.post("Aukcija/DodajPonudu", {
        umetnickoDeloId: delo.umetnickoDeloId,
        iznos: n,
      });

      const newBid = res.data;

      const next = Array.isArray(newBid)
        ? newBid
        : [{ ...newBid, iznos: newBid?.iznos ?? newBid?.Iznos ?? n }, ...ponude];

      next.sort((a, b) => Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0));
      setPonude(next);

      setDelo((prev) => ({
        ...prev,
        trenutnaCenaAukcije: n,
      }));

      setPonudaIznos("");
    } catch (e) {
      const status = e?.response?.status;
      setPonudaErr(status === 403 ? "Samo Kupac može da postavi ponudu." : "Greška: ponuda nije poslata.");
    } finally {
      setPonudaSending(false);
    }
  };

  // ===== Initial load =====
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosInstance.get(`UmetnickoDelo/DeloPoID/${id}`);
        if (cancelled) return;

        const data = res.data;
        setDelo(data);

        const candidateImg = normalizeImageUrl(data?.slika || data?.slikaUrl);
        setImgUrl(candidateImg);

        const embeddedArtist = data?.umetnik || data?.Umetnik;
        if (embeddedArtist) {
          setUmetnik(embeddedArtist);
        } else {
          const umetnikId =
            data?.umetnikId || data?.UmetnikId || data?.umetnikID || data?.UmetnikID;

          if (umetnikId) {
            const a = await axiosInstance.get(`Umetnik/VracaUmetnikaPoID/${umetnikId}`);
            if (!cancelled) setUmetnik(a.data);
          } else {
            setUmetnik(null);
          }
        }

        // aukcija: prvi load ponuda
        if ((data?.naAukciji ?? data?.NaAukciji) === true) {
          setPonudeLoading(true);
          setPonudaErr("");
          try {
            await loadPonude(data.umetnickoDeloId);
          } finally {
            if (!cancelled) setPonudeLoading(false);
          }
        } else {
          setPonude([]);
          setPonudaIznos("");
          setPonudaErr("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? "Delo ne postoji ili nemaš pristup."
              : "Greška pri učitavanju dela."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id, apiOrigin, loadPonude]);

  // ===== AUTO REFRESH aukcije (polling) =====
  useEffect(() => {
    if (!isAukcija || !delo?.umetnickoDeloId) {
      setPollingActive(false);
      return;
    }

    setPollingActive(true);

    const artworkId = delo.umetnickoDeloId;
    const interval = setInterval(async () => {
      await loadPonude(artworkId);
      await loadDeloLight(id);
    }, 3000);

    return () => {
      clearInterval(interval);
      setPollingActive(false);
    };
  }, [isAukcija, delo?.umetnickoDeloId, id, loadPonude, loadDeloLight]);

  // ===== Guards =====
  if (isLoading || loading) {
    return (
      <section className="af-page">
        <div className="af-shell">
          <div className="af-skeleton af-skelHero" />
          <div className="af-skeleton af-skelCard" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="af-page">
        <div className="af-shell">
          <div className="af-error">
            <div className="af-errorTitle">Ups.</div>
            <div className="af-errorText">{error}</div>
            <Link className="af-btn af-btnGhost" to="/galerija">
              ← Nazad na galeriju
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!delo) return null;

  const umetnikIme = extractArtistName(umetnik);
  const badge = statusLabel(delo);

  const pricePrimary = isAukcija
    ? formatEur(delo.trenutnaCenaAukcije ?? delo.TrenutnaCenaAukcije ?? delo.pocetnaCenaAukcije)
    : formatEur(delo.cena ?? delo.Cena);

  const buyerLocked = !authToken || !isKupac;

  return (
    <section className="af-page">
      <div className="af-shell">
        <header className="af-top">
          <Link className="af-back" to="/galerija">
            ← Nazad
          </Link>

          <div className="af-titleWrap">
            <h1 className="af-title">{delo.naziv || "Nepoznato delo"}</h1>
            <div className="af-sub">
              <span className={`af-badge af-badge-${badge.tone}`}>{badge.text}</span>
              <span className="af-dot" />
              <span className="af-artist">{umetnikIme}</span>

              {isAukcija && (
                <>
                  <span className="af-dot" />
                  <span className="af-live">● Live {pollingActive ? "uključeno" : ""}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="af-grid">
          <div className="af-mediaCard">
            <div className="af-mediaFrame">
              {imgUrl ? (
                <img
                  className="af-img"
                  src={imgUrl}
                  alt={delo.naziv || "Umetničko delo"}
                  onError={() => setImgUrl(null)}
                />
              ) : (
                <div className="af-imgFallback">
                  <div className="af-fallbackIcon">🖼️</div>
                  <div>Slika nije dostupna</div>
                </div>
              )}
            </div>

            {delo.opis && (
              <div className="af-desc">
                <div className="af-descLabel">Opis</div>
                <p>{delo.opis}</p>
              </div>
            )}
          </div>

          <aside className="af-sideCard">
            <div className="af-priceBox">
              <div className="af-priceLabel">{isAukcija ? "Trenutna cena" : "Cena"}</div>
              <div className="af-price">{pricePrimary}</div>

              {isAukcija && (
                <div className="af-auctionMeta">
                  <div className="af-miniRow">
                    <span>Počinje</span>
                    <strong>{formatDateTime(delo.aukcijaPocinje || delo.AukcijaPocinje)}</strong>
                  </div>
                  <div className="af-miniRow">
                    <span>Završava</span>
                    <strong>{formatDateTime(delo.aukcijaZavrsava || delo.AukcijaZavrsava)}</strong>
                  </div>
                </div>
              )}

              {!isAukcija && (
                <div className="af-actions">
                  <button
                    className="af-btn af-btnPrimary"
                    type="button"
                    onClick={handleBuy}
                    disabled={buyerLocked || buying}
                    title={buyerLocked ? "Prijavi se kao Kupac da kupiš delo." : ""}
                  >
                    {buying ? "Dodajem…" : "Kupi delo"}
                  </button>
                </div>
              )}

              {buyerLocked && (
                <div className="af-inlineNote">
                  Prijavi se kao <strong>Kupac</strong> da bi kupovao ili licitirao.
                </div>
              )}

              {isAukcija && (
                <div className="af-inlineNote">Kupovina nije dostupna dok je aukcija aktivna.</div>
              )}
            </div>

            <div className="af-specs">
              <div className="af-specRow">
                <span>Tehnika</span>
                <strong>{delo.tehnika || "—"}</strong>
              </div>
              <div className="af-specRow">
                <span>Stil</span>
                <strong>{delo.stil || "—"}</strong>
              </div>
              <div className="af-specRow">
                <span>Dimenzije</span>
                <strong>{delo.dimenzije || "—"}</strong>
              </div>
              <div className="af-specRow">
                <span>Postavljeno</span>
                <strong>{formatDateTime(delo.datumPostavljanja || delo.DatumPostavljanja, true)}</strong>
              </div>
            </div>

            {isAukcija && (
              <div className="af-auctionPanel">
                <div className="af-auctionHead">
                  <div className="af-auctionTitle">Aukcija</div>
                  <div className="af-auctionTop">
                    Najveća ponuda: <strong>{topBid ? formatEur(topBid) : "—"}</strong>
                  </div>
                </div>

                <div className="af-bidForm">
                  <input
                    className="af-input"
                    value={ponudaIznos}
                    onChange={(e) => setPonudaIznos(e.target.value)}
                    placeholder="Unesi svoju ponudu (npr. 120)"
                    inputMode="decimal"
                    disabled={buyerLocked}
                    title={buyerLocked ? "Prijavi se kao Kupac da licitiraš." : ""}
                  />
                  <button
                    className="af-btn af-btnPrimary"
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={buyerLocked || ponudaSending}
                    title={buyerLocked ? "Prijavi se kao Kupac da licitiraš." : ""}
                  >
                    {ponudaSending ? "Šaljem…" : "Postavi ponudu"}
                  </button>
                </div>

                {ponudaErr && <div className="af-inlineError">{ponudaErr}</div>}

                <div className="af-bidsList">
                  <div className="af-bidsLabel">Ponude</div>

                  {ponudeLoading ? (
                    <div className="af-mutedLine">Učitavam ponude…</div>
                  ) : ponude?.length ? (
                    <div className="af-bids">
                    {topBidRow ? (
                      <div className="af-bidRow af-bidRowTop">
                        <div className="af-bidLeft">
                          <span className="af-rank">#1</span>
                          <span className="af-who">
                            {topBidRow?.korisnikIme || topBidRow?.KorisnikIme || topBidRow?.imeIPrezime || topBidRow?.ImeIPrezime || "Korisnik"}
                          </span>
                        </div>
                        <strong className="af-bidAmount">
                          {formatEur(Number(topBidRow?.iznos ?? topBidRow?.Iznos ?? 0))}
                        </strong>
                      </div>
                    ) : (
                      <div className="af-mutedLine">Još nema ponuda.</div>
                    )}

                    {restBids.length > 0 && (
                      <button
                        type="button"
                        className="af-btn af-btnGhost af-btnSmall"
                        onClick={() => setShowAllBids((s) => !s)}
                      >
                        {showAllBids ? "Sakrij ostale ponude" : `Prikaži ostale ponude (${restBids.length})`}
                      </button>
                    )}

                    {showAllBids && restBids.length > 0 && (
                      <div className="af-bidsRest">
                        {restBids.map((p, idx) => {
                          const iznos = Number(p.iznos ?? p.Iznos ?? 0);
                          const who =
                            p?.korisnikIme || p?.KorisnikIme || p?.imeIPrezime || p?.ImeIPrezime || "Korisnik";

                          return (
                            <div key={p?.ponudaId ?? p?.PonudaId ?? `${idx}-${iznos}`} className="af-bidRow">
                              <div className="af-bidLeft">
                                <span className="af-rank">#{idx + 2}</span>
                                <span className="af-who">{who}</span>
                              </div>
                              <strong className="af-bidAmount">{formatEur(iznos)}</strong>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  ) : (
                    <div className="af-mutedLine">Još nema ponuda.</div>
                  )}
                </div>
              </div>
            )}

            {umetnik?.biografija && (
              <div className="af-bio">
                <div className="af-bioLabel">O umetniku</div>
                <div className="af-bioText">{umetnik.biografija}</div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function formatDateTime(value, dateOnly = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("sr-RS", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  }).format(d);
}
