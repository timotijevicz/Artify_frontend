// ArtworkDetails.jsx
import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import { AppContext } from "../../context/AppContext";
import "./ArtworkDetails.css";

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // sakrivanje ponuda
  const [showAllBids, setShowAllBids] = useState(false);

  // recenzije
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewErr, setReviewErr] = useState("");

  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSaving, setReviewSaving] = useState(false);

  // finalize aukcije
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeErr, setFinalizeErr] = useState("");

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

  // STATUS (0 Dostupno, 1 Prodato, 2 Uklonjeno)
  const deloStatus = (delo?.status ?? delo?.Status ?? null);
  const statusNum =
    typeof deloStatus === "number"
      ? deloStatus
      : typeof deloStatus === "string"
      ? Number(deloStatus)
      : null;

  const isAvailableByStatus = statusNum === 0;
  const isSoldByStatus = statusNum === 1;
  const isRemovedByStatus = statusNum === 2;

  const isSoldBool =
    (delo?.isSold ?? delo?.IsSold ?? delo?.prodato ?? delo?.Prodato) === true;
  const isReservedBool =
    (delo?.isReserved ??
      delo?.IsReserved ??
      delo?.rezervisano ??
      delo?.Rezervisano) === true;
  const isAvailableBool =
    (delo?.isAvailable ??
      delo?.IsAvailable ??
      delo?.dostupno ??
      delo?.Dostupno) === true;

  const canBuy =
    !isAukcija &&
    (isAvailableBool || isAvailableByStatus) &&
    !(isSoldBool || isSoldByStatus) &&
    !isRemovedByStatus &&
    !isReservedBool;

  const statusLabel = (d) => {
    if (!d) return { text: "—", tone: "muted" };

    const onAuction = d.naAukciji ?? d.NaAukciji;
    if (onAuction) return { text: "Na aukciji", tone: "info" };

    const st = d.status ?? d.Status;
    const stNum =
      typeof st === "number" ? st : typeof st === "string" ? Number(st) : null;

    if (stNum === 1) return { text: "Prodato", tone: "danger" };
    if (stNum === 2) return { text: "Uklonjeno", tone: "muted" };
    if (stNum === 0) return { text: "Dostupno", tone: "ok" };

    if (d.isSold ?? d.IsSold ?? d.prodato ?? d.Prodato)
      return { text: "Prodato", tone: "danger" };
    if (d.isAvailable ?? d.IsAvailable ?? d.dostupno ?? d.Dostupno)
      return { text: "Dostupno", tone: "ok" };

    return { text: "—", tone: "muted" };
  };

  const buyerLocked = !authToken || !isKupac;

  // ✅ helper: ime licitanta (KupacIme iz backend-a)
  const getBidderName = (bid) => {
    if (!bid) return "Korisnik";

    const direct =
      bid.kupacIme ||
      bid.KupacIme ||
      bid.korisnikIme ||
      bid.KorisnikIme ||
      bid.imeIPrezime ||
      bid.ImeIPrezime;

    if (direct && String(direct).trim()) return String(direct).trim();

    const k = bid.korisnik || bid.Korisnik;
    const nested =
      k?.imeIPrezime ||
      k?.ImeIPrezime ||
      `${k?.ime || k?.Ime || ""} ${k?.prezime || k?.Prezime || ""}`.trim() ||
      k?.userName ||
      k?.UserName ||
      k?.email ||
      k?.Email;

    return nested && String(nested).trim() ? String(nested).trim() : "Korisnik";
  };

  // sortirane ponude
  const sortedBids = useMemo(() => {
    const list = Array.isArray(ponude) ? [...ponude] : [];
    list.sort(
      (a, b) =>
        Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0)
    );
    return list;
  }, [ponude]);

  const topBidRow = sortedBids[0] ?? null;
  const restBids = sortedBids.slice(1);

  const topBid = useMemo(() => {
    const val = Number(topBidRow?.iznos ?? topBidRow?.Iznos ?? 0);
    return Number.isFinite(val) && val > 0 ? val : null;
  }, [topBidRow]);

  // vreme kraja aukcije + istek
  const auctionEndsAt = useMemo(() => {
    const v = delo?.aukcijaZavrsava || delo?.AukcijaZavrsava;
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  }, [delo]);

  const isAuctionEnded = useMemo(() => {
    if (!isAukcija || !auctionEndsAt) return false;
    return Date.now() >= auctionEndsAt.getTime();
  }, [isAukcija, auctionEndsAt]);

  // ===== API calls =====
  const loadPonude = useCallback(async (umetnickoDeloId) => {
    try {
      const p = await axiosInstance.get(`Aukcija/Ponude/${umetnickoDeloId}`);
      const list = Array.isArray(p.data) ? p.data : [];
      list.sort(
        (a, b) =>
          Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0)
      );
      setPonude(list);
    } catch {
      // ignore
    }
  }, []);

  // ⚠️ koristi umetnickoDeloId (isti kao u Ponude)
  const loadDeloLight = useCallback(async (artworkId) => {
    try {
      const res = await axiosInstance.get(
        `UmetnickoDelo/DeloPoID/${artworkId}`
      );
      const data = res.data;
      setDelo((prev) => ({ ...prev, ...data }));
    } catch {
      // ignore
    }
  }, []);

  // recenzije
  const loadReviews = useCallback(
    async (umetnickoDeloId) => {
      try {
        setReviewsLoading(true);
        setReviewErr("");

        const r = await axiosInstance.get(
          `Recenzija/RecenzijaZaUmetnickoDelo/${umetnickoDeloId}`
        );
        const list = Array.isArray(r.data) ? r.data : [];
        setReviews(list);

        const mine =
          list.find(
            (x) => String(x.korisnikId ?? x.KorisnikId) === String(userId)
          ) || null;

        setMyReview(mine);

        if (mine) {
          setReviewText(mine.komentar ?? mine.Komentar ?? "");
          setReviewRating(Number(mine.ocena ?? mine.Ocena ?? 5));
        } else {
          setReviewText("");
          setReviewRating(5);
        }
      } catch {
        setReviewErr("Ne mogu da učitam recenzije.");
      } finally {
        setReviewsLoading(false);
      }
    },
    [userId]
  );

  // BUY: pravi porudžbinu (1 porudžbina = 1 delo)
  const handleBuy = async () => {
    if (!authToken || !isKupac) return;
    if (!canBuy) return;

    try {
      setBuying(true);

      await axiosInstance.post("Porudzbina/KreiraNovuPorudzbinu", {
        umetnickoDeloId: delo.umetnickoDeloId,
      });

      navigate("/moje-porudzbine");
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.poruka || e?.response?.data?.Poruka || "";

      if (status === 400 && msg.toLowerCase().includes("već postoji")) {
        navigate("/moje-porudzbine");
        return;
      }

      alert(
        status === 403
          ? "Samo Kupac može da kupi delo."
          : "Greška: kupovina nije uspela."
      );
    } finally {
      setBuying(false);
    }
  };

  const handlePlaceBid = async () => {
    if (buyerLocked) return;
    if (isAuctionEnded) {
      setPonudaErr("Aukcija je završena.");
      return;
    }

    setPonudaErr("");

    const n = Number(String(ponudaIznos).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setPonudaErr("Unesi validan iznos.");
      return;
    }

    const current = Number(
      delo?.trenutnaCenaAukcije ?? delo?.TrenutnaCenaAukcije ?? 0
    );
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

      next.sort(
        (a, b) =>
          Number(b.iznos ?? b.Iznos ?? 0) - Number(a.iznos ?? a.Iznos ?? 0)
      );
      setPonude(next);

      setDelo((prev) => ({
        ...prev,
        trenutnaCenaAukcije: n,
      }));

      setPonudaIznos("");
    } catch (e) {
      const status = e?.response?.status;
      setPonudaErr(
        status === 403
          ? "Samo Kupac može da postavi ponudu."
          : "Greška: ponuda nije poslata."
      );
    } finally {
      setPonudaSending(false);
    }
  };

  // recenzija save/update
  const handleSaveReview = async () => {
    if (buyerLocked) return;

    const text = String(reviewText || "").trim();
    if (!text) {
      setReviewErr("Unesi komentar.");
      return;
    }

    const rating = Number(reviewRating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setReviewErr("Ocena mora biti 1–5.");
      return;
    }

    try {
      setReviewSaving(true);
      setReviewErr("");

      if (!myReview) {
        await axiosInstance.post("Recenzija/KreiranjeRecenzije", {
          umetnickoDeloId: delo.umetnickoDeloId,
          komentar: text,
          ocena: rating,
        });
      } else {
        const rid = myReview.recenzijaId ?? myReview.RecenzijaId;
        await axiosInstance.put(`Recenzija/AzuriranjeRecenzijePoID/${rid}`, {
          recenzijaId: rid,
          umetnickoDeloId: delo.umetnickoDeloId,
          komentar: text,
          ocena: rating,
        });
      }

      await loadReviews(delo.umetnickoDeloId);
    } catch (e) {
      const s = e?.response?.status;
      setReviewErr(
        s === 403
          ? "Samo Kupac može da ostavi recenziju."
          : "Greška pri čuvanju recenzije."
      );
    } finally {
      setReviewSaving(false);
    }
  };

  // recenzija delete
  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      setReviewSaving(true);
      setReviewErr("");

      const rid = myReview.recenzijaId ?? myReview.RecenzijaId;
      await axiosInstance.delete(`Recenzija/BrisanjeRecenzije/${rid}`);

      await loadReviews(delo.umetnickoDeloId);
    } catch {
      setReviewErr("Greška pri brisanju recenzije.");
    } finally {
      setReviewSaving(false);
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
            data?.umetnikId ||
            data?.UmetnikId ||
            data?.umetnikID ||
            data?.UmetnikID;

          if (umetnikId) {
            const a = await axiosInstance.get(
              `Umetnik/VracaUmetnikaPoID/${umetnikId}`
            );
            if (!cancelled) setUmetnik(a.data);
          } else {
            setUmetnik(null);
          }
        }

        await loadReviews(data.umetnickoDeloId);

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
  }, [id, apiOrigin, loadPonude, loadReviews]);

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
      // ✅ FIX: osveži delo istim id-em (umetnickoDeloId)
      await loadDeloLight(artworkId);
    }, 3000);

    return () => {
      clearInterval(interval);
      setPollingActive(false);
    };
  }, [isAukcija, delo?.umetnickoDeloId, loadPonude, loadDeloLight]);

  // ===== Finalize aukcije (frontend fallback) =====
  useEffect(() => {
    if (!isAukcija || !delo?.umetnickoDeloId) return;
    if (!isAuctionEnded) return;
    if (finalizing) return;

    let cancelled = false;

    const finalize = async () => {
      try {
        setFinalizing(true);
        setFinalizeErr("");

        await axiosInstance.post("Aukcija/Finalize", {
          umetnickoDeloId: delo.umetnickoDeloId,
        });

        // refresh
        await loadDeloLight(delo.umetnickoDeloId);
        await loadPonude(delo.umetnickoDeloId);

        // winner? (backend može kasnije da doda pobednikId u delo, ali ovde imamo i topBidRow)
        const winnerId =
          delo?.pobednikKorisnikId ||
          delo?.PobednikKorisnikId ||
          topBidRow?.kupacId ||
          topBidRow?.KupacId ||
          topBidRow?.korisnikId ||
          topBidRow?.KorisnikId;

        if (
          !cancelled &&
          authToken &&
          isKupac &&
          winnerId &&
          String(winnerId) === String(userId)
        ) {
          navigate("/moje-porudzbine");
        }
      } catch (e) {
        if (!cancelled)
          setFinalizeErr("Ne mogu da finalizujem aukciju (probaj osvežavanje).");
      } finally {
        if (!cancelled) setFinalizing(false);
      }
    };

    finalize();

    return () => {
      cancelled = true;
    };
  }, [
    isAukcija,
    isAuctionEnded,
    delo?.umetnickoDeloId,
    authToken,
    isKupac,
    userId,
    navigate,
    loadDeloLight,
    loadPonude,
    topBidRow,
    finalizing,
    delo,
  ]);

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
    ? formatEur(
        delo.trenutnaCenaAukcije ??
          delo.TrenutnaCenaAukcije ??
          delo.pocetnaCenaAukcije
      )
    : formatEur(delo.cena ?? delo.Cena);

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
                    disabled={buyerLocked || buying || !canBuy}
                    title={
                      buyerLocked
                        ? "Prijavi se kao Kupac da kupiš delo."
                        : !canBuy
                        ? "Delo nije dostupno za kupovinu."
                        : ""
                    }
                  >
                    {buying ? "Kreiram…" : "Kupi delo"}
                  </button>
                </div>
              )}

              {buyerLocked && (
                <div className="af-inlineNote">
                  Prijavi se kao <strong>Kupac</strong> da bi kupovao ili licitirao.
                </div>
              )}

              {isAukcija && !isAuctionEnded && (
                <div className="af-inlineNote">Kupovina nije dostupna dok je aukcija aktivna.</div>
              )}

              {isAukcija && isAuctionEnded && (
                <div className="af-inlineNote">
                  Aukcija je završena. {finalizing ? "Finalizujem…" : "Čeka se porudžbina pobedniku."}
                </div>
              )}

              {finalizeErr && <div className="af-inlineError">{finalizeErr}</div>}
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
                    disabled={buyerLocked || isAuctionEnded}
                    title={
                      buyerLocked
                        ? "Prijavi se kao Kupac da licitiraš."
                        : isAuctionEnded
                        ? "Aukcija je završena."
                        : ""
                    }
                  />
                  <button
                    className="af-btn af-btnPrimary"
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={buyerLocked || ponudaSending || isAuctionEnded}
                    title={
                      buyerLocked
                        ? "Prijavi se kao Kupac da licitiraš."
                        : isAuctionEnded
                        ? "Aukcija je završena."
                        : ""
                    }
                  >
                    {ponudaSending ? "Šaljem…" : "Postavi ponudu"}
                  </button>
                </div>

                {ponudaErr && <div className="af-inlineError">{ponudaErr}</div>}

                <div className="af-bidsList">
                  <div className="af-bidsLabel">Ponude</div>

                  {ponudeLoading ? (
                    <div className="af-mutedLine">Učitavam ponude…</div>
                  ) : !sortedBids.length ? (
                    <div className="af-mutedLine">Još nema ponuda.</div>
                  ) : (
                    <div className="af-bids">
                      <div className="af-bidRow af-bidRowTop">
                        <div className="af-bidLeft">
                          <span className="af-rank">#1</span>
                          <span className="af-who">{getBidderName(topBidRow)}</span>
                        </div>
                        <strong className="af-bidAmount">
                          {formatEur(Number(topBidRow?.iznos ?? topBidRow?.Iznos ?? 0))}
                        </strong>
                      </div>

                      {restBids.length > 0 && (
                        <button
                          type="button"
                          className="af-btn af-btnGhost af-btnSmall"
                          onClick={() => setShowAllBids((s) => !s)}
                        >
                          {showAllBids
                            ? "Sakrij ostale ponude"
                            : `Prikaži ostale ponude (${restBids.length})`}
                        </button>
                      )}

                      {showAllBids && restBids.length > 0 && (
                        <div className="af-bidsRest">
                          {restBids.map((p, idx) => {
                            const iznos = Number(p.iznos ?? p.Iznos ?? 0);

                            return (
                              <div
                                key={p?.ponudaId ?? p?.PonudaId ?? p?.aukcijskaPonudaId ?? `${idx}-${iznos}`}
                                className="af-bidRow"
                              >
                                <div className="af-bidLeft">
                                  <span className="af-rank">#{idx + 2}</span>
                                  <span className="af-who">{getBidderName(p)}</span>
                                </div>
                                <strong className="af-bidAmount">{formatEur(iznos)}</strong>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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

        {/* RECENZIJE */}
        <div className="af-reviewsCard">
          <div className="af-reviewsHead">
            <h2 className="af-reviewsTitle">Recenzije</h2>
          </div>

          {reviewsLoading ? (
            <div className="af-mutedLine">Učitavam recenzije…</div>
          ) : reviewErr ? (
            <div className="af-inlineError">{reviewErr}</div>
          ) : null}

          {authToken && isKupac ? (
            <div className="af-reviewForm">
              <div className="af-formRow">
                <label className="af-label">Ocena</label>
                <select
                  className="af-input"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  disabled={reviewSaving}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="af-formRow">
                <label className="af-label">Komentar</label>
                <textarea
                  className="af-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ostavi utisak o delu…"
                  disabled={reviewSaving}
                  rows={4}
                />
              </div>

              <div className="af-formActions">
                <button
                  className="af-btn af-btnPrimary"
                  type="button"
                  onClick={handleSaveReview}
                  disabled={reviewSaving}
                >
                  {reviewSaving ? "Čuvam…" : myReview ? "Ažuriraj recenziju" : "Objavi recenziju"}
                </button>

                {myReview && (
                  <button
                    className="af-btn af-btnGhost"
                    type="button"
                    onClick={handleDeleteReview}
                    disabled={reviewSaving}
                  >
                    Obriši svoju recenziju
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="af-inlineNote">
              Prijavi se kao <strong>Kupac</strong> da bi ostavio recenziju.
            </div>
          )}

          <div className="af-reviewsList">
            {reviews?.length ? (
              reviews.map((r, i) => {
                const rid = r.recenzijaId ?? r.RecenzijaId ?? i;
                const rating = Number(r.ocena ?? r.Ocena ?? 0);
                const text = r.komentar ?? r.Komentar ?? "";
                const who =
                  r.korisnikIme ||
                  r.KorisnikIme ||
                  r.korisnik?.imeIPrezime ||
                  r.Korisnik?.ImeIPrezime ||
                  "Kupac";

                return (
                  <div key={rid} className="af-reviewItem">
                    <div className="af-reviewTop">
                      <div className="af-reviewWho">{who}</div>
                      <div className="af-reviewRating">★ {rating}/5</div>
                    </div>
                    <div className="af-reviewText">{text}</div>
                  </div>
                );
              })
            ) : (
              <div className="af-mutedLine">Još nema recenzija.</div>
            )}
          </div>
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
