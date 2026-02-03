import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="artify-footer-simple">
      <div className="footer-simple-inner">
        <div className="footer-simple-left">
          <div className="footer-simple-logo">Artify</div>
          <div className="footer-simple-text">
            Digitalna galerija za savremenu umetnost
          </div>
        </div>

        {/* SOCIAL ICONS */}
        <nav className="footer-socials" aria-label="Društvene mreže">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
        </nav>
      </div>

      <div className="footer-simple-bottom">
        © {new Date().getFullYear()} Artify
      </div>
    </footer>
  );
}
