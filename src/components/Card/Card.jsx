import React, { useState } from "react";
import "./Card.css";

function Card({
  slikaUrl,
  naziv = "Nepoznato delo",
  opis,
  cena = "N/A",
  staraCena,
  datumPostavljanja = "Nepoznat datum",
  tehnika = "Nepoznata tehnika",
  kategorija = "Nepoznata kategorija",
  stil = "Nepoznati stil",
  dimenzije = "Nepoznate dimenzije",
  status = "Dostupno",
  umetnik = "Nepoznati umetnik",
}) {
  const [omiljeno, setOmiljeno] = useState(false);
  const [recenzije] = useState([
    { korisnik: "Ana", tekst: "Predivna slika!", ocena: 5 },
    { korisnik: "Marko", tekst: "Vrlo zanimljivo delo.", ocena: 4 },
  ]);

  const [showModal, setShowModal] = useState(false); // Modal state

  const handleUmetnikClick = () => {
    setShowModal(true); // Otvori modal kada klikneš na umetnika
  };

  const closeModal = () => {
    setShowModal(false); // Zatvori modal
  };

  return (
    <div className="card">
      {/* Slika umetnickog dela */}
      <div className="image-container">
        <img src={slikaUrl} alt={naziv} />

        {/* Dugme za omiljene */}
        <button
          className={`like-button ${omiljeno ? "liked" : ""}`}
          onClick={() => setOmiljeno(!omiljeno)}
        >
          <i className={omiljeno ? "fas fa-heart" : "far fa-heart"}></i>
        </button>
      </div>

      {/* Informacije o umetnickom delu */}
      <div className="card-info">
        <h3>
          <a href="#" onClick={handleUmetnikClick} className="artist-link">
            {umetnik}
          </a>
          <span className="text-gray-500">ⓘ</span>
        </h3>
        <p className="italic" >{naziv.toUpperCase()}</p>
        <p>{tehnika} | {dimenzije}</p>
        <p>Kategorija: {kategorija} | Stil: {stil}</p>
        
        {/* Status umetničkog dela */}
        <p
          className={`text-md font-semibold mt-2 ${
            status === "Dostupno"
            ? "status-dostupno"
            : status === "Rezervisano"
            ? "status-rezervisano"
            : status === "Prodato"
            ? "status-prodato"
            : "text-gray-400"
          }`} 
        >
        {status}
        </p>

        {/* Prikaz promenjene cene */}
        <p className="card-price">
          {staraCena && (
            <span className="old-price">
              <span className="line-through">€{staraCena}</span>{" "}
            </span>
          )}
          €{cena}
        </p>

        <p className="text-sm text-gray-400">Postavljeno: {datumPostavljanja}</p>
      </div>

      {/* Sekcija za recenzije */}
      <div className="mt-4 border-t pt-2">
        <h4 className="text-md font-semibold">Recenzije:</h4>
        {recenzije.length > 0 ? (
          recenzije.map((rec, index) => (
            <p key={index} className="text-sm text-gray-700">
              <strong>{rec.korisnik}:</strong> {rec.tekst} ({rec.ocena}/5 ★)
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-400">Još nema recenzija.</p>
        )}
      </div>

      {/* Modal za umetnika */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>O umetniku {umetnik}</h2>
            <p>Ovde mozete uneti informacije o umetniku, biografija i to
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;

