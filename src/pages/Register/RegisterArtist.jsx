// RegisterArtist.jsx — ista forma, samo show/hide za lozinku i potvrdu u gridu
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import "./Register.css";

const extractError = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.title && typeof data.title === "string") return data.title;

  // ModelState: { Field: ["msg"] }
  if (data && typeof data === "object") {
    const k = Object.keys(data)[0];
    const v = data[k];
    if (Array.isArray(v) && v[0]) return v[0];
    if (typeof v === "string") return v;
  }

  return "Greška prilikom registracije umetnika.";
};

export default function RegisterArtist() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false); // ✅ DODATO
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ DODATO

  const [formData, setFormData] = useState({
    imeIPrezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",

    biografija: "",
    tehnika: "",
    stil: "",
    specijalizacija: "",
    grad: "",
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

      // ✅ bez početnog "/" (da ne pravi probleme ako ti je baseURL .../api)
      await axiosInstance.post("Korisnik/RegistracijaUmetnika", payload);

      navigate("/login");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleBtnStyle = {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    fontSize: 18,
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
                autoComplete="email"
              />
            </label>

            <label className="artify-field">
              <span className="artify-label">Lozinka</span>

              <div className="artify-input-wrap">
                <input
                  className="artify-input artify-input--withToggle"
                  type={showPassword ? "text" : "password"}
                  name="lozinka"
                  placeholder="Min 8, veliko+malo slovo i broj"
                  required
                  minLength={8}
                  value={formData.lozinka}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="artify-toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                  title={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <label className="artify-field">
              <span className="artify-label">Potvrda</span>

              <div className="artify-input-wrap">
                <input
                  className="artify-input artify-input--withToggle"
                  type={showConfirmPassword ? "text" : "password"}
                  name="potvrdaLozinke"
                  placeholder="Ponovi lozinku"
                  required
                  minLength={8}
                  value={formData.potvrdaLozinke}
                  onChange={onChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="artify-toggle-password"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                  title={showConfirmPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

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
              Želite običan nalog?{" "}
              <Link to="/registracija">Registracija korisnika →</Link>
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
            <div className="artify-auth-quote">“Stil je potpis — neka bude tvoj.”</div>
          </div>
        </div>
      </div>
    </div>
  );
}