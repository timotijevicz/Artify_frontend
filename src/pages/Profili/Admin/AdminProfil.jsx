// AdminProfil.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../components/axios/axiosInstance";
import { AppContext } from "../../../context/AppContext";
import "./AdminProfil.css";

export default function AdminProfil() {
  const { isLoading, isAdmin, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [myProfile, setMyProfile] = useState(null);
  const [loadingMy, setLoadingMy] = useState(true);

  const [passForm, setPassForm] = useState({
    trenutnaLozinka: "",
    novaLozinka: "",
    potvrdaNoveLozinke: "",
  });
  const [savingPass, setSavingPass] = useState(false);

  const [emailForm, setEmailForm] = useState({
    noviEmail: "",
    lozinka: "",
  });
  const [savingEmail, setSavingEmail] = useState(false);

  // ✅ koristi se u delete formi
  const [deletePass, setDeletePass] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchMyProfile = async () => {
    setLoadingMy(true);
    try {
      const res = await axiosInstance.get("Korisnik/MojProfil");
      setMyProfile(res.data);

      const email = res.data?.email || res.data?.Email || "";
      if (email) setEmailForm((p) => ({ ...p, noviEmail: email }));
    } catch (err) {
      console.error(err);
      alert("Greška pri učitavanju admin profila.");
    } finally {
      setLoadingMy(false);
    }
  };

  useEffect(() => {
    if (!isLoading) fetchMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) return <div className="adminProfil">Učitavanje...</div>;
  if (!isAdmin) return <div className="adminProfil">Nemaš pristup ovoj stranici.</div>;

  const onChangePass = (e) => {
    const { name, value } = e.target;
    setPassForm((p) => ({ ...p, [name]: value }));
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (savingPass) return;

    if (passForm.novaLozinka !== passForm.potvrdaNoveLozinke) {
      alert("Nova lozinka i potvrda se ne poklapaju.");
      return;
    }

    setSavingPass(true);
    try {
      const res = await axiosInstance.post(
        "Korisnik/PromenaLozinkeMojProfil",
        passForm
      );
      alert(typeof res.data === "string" ? res.data : "Lozinka promenjena.");

      setPassForm({
        trenutnaLozinka: "",
        novaLozinka: "",
        potvrdaNoveLozinke: "",
      });
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri promeni lozinke."
      );
    } finally {
      setSavingPass(false);
    }
  };

  const onChangeEmail = (e) => {
    const { name, value } = e.target;
    setEmailForm((p) => ({ ...p, [name]: value }));
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (savingEmail) return;

    setSavingEmail(true);
    try {
      const res = await axiosInstance.post(
        "Korisnik/PromenaEmailaMojProfil",
        emailForm
      );
      alert(typeof res.data === "string" ? res.data : "Email promenjen.");

      setEmailForm((p) => ({ ...p, lozinka: "" }));
      await fetchMyProfile();
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri promeni email-a."
      );
    } finally {
      setSavingEmail(false);
    }
  };

  // ✅ sada se koristi (forma ispod)
  const submitDeleteMy = async (e) => {
    e.preventDefault();
    if (deleting) return;

    const ok = window.confirm("Da li si siguran? Brisanje naloga je trajno.");
    if (!ok) return;

    setDeleting(true);
    try {
      await axiosInstance.delete("Korisnik/BrisanjeMogNaloga", {
        data: { lozinka: deletePass },
      });

      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri brisanju naloga."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="adminProfil">
      <h1 className="adminProfil__title">Admin profil</h1>

      {/* MOJ PROFIL */}
      <div className="adminProfil__card">
        <h2 className="adminProfil__sectionTitle">Moj profil</h2>

        {loadingMy ? (
          <div className="adminProfil__muted">Učitavanje...</div>
        ) : (
          <>
            <div className="adminProfil__row">
              <div className="adminProfil__label">Ime:</div>
              <div className="adminProfil__value">
                {myProfile?.imeIPrezime || myProfile?.ImeIPrezime || "—"}
              </div>
            </div>

            <div className="adminProfil__row">
              <div className="adminProfil__label">Email:</div>
              <div className="adminProfil__value">
                {myProfile?.email || myProfile?.Email || "—"}
              </div>
            </div>

            <div className="adminProfil__row">
              <div className="adminProfil__label">ID:</div>
              <div className="adminProfil__value adminProfil__mono">
                {myProfile?.id || myProfile?.Id || "—"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* PROMENA LOZINKE */}
      <form className="adminProfil__card adminProfil__form" onSubmit={submitPassword}>
        <h2 className="adminProfil__sectionTitle">Promena lozinke</h2>

        <input
          className="adminProfil__input"
          type="password"
          name="trenutnaLozinka"
          placeholder="Trenutna lozinka"
          value={passForm.trenutnaLozinka}
          onChange={onChangePass}
          required
        />

        <input
          className="adminProfil__input"
          type="password"
          name="novaLozinka"
          placeholder="Nova lozinka"
          value={passForm.novaLozinka}
          onChange={onChangePass}
          required
        />

        <input
          className="adminProfil__input"
          type="password"
          name="potvrdaNoveLozinke"
          placeholder="Potvrda nove lozinke"
          value={passForm.potvrdaNoveLozinke}
          onChange={onChangePass}
          required
        />

        <button
          className="adminProfil__btn adminProfil__btnPrimary"
          type="submit"
          disabled={savingPass}
        >
          {savingPass ? "Menjam..." : "Promeni lozinku"}
        </button>
      </form>

      {/* PROMENA EMAIL-a */}
      <form className="adminProfil__card adminProfil__form" onSubmit={submitEmail}>
        <h2 className="adminProfil__sectionTitle">Promena email-a</h2>

        <input
          className="adminProfil__input"
          type="email"
          name="noviEmail"
          placeholder="Novi email"
          value={emailForm.noviEmail}
          onChange={onChangeEmail}
          required
        />

        <input
          className="adminProfil__input"
          type="password"
          name="lozinka"
          placeholder="Potvrdi lozinkom"
          value={emailForm.lozinka}
          onChange={onChangeEmail}
          required
        />

        <button
          className="adminProfil__btn adminProfil__btnPrimary"
          type="submit"
          disabled={savingEmail}
        >
          {savingEmail ? "Menjam..." : "Promeni email"}
        </button>
      </form>

      {/* BRISANJE NALOGA */}
      <form className="adminProfil__card adminProfil__form" onSubmit={submitDeleteMy}>
        <h2 className="adminProfil__sectionTitle">Brisanje naloga</h2>

        <input
          className="adminProfil__input"
          type="password"
          placeholder="Potvrdi lozinkom"
          value={deletePass}
          onChange={(e) => setDeletePass(e.target.value)}
          required
        />

        <button
          className="adminProfil__btn adminProfil__btnPrimary"
          type="submit"
          disabled={deleting}
        >
          {deleting ? "Brišem..." : "Obriši nalog"}
        </button>
      </form>
    </div>
  );
}