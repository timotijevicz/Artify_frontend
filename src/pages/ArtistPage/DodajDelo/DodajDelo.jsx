import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import axiosInstance from "../../../components/axios/axiosInstance";
import "./DodajDelo.css";

export default function DodajDelo() {
  const { isLoading, isUmetnik } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    naziv: "",
    opis: "",
    tehnika: "",
    stil: "",
    dimenzije: "",
    cena: "",
    pocetnaCenaAukcije: "",
    aukcijaZavrsava: "",
  });

  const [slikaUrl, setSlikaUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  if (isLoading) return <div>Učitavanje...</div>;
  if (!isUmetnik) return <div>Nemaš pristup ovoj stranici.</div>;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const openCloudinaryWidget = () => {
    // Cloudinary widget je globalan (iz index.html)
    if (!window.cloudinary) {
      alert("Cloudinary widget nije učitan. Proveri public/index.html script.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dfaxxpssz",
        uploadPreset: "artify_unsigned",
        folder: "artify",
        sources: ["local"],
        multiple: false,
        resourceType: "image",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        maxFileSize: 8 * 1024 * 1024, // 8MB
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary widget error:", error);
          alert("Greška pri upload-u slike.");
          return;
        }

        if (result && result.event === "success") {
          const url = result.info.secure_url;
          setSlikaUrl(url);
          setPreview(url);
        }
      }
    );

    widget.open();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!slikaUrl) {
      alert("Molim te prvo dodaj sliku.");
      return;
    }

    setSaving(true);
    try {
      const payloadBase = {
        naziv: form.naziv,
        opis: form.opis,
        tehnika: form.tehnika,
        stil: form.stil,
        dimenzije: form.dimenzije,
        slika: slikaUrl, // ✅ Cloudinary URL ide u bazu
      };

      // Ako ima cena => fiksna cena, inače aukcija
      if (form.cena && String(form.cena).trim() !== "") {
        const payloadFixed = {
          ...payloadBase,
          cena: Number(form.cena),
        };

        await axiosInstance.post("UmetnickoDelo/DodajNovoDelo", payloadFixed);
      } else {
        if (!form.pocetnaCenaAukcije || !form.aukcijaZavrsava) {
          alert("Unesi početnu cenu i datum završetka aukcije.");
          setSaving(false);
          return;
        }

        const payloadAuction = {
          ...payloadBase,
          pocetnaCenaAukcije: Number(form.pocetnaCenaAukcije),
          aukcijaZavrsava: new Date(form.aukcijaZavrsava).toISOString(),
        };

        await axiosInstance.post(
          "UmetnickoDelo/DodajNovoDeloZaAukciju",
          payloadAuction
        );
      }

      navigate("/umetnik/moji-radovi");
    } catch (err) {
      console.error(err);
      console.log("BACKEND ERRORS:", err?.response?.data?.errors);
      alert(JSON.stringify(err?.response?.data?.errors, null, 2))
      alert(
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Greška pri čuvanju dela."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="addWork">
      <h1 className="addWork__title">Dodaj delo</h1>

      <form className="addWork__form" onSubmit={onSubmit}>
        <input
          name="naziv"
          placeholder="Naziv"
          value={form.naziv}
          onChange={onChange}
          required
        />

        <textarea
          name="opis"
          placeholder="Opis"
          value={form.opis}
          onChange={onChange}
        />

        <button type="button" onClick={openCloudinaryWidget}>
          {slikaUrl ? "Promeni sliku" : "Dodaj sliku"}
        </button>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: 240, borderRadius: 8, marginTop: 8 }}
          />
        )}

        <input
          name="tehnika"
          placeholder="Tehnika"
          value={form.tehnika}
          onChange={onChange}
        />

        <input
          name="stil"
          placeholder="Stil"
          value={form.stil}
          onChange={onChange}
        />

        <input
          name="dimenzije"
          placeholder="Dimenzije nxn"
          value={form.dimenzije}
          onChange={onChange}
        />

        <input
          name="cena"
          placeholder="Cena (opciono)"
          value={form.cena}
          onChange={onChange}
        />

        {!form.cena && (
          <>
            <input
              name="pocetnaCenaAukcije"
              placeholder="Početna cena aukcije"
              value={form.pocetnaCenaAukcije}
              onChange={onChange}
              required
            />

            <input
              type="datetime-local"
              name="aukcijaZavrsava"
              value={form.aukcijaZavrsava}
              onChange={onChange}
              required
            />
          </>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Čuvam..." : "Sačuvaj"}
        </button>
      </form>
    </div>
  );
}
