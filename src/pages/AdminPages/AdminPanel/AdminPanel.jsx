// AdminPanelKorisnici.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../components/axios/axiosInstance";
import { AppContext } from "../../../context/AppContext";
import "./AdminPanel.css";

export default function AdminPanelKorisnici() {
  const { isLoading, isAdmin } = useContext(AppContext);

  const [allUsers, setAllUsers] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const [qKupci, setQKupci] = useState("");
  const [qUmetnici, setQUmetnici] = useState("");

  // ✅ ID ulogovanog admina (da zabrani brisanje samog sebe)
  const [myUserId, setMyUserId] = useState(null);

  const fetchMe = async () => {
    try {
      const res = await axiosInstance.get("Korisnik/MojProfil");
      const id = res.data?.id || res.data?.Id || null;
      setMyUserId(id ? String(id) : null);
    } catch (err) {
      console.error(err);
      setMyUserId(null);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get("Korisnik/DohvatiSveKorisnike");
      setAllUsers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Greška pri učitavanju korisnika.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchArtists = async () => {
    setLoadingArtists(true);
    try {
      const res = await axiosInstance.get("Umetnik/SviUmetnici");
      setArtists(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Greška pri učitavanju umetnika.");
    } finally {
      setLoadingArtists(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchMe();       // ✅ dodato
      fetchUsers();
      fetchArtists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ✅ Map umetnika po korisnikId (da izdvojimo kupce bez backend rola)
  const artistUserIds = useMemo(() => {
    const set = new Set();
    for (const a of artists) {
      const kid = a?.korisnikId || a?.KorisnikId;
      if (kid) set.add(String(kid));
    }
    return set;
  }, [artists]);

  const kupci = useMemo(() => {
    return allUsers.filter((u) => {
      const id = String(u?.id || u?.Id || "");
      return id && !artistUserIds.has(id);
    });
  }, [allUsers, artistUserIds]);

  const filteredKupci = useMemo(() => {
    const q = qKupci.trim().toLowerCase();
    if (!q) return kupci;
    return kupci.filter((u) => {
      const email = (u.email || u.Email || "").toLowerCase();
      const name = (u.imeIPrezime || u.ImeIPrezime || "").toLowerCase();
      const id = String(u.id || u.Id || "").toLowerCase();
      return email.includes(q) || name.includes(q) || id.includes(q);
    });
  }, [kupci, qKupci]);

  const filteredArtists = useMemo(() => {
    const q = qUmetnici.trim().toLowerCase();
    if (!q) return artists;

    return artists.filter((a) => {
      const korisnik = a.korisnik || a.Korisnik || {};
      const email = (korisnik.email || korisnik.Email || "").toLowerCase();
      const name = (korisnik.imeIPrezime || korisnik.ImeIPrezime || "").toLowerCase();
      const kid = String(a.korisnikId || a.KorisnikId || "").toLowerCase();
      const umetnikId = String(a.umetnikId || a.UmetnikId || "").toLowerCase();
      return email.includes(q) || name.includes(q) || kid.includes(q) || umetnikId.includes(q);
    });
  }, [artists, qUmetnici]);

  if (isLoading) return <div className="admUsers">Učitavanje...</div>;
  if (!isAdmin) return <div className="admUsers">Nemaš pristup ovoj stranici.</div>;

  const deleteKupac = async (korisnikId) => {
    if (myUserId && String(korisnikId) === String(myUserId)) {
      alert("Admin ne može da obriše svoj profil.");
      return;
    }

    const ok = window.confirm("Obrisati kupca? Ovo je trajno.");
    if (!ok) return;

    try {
      await axiosInstance.delete(`Korisnik/BrisanjeKorisnika/${korisnikId}`);
      setAllUsers((p) => p.filter((x) => String(x.id || x.Id) !== String(korisnikId)));
    } catch (err) {
      console.error(err);
      alert(typeof err?.response?.data === "string" ? err.response.data : "Greška pri brisanju kupca.");
    }
  };

  const deleteUmetnik = async (korisnikId) => {
    if (myUserId && String(korisnikId) === String(myUserId)) {
      alert("Admin ne može da obriše svoj profil.");
      return;
    }

    const ok = window.confirm("Obrisati umetnika i njegova dela? Ovo je trajno.");
    if (!ok) return;

    try {
      await axiosInstance.delete(`Korisnik/BrisanjeUmetnika/${korisnikId}`, {
        data: [],
      });

      await fetchArtists();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert(typeof err?.response?.data === "string" ? err.response.data : "Greška pri brisanju umetnika.");
    }
  };

  return (
    <div className="admUsers">
      <h1 className="admUsers__title">Admin panel — korisnici</h1>

      <div className="admUsers__grid">
        {/* KUPCI */}
        <div className="admUsers__card">
          <div className="admUsers__top">
            <h2 className="admUsers__section">Kupci</h2>
            <input
              className="admUsers__search"
              placeholder="Pretraga kupaca..."
              value={qKupci}
              onChange={(e) => setQKupci(e.target.value)}
            />
          </div>

          {loadingUsers ? (
            <div className="admUsers__muted">Učitavanje...</div>
          ) : (
            <div className="admUsers__list">
              {filteredKupci.map((u) => {
                const id = u.id || u.Id;
                const email = u.email || u.Email || "—";
                const name = u.imeIPrezime || u.ImeIPrezime || "—";

                const isMe = myUserId && String(id) === String(myUserId);

                return (
                  <div className="admUsers__item" key={id}>
                    <div className="admUsers__main">
                      <div className="admUsers__primary">{email}</div>
                      <div className="admUsers__secondary">{name}</div>
                      <div className="admUsers__secondary admUsers__mono">{id}</div>
                      {isMe && (
                        <div className="admUsers__secondary" style={{ marginTop: 6, opacity: 0.8 }}>
                          Admin ne može da obriše svoj profil.
                        </div>
                      )}
                    </div>

                    <button
                      className="admUsers__btn admUsers__btnDanger"
                      onClick={() => deleteKupac(id)}
                      type="button"
                      disabled={isMe}
                      title={isMe ? "Admin ne može da obriše svoj profil." : ""}
                    >
                      Obriši
                    </button>
                  </div>
                );
              })}

              {!filteredKupci.length && <div className="admUsers__muted">Nema kupaca za prikaz.</div>}
            </div>
          )}
        </div>

        {/* UMETNICI */}
        <div className="admUsers__card">
          <div className="admUsers__top">
            <h2 className="admUsers__section">Umetnici</h2>
            <input
              className="admUsers__search"
              placeholder="Pretraga umetnika..."
              value={qUmetnici}
              onChange={(e) => setQUmetnici(e.target.value)}
            />
          </div>

          {loadingArtists ? (
            <div className="admUsers__muted">Učitavanje...</div>
          ) : (
            <div className="admUsers__list">
              {filteredArtists.map((a) => {
                const korisnikId = a.korisnikId || a.KorisnikId;
                const umetnikId = a.umetnikId || a.UmetnikId;

                const k = a.korisnik || a.Korisnik || {};
                const email = k.email || k.Email || "—";
                const name = k.imeIPrezime || k.ImeIPrezime || "—";

                const isMe = myUserId && korisnikId && String(korisnikId) === String(myUserId);

                return (
                  <div className="admUsers__item" key={umetnikId || korisnikId}>
                    <div className="admUsers__main">
                      <div className="admUsers__primary">{email}</div>
                      <div className="admUsers__secondary">{name}</div>
                      <div className="admUsers__secondary admUsers__mono">UmetnikId: {umetnikId || "—"}</div>
                      <div className="admUsers__secondary admUsers__mono">KorisnikId: {korisnikId || "—"}</div>

                      {isMe && (
                        <div className="admUsers__secondary" style={{ marginTop: 6, opacity: 0.8 }}>
                          Admin ne može da obriše svoj profil.
                        </div>
                      )}
                    </div>

                    <button
                      className="admUsers__btn admUsers__btnDanger"
                      onClick={() => deleteUmetnik(korisnikId)}
                      type="button"
                      disabled={!korisnikId || isMe}
                      title={
                        !korisnikId
                          ? "Nema korisnikId"
                          : isMe
                          ? "Admin ne može da obriše svoj profil."
                          : ""
                      }
                    >
                      Obriši
                    </button>
                  </div>
                );
              })}

              {!filteredArtists.length && <div className="admUsers__muted">Nema umetnika za prikaz.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
