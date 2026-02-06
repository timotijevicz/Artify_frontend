import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import axiosInstance from "../../../components/axios/axiosInstance";
import { STATUS } from "../../../utils/umetnickoDeloStatus";
import "./IzmeniDelo.css";

export default function IzmeniDelo() {
  const { isLoading, isUmetnik } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const routeId = Number(id);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    naziv: "",
    opis: "",
    tehnika: "",
    stil: "",
    dimenzije: "",
    slika: "",

    cena: "",
    pocetnaCenaAukcije: "",
    aukcijaZavrsava: "",

    naAukciji: false,
    status: STATUS.Dostupno,

    umetnikId: null,
  });

  // Ako ima fiksna cena -> resetuj aukcijska polja i naAukciji=false
  useEffect(() => {
    if (form.cena && String(form.cena).trim() !== "") {
      setForm((p) => ({
        ...p,
        naAukciji: false,
        pocetnaCenaAukcije: "",
        aukcijaZavrsava: "",
      }));
    }
  }, [form.cena]);

  useEffect(() => {
    if (!routeId || Number.isNaN(routeId)) {
      setPageLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setPageLoading(true);

        const res = await axiosInstance.get(`UmetnickoDelo/DeloPoID/${routeId}`);
        const d = res.data;

        if (cancelled) return;

        setForm({
          naziv: d?.naziv ?? "",
          opis: d?.opis ?? "",
          tehnika: d?.tehnika ?? "",
          stil: d?.stil ?? "",
          dimenzije: d?.dimenzije ?? "",
          slika: d?.slika ?? "",

          cena: d?.cena != null ? String(d.cena) : "",
          pocetnaCenaAukcije: d?.pocetnaCenaAukcije != null ? String(d.pocetnaCenaAukcije) : "",
          aukcijaZavrsava: d?.aukcijaZavrsava ? toDateTimeLocal(d.aukcijaZavrsava) : "",

          naAukciji: !!d?.naAukciji,
          status: d?.status != null ? Number(d.status) : STATUS.Dostupno,

          umetnikId: d?.umetnikId ?? null,
        });
      } catch (e) {
        const data = e?.response?.data;
        alert(typeof data === "string" ? data : "Greška pri učitavanju dela.");
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  if (isLoading || pageLoading) return <div>Učitavanje...</div>;

  if (!isUmetnik)
    return (
      <div className="izmeniDelo__wrap">
        <div className="izmeniDelo__card">
          <h2>Nemaš pristup ovoj stranici.</h2>
          <Link className="izmeniDelo__link" to="/login">
            Prijava
          </Link>
        </div>
      </div>
    );

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, slika: reader.result }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.naziv.trim()) return "Naziv je obavezan.";
    if (!form.opis.trim()) return "Opis je obavezan.";
    if (!form.slika) return "Slika je obavezna.";
    if (!form.tehnika.trim()) return "Tehnika je obavezna.";
    if (!form.stil.trim()) return "Stil je obavezan.";
    if (!form.dimenzije.trim()) return "Dimenzije su obavezne.";

    const hasCena = form.cena && String(form.cena).trim() !== "";
    if (hasCena) {
      const c = Number(form.cena);
      if (Number.isNaN(c)) return "Cena mora biti broj.";
    } else if (form.naAukciji) {
      const p = Number(form.pocetnaCenaAukcije);
      if (Number.isNaN(p)) return "Početna cena aukcije mora biti broj.";
      if (!form.aukcijaZavrsava) return "Unesi datum završetka aukcije.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const msg = validate();
    if (msg) {
      alert(msg);
      return;
    }

    const hasCena = form.cena && String(form.cena).trim() !== "";

    const dto = {
      UmetnickoDeloId: routeId,

      Naziv: form.naziv.trim(),
      Opis: form.opis.trim(),
      Slika: form.slika,

      Tehnika: form.tehnika.trim(),
      Stil: form.stil.trim(),
      Dimenzije: form.dimenzije.trim(),

      Cena: hasCena ? Number(form.cena) : null,
      PocetnaCenaAukcije: !hasCena && form.naAukciji ? Number(form.pocetnaCenaAukcije) : null,
      AukcijaZavrsava:
        !hasCena && form.naAukciji ? new Date(form.aukcijaZavrsava).toISOString() : null,

      NaAukciji: !hasCena && form.naAukciji,

      Status: Number(form.status),

      // ako DTO traži umetnikId (ako ne, možeš obrisati)
      UmetnikId: form.umetnikId,
    };

    try {
      setSaving(true);
      await axiosInstance.put(`UmetnickoDelo/AzurirajDelo/${routeId}`, dto);
      navigate("/umetnik/moji-radovi");
    } catch (e) {
      const data = e?.response?.data;
      console.log("UPDATE STATUS:", e?.response?.status);
      console.log("UPDATE DATA:", data);

      if (data?.errors) {
        const msgs = Object.entries(data.errors)
          .flatMap(([field, arr]) => arr.map((m) => `${field}: ${m}`))
          .join("\n");
        alert(msgs);
        return;
      }

      alert(typeof data === "string" ? data : "Greška pri čuvanju izmena.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="izmeniDelo__wrap">
      <form className="izmeniDelo__form" onSubmit={onSubmit}>
        <div className="izmeniDelo__header">
          <h2>Izmeni delo</h2>
          <p>Obavezna polja su označena zvezdicom.</p>
        </div>

        <div className="izmeniDelo__grid">
          <div className="izmeniDelo__field">
            <label>Naziv *</label>
            <input name="naziv" value={form.naziv} onChange={onChange} />
          </div>

          <div className="izmeniDelo__field">
            <label>Tehnika *</label>
            <input name="tehnika" value={form.tehnika} onChange={onChange} />
          </div>

          <div className="izmeniDelo__field">
            <label>Stil *</label>
            <input name="stil" value={form.stil} onChange={onChange} />
          </div>

          <div className="izmeniDelo__field">
            <label>Dimenzije *</label>
            <input name="dimenzije" value={form.dimenzije} onChange={onChange} />
          </div>

          <div className="izmeniDelo__field izmeniDelo__field--full">
            <label>Opis *</label>
            <textarea name="opis" value={form.opis} onChange={onChange} />
          </div>

          <div className="izmeniDelo__field izmeniDelo__field--full">
            <label>Slika *</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {form.slika ? (
              <div className="izmeniDelo__preview">
                <img src={form.slika} alt="Preview" />
              </div>
            ) : null}
          </div>

          <div className="izmeniDelo__field">
            <label>Cena (fiksna prodaja)</label>
            <input name="cena" value={form.cena} onChange={onChange} placeholder="npr. 1200" />
          </div>

          <div className="izmeniDelo__field izmeniDelo__field--full">
            <label className="izmeniDelo__check">
              <input
                type="checkbox"
                name="naAukciji"
                checked={form.naAukciji && !(form.cena && String(form.cena).trim() !== "")}
                onChange={onChange}
                disabled={!!(form.cena && String(form.cena).trim() !== "")}
              />
              Aukcija
            </label>
            <small className="izmeniDelo__hint">
              Ako uneseš cenu, aukcija se automatski isključuje.
            </small>
          </div>

          {form.naAukciji && !(form.cena && String(form.cena).trim() !== "") && (
            <>
              <div className="izmeniDelo__field">
                <label>Početna cena aukcije *</label>
                <input
                  name="pocetnaCenaAukcije"
                  value={form.pocetnaCenaAukcije}
                  onChange={onChange}
                />
              </div>

              <div className="izmeniDelo__field">
                <label>Aukcija završava *</label>
                <input
                  type="datetime-local"
                  name="aukcijaZavrsava"
                  value={form.aukcijaZavrsava}
                  onChange={onChange}
                />
              </div>
            </>
          )}

          <div className="izmeniDelo__field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange}>
              <option value={STATUS.Dostupno}>Dostupno</option>
              <option value={STATUS.Prodato}>Prodato</option>
              <option value={STATUS.Uklonjeno}>Uklonjeno</option>
            </select>
          </div>
        </div>

        <div className="izmeniDelo__actions">
          <button className="izmeniDelo__btn" type="button" onClick={() => navigate("/umetnik/moji-radovi")} disabled={saving}>
            Nazad
          </button>
          <button className="izmeniDelo__btn izmeniDelo__btn--primary" type="submit" disabled={saving}>
            {saving ? "Čuvam..." : "Sačuvaj izmene"}
          </button>
        </div>
      </form>
    </div>
  );
}

function toDateTimeLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
