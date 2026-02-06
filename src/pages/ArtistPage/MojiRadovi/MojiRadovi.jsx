import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import ArtworkCard from "../../../components/ArtworkCard/ArtworkCard";
import { STATUS, isRemoved } from "../../../utils/umetnickoDeloStatus";
import axiosInstance from "../../../components/axios/axiosInstance";
import "./MojiRadovi.css";

export default function MojiRadovi() {
  const { isUmetnik, isLoading } = useContext(AppContext);
  const navigate = useNavigate();

  const [dela, setDela] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isUmetnik) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await axiosInstance.get("UmetnickoDelo/MojaDela");
        setDela(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError(
          typeof e?.response?.data === "string"
            ? e.response.data
            : e?.response?.data?.title || "Greška pri učitavanju radova."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isUmetnik]);

  if (isLoading || loading) return <div>Učitavanje...</div>;
  if (!isUmetnik) return <div>Nemaš pristup ovoj stranici.</div>;
  if (error) return <div className="errorBox">{error}</div>;

  const onEdit = (d) => navigate(`/umetnik/izmeni-delo/${d.umetnickoDeloId}`);

  const onDelete = async (d) => {
    if (!window.confirm(`Obrisati "${d.naziv}"?`)) return;

    try {
      await axiosInstance.delete(`UmetnickoDelo/ObrisiDelo/${d.umetnickoDeloId}`);
      setDela((prev) => prev.filter((x) => x.umetnickoDeloId !== d.umetnickoDeloId));
    } catch (e) {
      const data = e?.response?.data;
      alert(typeof data === "string" ? data : "Greška pri brisanju dela.");
    }
  };

  const onDeactivate = async (d) => {
    if (isRemoved(d.status)) return;
    if (!window.confirm(`Deaktivirati "${d.naziv}"?`)) return;

    const id = d.umetnickoDeloId;

    try {
      // ✅ NOVI ENDPOINT (bez DTO, nema validacije statusa)
      await axiosInstance.put(`UmetnickoDelo/DeaktivirajDelo/${id}`);

      // UI update (status = 2)
      setDela((prev) =>
        prev.map((x) => (x.umetnickoDeloId === id ? { ...x, status: STATUS.Uklonjeno } : x))
      );
    } catch (e) {
      const data = e?.response?.data;
      console.log("DEACTIVATE STATUS:", e?.response?.status);
      console.log("DEACTIVATE DATA:", data);

      if (data?.errors) {
        const msgs = Object.entries(data.errors)
          .flatMap(([field, arr]) => arr.map((m) => `${field}: ${m}`))
          .join("\n");
        alert(msgs);
        return;
      }

      alert(typeof data === "string" ? data : "Greška pri deaktivaciji dela.");
    }
  };

  return (
    <div className="myWorks">
      <div className="myWorks__topbar">
        <h2>Moji radovi</h2>

        <button className="btnPrimary" onClick={() => navigate("/umetnik/dodaj-delo")}>
          + Dodaj novo delo
        </button>
      </div>

      {dela.length === 0 && <div className="infoBox">Nemaš još nijedno delo.</div>}

      <div className="myWorks__list">
        {dela.map((d) => (
          <ArtworkCard
            key={d.umetnickoDeloId}
            delo={d}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeactivate={onDeactivate}
          />
        ))}
      </div>
    </div>
  );
}
