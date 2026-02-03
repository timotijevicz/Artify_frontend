import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios/axiosInstance";
import "./Register.css";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    imeIPrezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

    // hvata string, {message}, i ModelState objekte
  const extractErrorMessage = (err) => {
    const data = err?.response?.data;

    // backend vrati string
    if (typeof data === "string") return data;

    // backend vrati { message: "..." }
    if (data?.message && typeof data.message === "string") return data.message;

    // backend vrati ModelState: { Field: ["err1", ...], ... }
    if (data && typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const val = data[firstKey];
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === "string") return val;
      }
    }

    return "Greška prilikom registracije.";
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
      // ✅ DTO 1:1 sa backendom
      const payload = {
        ImeIPrezime: formData.imeIPrezime,
        Email: formData.email,
        Lozinka: formData.lozinka,
        PotvrdaLozinke: formData.potvrdaLozinke,
      };

      await axiosInstance.post("/Korisnik/RegistracijaKorisnika", payload);

      navigate("/login");
    } catch (err) {
      setError(extractErrorMessage(err));
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
            <h1 className="artify-auth-title">Registracija</h1>
            <p className="artify-auth-subtitle">
              Kreiraj nalog i istražuj umetnine na Artify.
            </p>
          </div>

          <form className="artify-auth-form" onSubmit={onSubmit}>
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

            <label className="artify-field">
              <span className="artify-label">Lozinka</span>
              <input
                className="artify-input"
                type="password"
                name="lozinka"
                placeholder="Min 6 karaktera"
                required
                minLength={6}
                value={formData.lozinka}
                onChange={onChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            <label className="artify-field">
              <span className="artify-label">Potvrda lozinke</span>
              <input
                className="artify-input"
                type="password"
                name="potvrdaLozinke"
                placeholder="Ponovi lozinku"
                required
                minLength={6}
                value={formData.potvrdaLozinke}
                onChange={onChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            {error ? <div className="artify-error">{error}</div> : null}

            <button className="artify-btn" type="submit" disabled={loading}>
              {loading ? "Kreiram nalog..." : "Registruj se"}
              <span className="artify-btn-glow" />
            </button>

            <div className="artify-auth-footnote">
              Već imaš nalog? <Link to="/login">Uloguj se</Link>
            </div>

            <div className="artify-auth-switch">
              Ako želite da se registrujete kao umetnik,{" "}
              <Link to="/registracija-umetnik">kliknite ovde →</Link>
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className="artify-auth-right" aria-hidden="true">
          <div
            className="artify-auth-image"
            style={{ backgroundImage: `url(/images/artify-register.jpg)` }}
          />
          <div className="artify-auth-overlay">
            <div className="artify-auth-badge">
              <span className="dot" />
              Artify • community
            </div>
            <div className="artify-auth-quote">
              “Umetnost počinje tamo gde reči staju.”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
