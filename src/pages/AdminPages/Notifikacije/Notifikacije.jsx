import React, { useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../components/axios/axiosInstance";
import { AppContext } from "../../../context/AppContext";
import "./Notifikacije.css";

export default function Notifikacije() {
  const { isLoading, isAdmin, userId } = useContext(AppContext);

  // ✅ ID trenutno ulogovanog korisnika (za čitanje notifikacija)
  const korisnikId = userId || "";

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  // ✅ ADMIN: lista korisnika + odabir primaoca
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [targetUserId, setTargetUserId] = useState(""); // kome admin šalje

  // admin form
  const [poruka, setPoruka] = useState("");
  const [tip, setTip] = useState("Obavestenje"); // Obavestenje | Porudzbina | Recenzija
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const tipLabel = useMemo(
    () => ({
      Obavestenje: "Obaveštenje",
      Porudzbina: "Porudžbina",
      Recenzija: "Recenzija",
    }),
    []
  );

  const tipBadgeClass = (t) => {
    const v = String(t || "").toLowerCase();
    if (v.includes("por")) return "notif__badge notif__badge--order";
    if (v.includes("rec")) return "notif__badge notif__badge--review";
    return "notif__badge notif__badge--info";
  };

  // normalizuj tip (može da stigne kao 0/1/2 ili string)
  const normalizeTip = (t) => {
    if (t === 0 || t === "0") return "Obavestenje";
    if (t === 1 || t === "1") return "Porudzbina";
    if (t === 2 || t === "2") return "Recenzija";
    if (typeof t === "string" && t.trim()) return t;
    return "Obavestenje";
  };

  const normalizeDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString("sr-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ učitaj notifikacije za trenutno ulogovanog korisnika
  const fetchList = async () => {
    if (!korisnikId) {
      setItems([]);
      setLoadingList(false);
      setError("Nedostaje korisnikId (proveri AppContext).");
      return;
    }

    setLoadingList(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `Notifikacija/SveNotifikacije/${korisnikId}`
      );
      const list = Array.isArray(res.data) ? res.data : [];

      // sort newest first (DatumKreiranja)
      list.sort((a, b) => {
        const da = new Date(a?.datumKreiranja || a?.DatumKreiranja || 0).getTime();
        const db = new Date(b?.datumKreiranja || b?.DatumKreiranja || 0).getTime();
        return db - da;
      });

      setItems(list);
    } catch (e) {
      console.error("FETCH NOTIF ERROR:", e?.response?.data || e);
      setError(
        typeof e?.response?.data === "string"
          ? e.response.data
          : e?.response?.data?.Poruka || "Greška pri učitavanju notifikacija."
      );
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  };

  // ✅ admin: učitaj sve korisnike da može da izabere primaoca
  const fetchUsers = async () => {
    if (!isAdmin) return;

    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get("Korisnik/DohvatiSveKorisnike");
      const list = Array.isArray(res.data) ? res.data : [];
      setAllUsers(list);

      // default selekcija (prvi user iz liste) ako nije već odabrano
      if (!targetUserId && list.length) {
        const firstId = list[0]?.id || list[0]?.Id || "";
        if (firstId) setTargetUserId(String(firstId));
      }
    } catch (e) {
      console.error("FETCH USERS ERROR:", e?.response?.data || e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isLoading) fetchList();
    if (!isLoading && isAdmin) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, korisnikId, isAdmin]);

  // ✅ map tip string -> enum int (0/1/2)
  const tipToInt = (t) => (t === "Porudzbina" ? 1 : t === "Recenzija" ? 2 : 0);

  // ✅ helper: pronađi label za korisnika (email/ime)
  const getUserLabel = (id) => {
    const u = allUsers.find((x) => String(x?.id || x?.Id || "") === String(id));
    if (!u) return id ? String(id) : "—";
    const email = u?.email || u?.Email || "";
    const name = u?.imeIPrezime || u?.ImeIPrezime || "";
    return `${email}${name ? " — " + name : ""}`.trim();
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (saving) return;

    const p = String(poruka || "").trim();
    if (!p) return;

    const receiverId = String(targetUserId || "").trim();
    if (!receiverId) {
      alert("Odaberi primaoca (KorisnikId).");
      return;
    }
    if (!korisnikId) {
      alert("Nedostaje admin userId (proveri AppContext).");
      return;
    }

    setSaving(true);
    try {
      const tipInt = tipToInt(tip);

      // 1) ✅ Notifikacija za primaoca
      await axiosInstance.post("Notifikacija/KreirajNotifikaciju", {
        KorisnikId: receiverId,
        Poruka: p,
        Tip: tipInt,
      });

      // 2) ✅ Kopija za admina, da ostane njemu vidljivo šta je poslao
      // (ako šalje sam sebi, nema potrebe za dupliranjem)
      if (receiverId !== korisnikId) {
        const toLabel = getUserLabel(receiverId);
        const adminCopyMsg = `📤 Poslato: ${toLabel}\n\n${p}`;

        await axiosInstance.post("Notifikacija/KreirajNotifikaciju", {
          KorisnikId: korisnikId,
          Poruka: adminCopyMsg.slice(0, 300), // sigurnost zbog max 300
          Tip: tipInt,
        });
      }

      setPoruka("");
      setTip("Obavestenje");

      // refresh adminove liste (da vidi kopiju odmah)
      await fetchList();
      alert("Notifikacija uspešno poslata.");
    } catch (e2) {
      console.error("CREATE NOTIF ERROR:", e2?.response?.data || e2);

      const data = e2?.response?.data;
      if (typeof data === "string") {
        alert(data);
      } else if (data?.errors) {
        const msg = Object.entries(data.errors)
          .map(([k, arr]) => `${k}: ${(arr || []).join(", ")}`)
          .join("\n");
        alert(msg || "Bad Request — vidi konzolu.");
      } else {
        alert(data?.Poruka || "Greška pri kreiranju notifikacije.");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteNotif = async (id) => {
    if (!isAdmin) return;
    const ok = window.confirm("Obrisati obaveštenje? Ovo je trajno.");
    if (!ok) return;

    setDeletingId(id);
    try {
      await axiosInstance.delete(`Notifikacija/ObrisiNotifikaciju/${id}`);
      setItems((prev) =>
        prev.filter((x) => (x.notifikacijaId || x.NotifikacijaId) !== id)
      );
    } catch (e) {
      console.error("DELETE NOTIF ERROR:", e?.response?.data || e);
      alert(
        typeof e?.response?.data === "string"
          ? e.response.data
          : e?.response?.data?.Poruka || "Greška pri brisanju notifikacije."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <div className="notifPage">Učitavanje...</div>;

  return (
    <div className="notifPage">
      <header className="notifHero">
        <div className="notifBadge">ARTIFY • Notifikacije</div>
        <h1 className="notifTitle">Obaveštenja i aktivnosti</h1>
        <p className="notifSubtitle">
          Ovde vidiš svoja obaveštenja.{" "}
          {isAdmin ? "Kao admin možeš i da dodaješ/obrišeš." : ""}
        </p>
      </header>

      <section className="notifSection">
        {/* ✅ ADMIN: kreiranje */}
        {isAdmin && (
          <form className="notifComposer" onSubmit={submitCreate}>
            <div className="notifComposer__top">
              <div className="notifComposer__left">
                <div className="notifComposer__label">Nova notifikacija</div>
                <div className="notifComposer__meta">
                  Primalac:{" "}
                  <span className="mono">
                    {targetUserId ? getUserLabel(targetUserId) : "—"}
                  </span>
                </div>
              </div>

              <div className="notifComposer__right">
                {/* ✅ PRIMALAC */}
                <select
                  className="notifSelect"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  disabled={loadingUsers || !allUsers.length}
                  title={!allUsers.length ? "Nema korisnika" : "Odaberi primaoca"}
                >
                  {allUsers.map((u) => {
                    const id = String(u?.id || u?.Id || "");
                    const email = u?.email || u?.Email || "";
                    const name = u?.imeIPrezime || u?.ImeIPrezime || "";
                    const label = `${email}${name ? " — " + name : ""} (${id.slice(
                      0,
                      6
                    )}...)`;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>

                {/* ✅ TIP */}
                <select
                  className="notifSelect"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                >
                  <option value="Obavestenje">Obaveštenje</option>
                  <option value="Porudzbina">Porudžbina</option>
                  <option value="Recenzija">Recenzija</option>
                </select>

                <button
                  className="notifBtn notifBtn--primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Dodajem..." : "Pošalji"}
                </button>
              </div>
            </div>

            <textarea
              className="notifTextarea"
              value={poruka}
              onChange={(e) => setPoruka(e.target.value)}
              maxLength={300}
              placeholder="Napiši poruku (max 300 karaktera)…"
              required
            />
            <div className="notifComposer__footer">
              <span className="muted">{String(poruka || "").length}/300</span>
              <span className="muted">
                Admin dobija kopiju poslate notifikacije.
              </span>
            </div>
          </form>
        )}

        {/* LISTA */}
        <div className="notifCard">
          <div className="notifCard__head">
            <h2 className="notifCard__title">Tvoja obaveštenja</h2>
            <button
              className="notifBtn"
              type="button"
              onClick={fetchList}
              disabled={loadingList}
            >
              {loadingList ? "Osvežavam..." : "Osveži"}
            </button>
          </div>

          {error && <div className="notifMeta notifMeta--error">{error}</div>}
          {!error && loadingList && <div className="notifMeta">Učitavanje...</div>}

          {!loadingList && !error && items.length === 0 && (
            <div className="notifEmpty">Trenutno nema obaveštenja.</div>
          )}

          {!loadingList && !error && items.length > 0 && (
            <div className="notifList">
              {items.map((n) => {
                const id = n?.notifikacijaId ?? n?.NotifikacijaId;
                const msg = n?.poruka ?? n?.Poruka ?? "";
                const t = normalizeTip(n?.tip ?? n?.Tip);
                const when = normalizeDate(
                  n?.datumKreiranja ?? n?.DatumKreiranja
                );

                return (
                  <div className="notifItem" key={id}>
                    <div className="notifItem__top">
                      <span className={tipBadgeClass(t)}>{tipLabel[t] || t}</span>
                      <span className="notifDate">{when}</span>
                    </div>

                    <div className="notifMsg">{msg}</div>

                    <div className="notifItem__bottom">
                      <div className="notifIds">
                        <span className="muted mono">ID: {id}</span>
                        {(n?.porudzbinaId ?? n?.PorudzbinaId) ? (
                          <span className="muted mono">
                            PorudzbinaId: {n?.porudzbinaId ?? n?.PorudzbinaId}
                          </span>
                        ) : null}
                        {(n?.umetnickoDeloId ?? n?.UmetnickoDeloId) ? (
                          <span className="muted mono">
                            UmetnickoDeloId:{" "}
                            {n?.umetnickoDeloId ?? n?.UmetnickoDeloId}
                          </span>
                        ) : null}
                      </div>

                      {isAdmin && (
                        <button
                          className="notifBtn notifBtn--danger"
                          type="button"
                          onClick={() => deleteNotif(id)}
                          disabled={deletingId === id}
                          title="Obriši notifikaciju"
                        >
                          {deletingId === id ? "Brišem..." : "Obriši"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
