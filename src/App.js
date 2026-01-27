import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import Card from './components/Card/Card';
import slika1 from './components/images/Starry_Night.jpg';
import ONama from './pages/about/about';


function App() {
  
  const kartice = [
    {
      slikaUrl : slika1,
      naziv: "Zvezdana Noć",
      opis: "Čuveno remek-delo Vinsenta van Goga.",
      cena: 82000000,
      staraCena: 85000000,
      datumPostavljanja: "2024-06-10",
      tehnika: "Ulje na platnu",
      kategorija: "Pejzaž",
      stil: "Postimpresionizam",
      dimenzije: "73.7cm × 92.1cm",
      status: "Dostupno",
      umetnik: "Vinsent van Gog",
    },
    {
      slikaUrl: "https://example.com/slika2.jpg",
      naziv: "Krik",
      opis: "Jedno od najslavnijih ekspresionističkih dela.",
      cena: 119900000,
      staraCena: 125000000,
      datumPostavljanja: "2024-07-15",
      tehnika: "Tempera na kartonu",
      kategorija: "Ekspresionizam",
      stil: "Ekspresionizam",
      dimenzije: "91cm × 73.5cm",
      status: "Rezervisano",
      umetnik: "Edvard Munk",
    },
    {
      slikaUrl: "https://example.com/slika3.jpg",
      naziv: "Devojka sa bisernom minđušom",
      opis: "Misteriozan portret sa predivnim osvetljenjem.",
      cena: "N/A",
      datumPostavljanja: "2024-08-20",
      tehnika: "Ulje na platnu",
      kategorija: "Portret",
      stil: "Barok",
      dimenzije: "44.5cm × 39cm",
      status: "Prodato",
      umetnik: "Johanes Vermer",
    },
    {
      slikaUrl: "https://example.com/slika4.jpg",
      naziv: "Polje Maka",
      opis: "Prelep pejzaž sa snažnim bojama.",
      cena: 3200000,
      staraCena: 3500000,
      datumPostavljanja: "2024-09-11",
      tehnika: "Ulje na platnu",
      kategorija: "Pejzaž",
      stil: "Impresionizam",
      dimenzije: "92.1cm × 73.7cm",
      status: "Dostupno",
      umetnik: "Klara Breen",
    },
  ];



  return (
    <div className="App">
      <Router>
        <Navbar />
        {/* Definišemo rute */}
        <Routes>
          {/* Početna stranica sa karticama */}
          <Route
            path="/"
            element={
              <div className="card-container">
                {kartice.map((kartica, index) => (
                  <Card key={index} {...kartica} />
                ))}
              </div>
            }
          />
          <Route path="/ONama" element={<ONama />} />
        </Routes>
        
      </Router>
    </div>
  );


  
}



export default App;
