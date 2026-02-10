import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../components/axios/axiosInstance";
import { AppContext } from "../../../context/AppContext";
import { openCloudinaryWidget } from "../../../utils/cloudinaryWidgetArtist";
import "./UmetnikProfil.css";

export default function UmetnikProfil() {
  const { isLoading, isUmetnik, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const [loadingArtist, setLoadingArtist] = useState(true);

  const [artistForm, setArtistForm] = useState({
    biografija: "",
    tehnika: "",
    stil: "",
    specijalizacija: "",
    grad: "",
    isAvailable: false,
    slikaUrl: "",
  });

  const [preview, setPreview] = useState("");
  const [savingArtist, setSavingArtist] = useState(false);

  // password/email/delete
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

  const [deletePass, setDeletePass] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ======================
  // FETCH
  // ======================
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await axiosInstance.get("Korisnik/MojProfil");
      setUserProfile(res.data);

      const email = res.data?.email || res.data?.Email || "";
      if (email) setEmailForm((p) => ({ ...p, noviEmail: email }));
    } catch (err) {
      console.error(err);
      alert("Greška pri učitavanju korisničkog profila.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchArtistProfile = async () => {
    setLoadingArtist(true);
    try {
      const res = await axiosInstance.get("Umetnik/MojUmetnikProfil");

      setArtistForm({
        biografija: res.data?.biografija ?? res.data?.Biografija ?? "",
        tehnika: res.data?.tehnika ?? res.data?.Tehnika ?? "",
        stil: res.data?.stil ?? res.data?.Stil ?? "",
        specijalizacija:
          res.data?.specijalizacija ?? res.data?.Specijalizacija ?? "",
        grad: res.data?.grad ?? res.data?.Grad ?? "",
        isAvailable: res.data?.isAvailable ?? res.data?.IsAvailable ?? false,
        slikaUrl: res.data?.slikaUrl ?? res.data?.SlikaUrl ?? "",
      });

      const img = res.data?.slikaUrl ?? res.data?.SlikaUrl ?? "";
      setPreview(img || "");
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri učitavanju umetnik profila."
      );
    } finally {
      setLoadingArtist(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchUserProfile();
      fetchArtistProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) return <div className="umProfil">Učitavanje...</div>;
  if (!isUmetnik)
    return <div className="umProfil">Nemaš pristup ovoj stranici.</div>;

  // ======================
  // ARTIST FORM
  // ======================
  const onChangeArtist = (e) => {
    const { name, value, type, checked } = e.target;
    setArtistForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImage = () => {
    openCloudinaryWidget({
      onSuccess: async (url) => {
        // 1) UI odmah
        setArtistForm((p) => ({ ...p, slikaUrl: url }));
        setPreview(url);

        // 2) Odmah snimi na backend (da bude sigurno u bazi)
        try {
          await axiosInstance.post("Umetnik/PostaviMojuSliku", { slikaUrl: url });
        } catch (err) {
          console.error(err);
          alert("Slika uploadovana, ali nije sačuvana u bazi.");
        }
      },
    });
  };

  const saveArtist = async (e) => {
    e.preventDefault();
    if (savingArtist) return;

    setSavingArtist(true);
    try {
      await axiosInstance.put("Umetnik/AzurirajMojUmetnikProfil", {
        biografija: artistForm.biografija,
        tehnika: artistForm.tehnika,
        stil: artistForm.stil,
        specijalizacija: artistForm.specijalizacija,
        grad: artistForm.grad,
        slikaUrl: artistForm.slikaUrl,
        isAvailable: artistForm.isAvailable,
      });

      alert("Profil umetnika sačuvan.");
      await fetchArtistProfile();
    } catch (err) {
      console.error(err);
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri čuvanju umetnik profila."
      );
    } finally {
      setSavingArtist(false);
    }
  };

  // ======================
  // PASSWORD
  // ======================
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

  // ======================
  // EMAIL
  // ======================
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
      await fetchUserProfile();
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

  // ======================
  // DELETE ACCOUNT
  // ======================
  const submitDelete = async (e) => {
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
          : "Greška pri brisanju naloga. (Ako imaš porudžbine/recenzije, moraš prvo obrisati ili napraviti cascade.)"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="umProfil">
      <h1 className="umProfil__title">Umetnik profil</h1>

      {/* USER CARD */}
      <div className="umProfil__card">
        <h2 className="umProfil__sectionTitle">Korisnički podaci</h2>

        {loadingProfile ? (
          <div className="umProfil__muted">Učitavanje...</div>
        ) : (
          <>
            <div className="umProfil__row">
              <div className="umProfil__label">Ime:</div>
              <div className="umProfil__value">
                {userProfile?.imeIPrezime || userProfile?.ImeIPrezime || "—"}
              </div>
            </div>
            <div className="umProfil__row">
              <div className="umProfil__label">Email:</div>
              <div className="umProfil__value">
                {userProfile?.email || userProfile?.Email || "—"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ARTIST EDIT */}
      <form className="umProfil__card umProfil__form" onSubmit={saveArtist}>
        <h2 className="umProfil__sectionTitle">Moj umetnik profil</h2>

        {loadingArtist ? (
          <div className="umProfil__muted">Učitavanje umetnik profila...</div>
        ) : (
          <>
            <div className="umProfil__imageRow">
              <button
                type="button"
                className="umProfil__btn umProfil__btnPrimary"
                onClick={uploadImage}
              >
                {artistForm.slikaUrl ? "Promeni sliku" : "Dodaj sliku"}
              </button>

              {preview ? <img className="umProfil__img" src={preview} alt="Preview" /> : null}
            </div>

            <textarea
              className="umProfil__textarea"
              name="biografija"
              placeholder="Biografija"
              value={artistForm.biografija}
              onChange={onChangeArtist}
              maxLength={500}
            />

            <div className="umProfil__grid">
              <input
                className="umProfil__input"
                name="tehnika"
                placeholder="Tehnika"
                value={artistForm.tehnika}
                onChange={onChangeArtist}
              />
              <input
                className="umProfil__input"
                name="stil"
                placeholder="Stil"
                value={artistForm.stil}
                onChange={onChangeArtist}
              />
              <input
                className="umProfil__input"
                name="specijalizacija"
                placeholder="Specijalizacija"
                value={artistForm.specijalizacija}
                onChange={onChangeArtist}
              />
              <input
                className="umProfil__input"
                name="grad"
                placeholder="Grad"
                value={artistForm.grad}
                onChange={onChangeArtist}
              />
            </div>

            <button
              className="umProfil__btn umProfil__btnPrimary"
              type="submit"
              disabled={savingArtist}
            >
              {savingArtist ? "Čuvam..." : "Sačuvaj umetnik profil"}
            </button>
          </>
        )}
      </form>

      {/* PASSWORD */}
      <form className="umProfil__card umProfil__form" onSubmit={submitPassword}>
        <h2 className="umProfil__sectionTitle">Promena lozinke</h2>

        <input
          className="umProfil__input"
          type="password"
          name="trenutnaLozinka"
          placeholder="Trenutna lozinka"
          value={passForm.trenutnaLozinka}
          onChange={onChangePass}
          required
        />
        <input
          className="umProfil__input"
          type="password"
          name="novaLozinka"
          placeholder="Nova lozinka"
          value={passForm.novaLozinka}
          onChange={onChangePass}
          required
        />
        <input
          className="umProfil__input"
          type="password"
          name="potvrdaNoveLozinke"
          placeholder="Potvrda nove lozinke"
          value={passForm.potvrdaNoveLozinke}
          onChange={onChangePass}
          required
        />

        <button className="umProfil__btn umProfil__btnPrimary" type="submit" disabled={savingPass}>
          {savingPass ? "Menjam..." : "Promeni lozinku"}
        </button>
      </form>

      {/* EMAIL */}
      <form className="umProfil__card umProfil__form" onSubmit={submitEmail}>
        <h2 className="umProfil__sectionTitle">Promena email-a</h2>

        <input
          className="umProfil__input"
          type="email"
          name="noviEmail"
          placeholder="Novi email"
          value={emailForm.noviEmail}
          onChange={onChangeEmail}
          required
        />
        <input
          className="umProfil__input"
          type="password"
          name="lozinka"
          placeholder="Potvrdi lozinkom"
          value={emailForm.lozinka}
          onChange={onChangeEmail}
          required
        />

        <button className="umProfil__btn umProfil__btnPrimary" type="submit" disabled={savingEmail}>
          {savingEmail ? "Menjam..." : "Promeni email"}
        </button>
      </form>

      {/* DELETE */}
      <form className="umProfil__card umProfil__cardDanger umProfil__form" onSubmit={submitDelete}>
        <h2 className="umProfil__dangerTitle">Obriši nalog</h2>
        <div className="umProfil__muted">Potvrdi lozinkom.</div>

        <input
          className="umProfil__input"
          type="password"
          placeholder="Lozinka"
          value={deletePass}
          onChange={(e) => setDeletePass(e.target.value)}
          required
        />

        <button className="umProfil__btn umProfil__btnDanger" type="submit" disabled={deleting}>
          {deleting ? "Brišem..." : "Obriši nalog"}
        </button>
      </form>
    </div>
  );
}
