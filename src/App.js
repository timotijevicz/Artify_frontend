import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Footer/Footer';
import About from './pages/About/About';
import Login from './pages/Login/Login';
import RegisterUser from './pages/Register/RegisterUser';
import RegisterArtist from './pages/Register/RegisterArtist';
import Home from './pages/Home/Home';
import Galerija from './pages/Galerija/Galerija';
import Umetnici from './pages/Artist/Artist';
import Favoriti from "./pages/Favoriti/Favoriti";


function App() {
  
  return (
    <div className="App">
      <Router>
        <Navbar />
        {/* Definišemo rute */}
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registracija" element={<RegisterUser />} />
          <Route path="/registracija-umetnik" element={<RegisterArtist />} />
          <Route path="/home" element={<Home />} />
          <Route path="/galerija" element={<Galerija />} />
          <Route path="/umetnici" element={<Umetnici />} />
          <Route path="/favoriti" element={<Favoriti />} />

        </Routes>
        <Footer />
      </Router>
    </div>
  );


  
}



export default App;
