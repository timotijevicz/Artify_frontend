import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Footer/Footer';
import About from './pages/about/About';
import Login from './pages/Login/Login';
import RegisterUser from './pages/Register/RegisterUser';
import RegisterArtist from './pages/Register/RegisterArtist';
import Home from './pages/Home/Home';
import Galerija from './pages/Galerija/Galerija';
import Umetnici from './pages/Artist/Artist';
import Favoriti from "./pages/Favoriti/Favoriti";
import MojiRadovi from "./pages/ArtistPage/MojiRadovi/MojiRadovi";
import DodajDelo from "./pages/ArtistPage/DodajDelo/DodajDelo";
import IzmeniDelo from "./pages/ArtistPage/IzemeniDelo/IzmeniDelo";
import ArtworkDetails from "./pages/ArtworkDetails/ArtworkDetails";
import MojePorudzbine from "./pages/MojePorudzbine/MojePorudzbine";
import ArtistProfile from "./pages/PogledajUmetnika/ArtistProfil";
import KupacProfil from "./pages/Profili/Kupac/KupacProfil";
import UmetnikProfil from './pages/Profili/Umetnik/UmetnikProfil';
import AdminProfil from './pages/Profili/Admin/AdminProfil';
import AdminPanel from './pages/AdminPages/AdminPanel/AdminPanel';
import AdminNotifikacije from './pages/AdminPages/Notifikacije/Notifikacije'

function App() {
  
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registracija" element={<RegisterUser />} />
          <Route path="/registracija-umetnik" element={<RegisterArtist />} />
          <Route path="/home" element={<Home />} />
          <Route path="/galerija" element={<Galerija />} />
          <Route path="/umetnici" element={<Umetnici />} />
          <Route path="/favoriti" element={<Favoriti />} />
          <Route path="/umetnici/:id" element={<ArtistProfile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/umetnik/moji-radovi" element={<MojiRadovi />} />
        <Route path="/umetnik/dodaj-delo" element={<DodajDelo />} />
        <Route path="/umetnik/izmeni-delo/:id" element={<IzmeniDelo />} />
        <Route path="/artwork/:id" element={<ArtworkDetails />} />
        <Route path="/moje-porudzbine" element={<MojePorudzbine />} />
        <Route path="/delo/:id" element={<ArtworkDetails />} />
        <Route path="/kupac/profil" element={<KupacProfil />} />
        <Route path="/umetnik/profil" element={<UmetnikProfil />} />
        <Route path="/admin/profil" element={<AdminProfil />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/notifikacije" element={<AdminNotifikacije />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
