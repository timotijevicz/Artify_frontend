import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../components/axios/axiosInstance";
import { AppContext } from "../../../context/AppContext";
import "./KupacProfil.css";

export default function KupacProfil() {
  const { isLoading, isKupac, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);

  // promena lozinke
  const [passForm, setPassForm] = useState({
    trenutnaLozinka: "",
    novaLozinka: "",
    potvrdaNoveLozinke: "",
  });
  const [savingPass, setSavingPass] = useState(false);

  // promena email-a
  const [emailForm, setEmailForm] = useState({
    noviEmail: "",
    lozinka: "",
  });
  const [savingEmail, setSavingEmail] = useState(false);

  // brisanje naloga
  const [deletePass, setDeletePass] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get("Korisnik/MojProfil");
      setProfile(res.data);

      // pokušaj da popuni email input iz responsea
      const email =
        res.data?.email ||
        res.data?.Email ||
        res.data?.user?.email ||
        res.data?.User?.Email ||
        "";
      if (email) setEmailForm((p) => ({ ...p, noviEmail: email }));
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri učitavanju profila."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!isLoading) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) return <div className="kupacProfil">Učitavanje...</div>;
  if (!isKupac) return <div className="kupacProfil">Nemaš pristup ovoj stranici.</div>;

  const onChangePass = (e) => {
    const { name, value } = e.target;
    setPassForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeEmail = (e) => {
    const { name, value } = e.target;
    setEmailForm((p) => ({ ...p, [name]: value }));
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
      await fetchProfile();
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

  const submitDelete = async (e) => {
    e.preventDefault();
    if (deleting) return;

    if (!deletePass.trim()) {
      alert("Unesi lozinku za potvrdu brisanja.");
      return;
    }

    const ok = window.confirm(
      "Da li si siguran da želiš da obrišeš nalog? Ova akcija je trajna."
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await axiosInstance.delete("Korisnik/BrisanjeMogNaloga", {
        data: { lozinka: deletePass },
      });

      alert(typeof res.data === "string" ? res.data : "Nalog obrisan.");

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
  <div className="kupacProfil">
    <h1 className="kupacProfil__title">Moj profil</h1>

    <div className="kupacProfil__grid">
      {/* PROFIL */}
      {loadingProfile ? (
        <div className="kupacProfil__card kupacProfil__card--profile">
          Učitavanje profila...
        </div>
      ) : (
        <div className="kupacProfil__card kupacProfil__card--profile">
          <div className="kupacProfil__row">
            <div className="kupacProfil__label">Korisničko ime:</div>
            <div className="kupacProfil__value">
              {profile?.ImeIPrezime || profile?.imeIPrezime || "—"}
            </div>
          </div>

          <div className="kupacProfil__row">
            <div className="kupacProfil__label">Email:</div>
            <div className="kupacProfil__value">
              {profile?.email || profile?.Email || "—"}
            </div>
          </div>
        </div>
      )}

      {/* PROMENA LOZINKE */}
      <form
        className="kupacProfil__card kupacProfil__form kupacProfil__card--pass"
        onSubmit={submitPassword}
      >
        <h2 className="kupacProfil__sectionTitle">Promena lozinke</h2>

        <input
          className="kupacProfil__input"
          type="password"
          name="trenutnaLozinka"
          placeholder="Trenutna lozinka"
          value={passForm.trenutnaLozinka}
          onChange={onChangePass}
          required
        />

        <input
          className="kupacProfil__input"
          type="password"
          name="novaLozinka"
          placeholder="Nova lozinka"
          value={passForm.novaLozinka}
          onChange={onChangePass}
          required
        />

        <input
          className="kupacProfil__input"
          type="password"
          name="potvrdaNoveLozinke"
          placeholder="Potvrdi novu lozinku"
          value={passForm.potvrdaNoveLozinke}
          onChange={onChangePass}
          required
        />

        <button
          className="kupacProfil__btn kupacProfil__btnPrimary"
          type="submit"
          disabled={savingPass}
        >
          {savingPass ? "Menjam..." : "Promeni lozinku"}
        </button>
      </form>

      {/* PROMENA EMAIL */}
      <form
        className="kupacProfil__card kupacProfil__form kupacProfil__card--email"
        onSubmit={submitEmail}
      >
        <h2 className="kupacProfil__sectionTitle">Promena email-a</h2>

        <input
          className="kupacProfil__input"
          type="email"
          name="noviEmail"
          placeholder="Novi email"
          value={emailForm.noviEmail}
          onChange={onChangeEmail}
          required
        />

        <input
          className="kupacProfil__input"
          type="password"
          name="lozinka"
          placeholder="Potvrdi lozinkom"
          value={emailForm.lozinka}
          onChange={onChangeEmail}
          required
        />

        <button
          className="kupacProfil__btn kupacProfil__btnPrimary"
          type="submit"
          disabled={savingEmail}
        >
          {savingEmail ? "Menjam..." : "Promeni email"}
        </button>
      </form>

      {/* BRISANJE NALOGA — preko cele širine */}
      <form
        className="kupacProfil__card kupacProfil__cardDanger kupacProfil__form kupacProfil__card--delete"
        onSubmit={submitDelete}
      >
        <h2 className="kupacProfil__dangerTitle">Obriši nalog</h2>
        <div className="kupacProfil__muted">
          Ova akcija je trajna. Potvrdi lozinkom.
        </div>

        <input
          className="kupacProfil__input"
          type="password"
          placeholder="Unesi lozinku za potvrdu"
          value={deletePass}
          onChange={(e) => setDeletePass(e.target.value)}
          required
        />

        <button
          className="kupacProfil__btn kupacProfil__btnDanger"
          type="submit"
          disabled={deleting}
        >
          {deleting ? "Brišem..." : "Obriši nalog"}
        </button>
      </form>
    </div>
  </div>
);

}
