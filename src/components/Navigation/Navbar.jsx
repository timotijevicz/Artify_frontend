import React, {useState, useEffect} from 'react'
import {Link, useLocation} from 'react-router-dom';
import './Navbar.css';
import { jwtDecode } from "jwt-decode";


export default function Navbar() {
    const location = useLocation(); // Hook za praćenje trenutne rute
    const [button, setButton] = useState(true); //pracenje da li se pokazuje dugme za mobilni meni
    const [click, setClick] = useState(false); // Praćenje stanja menija za mobilne uređaje
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Praćenje statusa prijavljenosti korisnika
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Praćenje stanja profila menija
    const [isKupacRole, setIsKupacRole] = useState(false); // Da li korisnik ima ulogu "User"
    const [isUmetnikRole, setisUmetnikRole] = useState(false); // Da li korisnik ima ulogu "Umetnik"
    const [isAdminRole, setIsAdminRole] = useState(false); // Da li korisnik ima ulogu "Admin"


    const checkRole = async () => {
      const token = localStorage.getItem("authToken"); //uzimanje tokena iz localstotage
      if (token) {
          try{
              const decodedToken = jwtDecode (token);
              const roles = 
              decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; //uzimamo ulogu
            if (roles === "Kupac") setIsKupacRole(true); 
            if (roles === "Umetnik") setisUmetnikRole (true);
            if (roles === "Admin") setIsAdminRole(true);

          }
          catch(greska){
            console.error("Pri dekodiranju tokena javila se greška", greska);
            localStorage.removeItem("authToken");
          }
        }
    };
    
    // Funkcija za rukovanje klikom na meni
    const handleClick = () => setClick(!click); //prebacivanje sstanje menija (otvoren/yatvoren)
    const closeMobileMenu = () => setClick(false); //zatvara mobilni meni

  

    //funkcija koja podesava vidljivost dugmeta u zavisnosti od sirine egrana
    const showButton = () => {
        if(window.innerWidth <= 960){
            setButton(false); //sakriva dugme za desktop ekrane
        }else{
            setButton(true); // prikazuje dugme za mobilne aplikacije
        }
    };

    const checkLoginStatus = async () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token); //ako postoji korinsik je prijavljen
      console.log(token); //ispisuje token u konzoli (korisno za debugging)
    }

    const handleLogout = () => {
      localStorage.removeItem('authToken'); // brise token prilikom odjave
      setIsLoggedIn(false); //postavlja status prijavljenosti na 'false'
      setIsKupacRole(false);
      setisUmetnikRole(false);
      setIsAdminRole(false);
    }

    const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen); // Prebacuje stanje menija profila



    useEffect(() => {
      checkRole(); //proverava ulogu pri inicijalizaciji komponente
      checkLoginStatus(); //proverava status prijavljenosti pri inicijalizaciji
      showButton(); //proverava velicinu prozora pri ucitavanju
      window.addEventListener('resize', showButton); // dodaje event listener za promenu velicine prozora

      return () => window.removeEventListener('resize', showButton); // Čisti event listener prilikom demontiranja
    }, []);

    const isActive = (path) => Location.pathname == path; //proverava da li je ruta aktivna

    return (
      <>
          <nav className='navbar'>
              <div className='navbar-container'>
                {/* logo navigacije */}
                <Link to= '/' className = 'navbar-logo'>
                Artify <i className= 'fas fa-thin fa-palette' > </i>
                </Link>
                {/* Ikonica menij*/}
                <div className="menu-icon" onClick={handleClick}>
                      <i className={click ? 'fas fa-light fa-times' : ' fas fa-light fa-bars'}></i>
                </div>

                
                <ul className={click ? 'nav-menu active' : 'nav-menu'} >
                  <li className='nav-item'>
                    <Link to='/home' className= 'nav-links' onClick = {closeMobileMenu} >
                      Home
                    </Link>
                  </li>

                  <li className='nav-item'>
                    <Link to='/galerija' className = 'nav-links' onClick = {closeMobileMenu} >
                      Glerija 
                    </Link>
                  </li>

                  <li className='nav-item'>
                    <Link to='/ONama' className = 'nav-links' onClick = {closeMobileMenu} >
                      O nama
                    </Link>
                  </li>

                  <li className='nav-item'>
                    <Link to='/kontakt' className = 'nav-links' onClick = {closeMobileMenu} >
                      Kontakt
                    </Link>
                  </li>
                  

                  {/* ono sto vidi kupac */}
                  {isKupacRole && (
                    <li className='nav-item'>
                      <Link to='/porudzbine' className='nav-links' onClick={closeMobileMenu} >
                          Moje porudzbine
                      </Link>
                    </li>
                  )}

                  {/* umetnik da pregleda svoje radove */}
                  {isUmetnikRole && (
                    <li className='nav-item'>
                      <Link to='/mojiradovi' className='nav-linkc' onClick={closeMobileMenu}>
                        Moji Radovi
                      </Link>
                    </li>
                  )}

                  {/* admin da pregleda svoj panel */}
                  {isAdminRole && (
                    <li className='nav-item'>
                      <Link to='/admin' className='nav-links' onClick={closeMobileMenu}>
                        Admin panel
                      </Link>
                    </li>
                  )}

                </ul>
                <div className='auth-section'>
                  {isLoggedIn ? (
                    <div className='profile-section'>
                      <button className='profile-btn' onClick={toggleProfileMenu}>
                        <i className='fas fa-user'></i>
                      </button>
                      {profileMenuOpen && (
                        <div className='profile-dropdown'>
                          <Link to='/profil' onClick={toggleProfileMenu}>
                            Moj Profil
                          </Link>
                          <button onClick={handleClick}>
                            Odjava
                          </button>
                        </div>
                      )}
                    </div>  
                  ):(
                      <div className='auth-buttons'>
                        <Link to='/prijava' className='btn-login' >
                          Prijava
                        </Link>
                        <Link to='/registracija' className='btn-register'>
                          Registracija
                        </Link>
                      </div>
                  )}
                </div>
              </div>
          </nav>
      </>
    );
  }


