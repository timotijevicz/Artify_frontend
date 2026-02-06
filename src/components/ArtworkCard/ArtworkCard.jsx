import React from "react";
import "./ArtworkCard.css";
import { isRemoved } from "../../utils/umetnickoDeloStatus";

export default function ArtworkCard({ delo, onDelete, onDeactivate, onEdit }) {
  const isAuction = !!delo?.naAukciji;
  const removed = isRemoved(delo?.status);

  const priceLine = isAuction
    ? `Aukcija • Trenutna: ${delo?.trenutnaCenaAukcije ?? delo?.pocetnaCenaAukcije ?? "-"}`
    : `Cena: ${delo?.cena ?? "-"}`;

  return (
    <div className={`artworkCard ${removed ? "artworkCard--removed" : ""}`}>
      <div className="artworkCard__imageWrap">
        {delo?.slika ? (
          <img className="artworkCard__image" src={delo.slika} alt={delo?.naziv || "delo"} />
        ) : (
          <div className="artworkCard__imagePlaceholder">Nema slike</div>
        )}
      </div>

      <div className="artworkCard__content">
        <div className="artworkCard__top">
          <h3 className="artworkCard__title">{delo?.naziv}</h3>
          <span className={`artworkCard__badge ${isAuction ? "isAuction" : "isSale"}`}>
            {isAuction ? "Aukcija" : "Prodaja"}
          </span>
        </div>

        {delo?.opis ? <p className="artworkCard__desc">{delo.opis}</p> : null}

        <div className="artworkCard__meta">
          <div><b>Tehnika:</b> {delo?.tehnika ?? "-"}</div>
          <div><b>Stil:</b> {delo?.stil ?? "-"}</div>
          <div><b>Dimenzije:</b> {delo?.dimenzije ?? "-"}</div>
          <div><b>Status:</b> {delo?.status ?? "-"}</div>
          <div className="artworkCard__price"><b>{priceLine}</b></div>
        </div>

        <div className="artworkCard__actions">
          <button className="btn btn--ghost" onClick={() => onEdit(delo)}>Ažuriraj</button>

          <button
            className="btn btn--warn"
            onClick={() => onDeactivate(delo)}
            disabled={removed}
            title={removed ? "Delo je već uklonjeno" : "Deaktiviraj (Uklonjeno)"}
          >
            Deaktiviraj
          </button>

          <button className="btn btn--danger" onClick={() => onDelete(delo)}>Obriši</button>
        </div>
      </div>
    </div>
  );
}
