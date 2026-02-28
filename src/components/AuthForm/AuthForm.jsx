import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

export default function ArtifyAuthForm({
  title,
  subtitle,
  fields = [],
  submitButtonText = "Submit",
  onSubmit,
  error,
  loading,
  imageSrc,
}) {
  const initialState = useMemo(() => {
    const obj = {};
    fields.forEach((f) => (obj[f.name] = ""));
    return obj;
  }, [fields]);

  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false); // ✅ DODATO

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="artify-auth-shell">
      <div className="artify-auth-card">
        <div className="artify-auth-left">
          <div className="artify-auth-header">
            <h1 className="artify-auth-title">{title}</h1>
            {subtitle ? <p className="artify-auth-subtitle">{subtitle}</p> : null}
          </div>

          <form className="artify-auth-form" onSubmit={handleSubmit}>
            {fields.map((f) => (
              <label key={f.name} className="artify-field">
                <span className="artify-label">{f.label}</span>

                {/* ✅ NE DIRAMO FORMU, samo ako je password ubacimo wrapper + dugme */}
                {f.type === "password" ? (
                  <div style={{ position: "relative" }}>
                    <input
                      className="artify-input"
                      name={f.name}
                      type={showPassword ? "text" : "password"} // ✅
                      placeholder={f.placeholder}
                      required={f.required}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={loading}
                      aria-label={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                      title={showPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                      style={{
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
                      }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                ) : (
                  <input
                    className="artify-input"
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    required={f.required}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete={f.type === "password" ? "current-password" : "email"}
                  />
                )}
              </label>
            ))}

            {error ? <div className="artify-error">{error}</div> : null}

            <button
              className="artify-btn"
              type="submit"
              disabled={loading}
              aria-busy={loading ? "true" : "false"}
            >
              {submitButtonText}
              <span className="artify-btn-glow" />
            </button>

            <div className="artify-auth-switch">
              Nemate nalog? <Link to="/registracija">Registracija korisnika →</Link>
            </div>
          </form>
        </div>

        <div className="artify-auth-right" aria-hidden="true">
          <div
            className="artify-auth-image"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div className="artify-auth-overlay">
            <div className="artify-auth-badge">
              <span className="dot" />
              Artify • curated art
            </div>
            <div className="artify-auth-quote">
              “Umetnost ne traži objašnjenje — traži prisustvo.”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}