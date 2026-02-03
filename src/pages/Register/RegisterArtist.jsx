import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../components/axios/axiosInstance";
import "./Register.css";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export default function RegisterArtist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SVE za korisnika + dodatno za umetnika
  const [formData, setFormData] = useState({
    imeIPrezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",

    biografija: "",
    tehnika: "",
    stil: "",
    specijalizacija: "",
    slikaUrl: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.lozinka !== formData.potvrdaLozinke) {
      setError("Lozinka i potvrda lozinke se ne poklapaju.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ImeIPrezime: formData.imeIPrezime,
        Email: formData.email,
        Lozinka: formData.lozinka,
        PotvrdaLozinke: formData.potvrdaLozinke,

        Biografija: formData.biografija || null,
        Tehnika: formData.tehnika || null,
        Stil: formData.stil || null,
        Specijalizacija: formData.specijalizacija || null,
        Grad: formData.grad || null,
        SlikaUrl: formData.slikaUrl || null,
      };

      await axiosInstance.post("/Korisnik/RegistracijaUmetnika", payload);

      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.message ||
        (typeof data === "string" ? data : null) ||
        (data && typeof data === "object"
          ? (() => {
              const k = Object.keys(data)[0];
              const v = data[k];
              return Array.isArray(v) ? v[0] : JSON.stringify(v);
            })()
          : null) ||
        "Greška prilikom registracije umetnika.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="artify-auth-page">
      <div className="artify-auth-card">
        {/* LEFT */}
        <div className="artify-auth-left">
          <div className="artify-auth-header">
            <h1 className="artify-auth-title">Registracija umetnika</h1>
            <p className="artify-auth-subtitle">
              Kreiraj nalog i predstavi svoj umetnički identitet.
            </p>
          </div>

          <form className="artify-auth-form" onSubmit={onSubmit}>
            {/* Korisnik deo */}
            <div className="artify-section-title">Nalog</div>

            <label className="artify-field">
              <span className="artify-label">Ime i prezime</span>
              <input
                className="artify-input"
                type="text"
                name="imeIPrezime"
                placeholder="Unesi ime i prezime"
                required
                value={formData.imeIPrezime}
                onChange={onChange}
                disabled={loading}
              />
            </label>

            <label className="artify-field">
              <span className="artify-label">Email</span>
              <input
                className="artify-input"
                type="email"
                name="email"
                placeholder="Unesi email"
                required
                value={formData.email}
                onChange={onChange}
                disabled={loading}
              />
            </label>

            <div className="artify-grid2">
              <label className="artify-field">
                <span className="artify-label">Lozinka</span>
                <input
                  className="artify-input"
                  type="password"
                  name="lozinka"
                  placeholder="Min 6"
                  required
                  minLength={6}
                  value={formData.lozinka}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </label>

              <label className="artify-field">
                <span className="artify-label">Potvrda</span>
                <input
                  className="artify-input"
                  type="password"
                  name="potvrdaLozinke"
                  placeholder="Ponovi"
                  required
                  minLength={6}
                  value={formData.potvrdaLozinke}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </label>
            </div>

            {/* Umetnik deo */}
            <div className="artify-section-title">Umetnički profil</div>

            <label className="artify-field">
              <span className="artify-label">Biografija</span>
              <textarea
                className="artify-textarea"
                name="biografija"
                placeholder="Do 500 karaktera"
                maxLength={500}
                value={formData.biografija}
                onChange={onChange}
                disabled={loading}
              />
            </label>

            <div className="artify-grid2">
              <label className="artify-field">
                <span className="artify-label">Tehnika</span>
                <input
                  className="artify-input"
                  type="text"
                  name="tehnika"
                  placeholder="npr. ulje na platnu"
                  value={formData.tehnika}
                  onChange={onChange}
                  disabled={loading}
                />
              </label>

              <label className="artify-field">
                <span className="artify-label">Stil</span>
                <input
                  className="artify-input"
                  type="text"
                  name="stil"
                  placeholder="npr. apstraktni"
                  value={formData.stil}
                  onChange={onChange}
                  disabled={loading}
                />
              </label>
            </div>

            <label className="artify-field">
              <span className="artify-label">Specijalizacija</span>
              <input
                className="artify-input"
                type="text"
                name="specijalizacija"
                placeholder="npr. portreti, pejzaži..."
                value={formData.specijalizacija}
                onChange={onChange}
                disabled={loading}
              />
            </label>

            <label className="artify-field">
              <span className="artify-label">Grad</span>
              <input
                className="artify-input"
                type="text"
                name="grad"
                placeholder="npr. Novi Pazar..."
                value={formData.grad}
                onChange={onChange}
                disabled={loading}
              />
            </label>

            {error ? <div className="artify-error">{error}</div> : null}

            <button className="artify-btn" type="submit" disabled={loading}>
              {loading ? "Kreiram profil..." : "Registruj umetnika"}
              <span className="artify-btn-glow" />
            </button>

            <div className="artify-auth-switch">
              Želite običan nalog? <Link to="/registracija">Registracija korisnika →</Link>
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className="artify-auth-right" aria-hidden="true">
          <div
            className="artify-auth-image"
            style={{ backgroundImage: `url(/images/artify-artist.jpg)` }}
          />
          <div className="artify-auth-overlay">
            <div className="artify-auth-badge">
              <span className="dot" />
              Artify • creators
            </div>
            <div className="artify-auth-quote">
              “Stil je potpis — neka bude tvoj.”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
