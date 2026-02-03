import React from "react";
import "./About.css";

export default function ONama() {
  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-bg" aria-hidden="true">
          <div className="about-blob b1" />
          <div className="about-blob b2" />
          <div className="about-blob b3" />
        </div>

        <div className="about-container">
          <div className="about-hero-inner">
            <div className="about-hero-left">
              <div className="about-badge">ARTIFY • O nama</div>
              <h1 className="about-title">
                Gde umetnost dobija <span>prostor</span> koji zaslužuje.
              </h1>
              <p className="about-subtitle">
                Artify je digitalna galerija za umetnike i kolekcionare — čist
                dizajn, jasne informacije i iskustvo koje stavlja delo u prvi plan.
              </p>

              <div className="about-hero-actions">
                <a className="about-btn primary" href="#misija">
                  Naša misija
                </a>
                <a className="about-btn ghost" href="#kontakt">
                  Kontakt
                </a>
              </div>

              <div className="about-stats">
                <div className="about-stat">
                  <div className="about-stat-top">Dela</div>
                  <div className="about-stat-sub">Tip • tehnika • stil</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-top">Umetnici</div>
                  <div className="about-stat-sub">Portfolio u fokusu</div>
                </div>
                <div className="about-stat">
                  <div className="about-stat-top">Poverenje</div>
                  <div className="about-stat-sub">Jasni detalji</div>
                </div>
              </div>
            </div>

            <div className="about-hero-right">
              <div className="about-hero-frame">
                <img
                  src="/images/artspark.jpg"
                  alt="Artify tim"
                  className="about-hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="about-container">
        <div className="about-grid">
          {/* MISIJA */}
          <section id="misija" className="about-card">
            <div className="about-card-head">
              <h2>Misija</h2>
              <span className="about-pill">Za umetnike & kolekcionare</span>
            </div>
            <p>
              U <strong>Artify</strong>-ju verujemo da umetnost treba da bude
              dostupna, pregledna i predstavljena sa poštovanjem. Zato gradimo
              platformu koja povezuje autore i ljubitelje umetnosti, bez šuma i
              nepotrebnih barijera.
            </p>
            <p>
              Želimo da umetnicima olakšamo da predstave i prodaju radove, a
              kupcima da otkriju originalna dela sa jasnim informacijama i
              osećajem sigurnosti.
            </p>
          </section>

          {/* VIZIJA */}
          <section className="about-card">
            <div className="about-card-head">
              <h2>Vizija</h2>
              <span className="about-pill">Umetnost na klik</span>
            </div>
            <p>
              Naša vizija je da Artify postane mesto gde se umetnost otkriva kao
              u galeriji: sporije, lepše i smislenije — bilo da kupuješ prvi rad
              ili gradiš kolekciju godinama.
            </p>
            <p>
              Tehnologija je tu da pomogne, ali fokus ostaje na onome najvažnijem:
              <strong> delu, autoru i priči</strong>.
            </p>
          </section>

          {/* GALERIJA */}
          <section className="about-card about-card-wide">
            <div className="about-card-head">
              <h2>Inspiracija</h2>
              <span className="about-pill">Detalji • teksture • svetlo</span>
            </div>

            <div className="about-gallery">
              <div className="about-image">
                <img src="/images/art1.jpg" alt="Artwork 1" />
              </div>
              <div className="about-image">
                <img src="/images/art2.jpg" alt="Artwork 2" />
              </div>
              <div className="about-image">
                <img src="/images/art3.jpg" alt="Artwork 3" />
              </div>
              <div className="about-image">
                <img src="/images/art4.jpg" alt="Artwork 4" />
              </div>
            </div>
          </section>

          {/* KO SMO MI */}
          <section className="about-card">
            <div className="about-card-head">
              <h2>Ko smo mi</h2>
              <span className="about-pill">ArtSpark</span>
            </div>
            <p>
              <strong>Artify</strong> je projekat koji razvija <em>ArtSpark</em> —
              tim studenata, developera i ljubitelja umetnosti. Spajamo dizajn i
              tehnologiju kako bi umetnost dobila moderan prostor.
            </p>
            <p>
              Verujemo da umetnost inspiriše, povezuje i menja perspektivu — i
              želimo da to iskustvo bude bliže svima.
            </p>
          </section>

          {/* KONTAKT */}
          <section id="kontakt" className="about-card">
            <div className="about-card-head">
              <h2>Kontakt</h2>
              <span className="about-pill">Tu smo</span>
            </div>

            <div className="about-contact">
              <div className="about-contact-row">
                <span className="about-contact-label">Email</span>
                <span className="about-contact-value">artify_support@gmail.com</span>
              </div>

              <div className="about-contact-row">
                <span className="about-contact-label">Telefon</span>
                <span className="about-contact-value">+381 65 123 4567</span>
              </div>

              <div className="about-contact-row">
                <span className="about-contact-label">Adresa</span>
                <span className="about-contact-value">Kralja Petra 10, Novi Pazar</span>
              </div>

              <p className="about-contact-note">
                Ako imaš pitanje ili predlog — piši nam. Volimo feedback.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
